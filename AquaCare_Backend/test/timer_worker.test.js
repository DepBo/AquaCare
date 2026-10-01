const test = require('node:test');
const assert = require('node:assert/strict');
const { createScheduleChecker, vietnamMinute, dueAction } = require('../timer_worker');

function harness(schedules, { failDeviceUpdateOnce = false } = {}) {
  const published = [], logs = [];
  const mqttClient = {
    connected: true,
    publish(topic, payload, options, done) {
      published.push({ topic, payload: JSON.parse(payload), options });
      done(null);
    },
  };
  const supabase = {
    from(table) {
      if (table === 'device_schedules') return {
        select() { return { async eq() { return { data: schedules.filter(s => s.is_active), error: null }; } }; },
        update(values) { return { async eq(_field, id) {
          Object.assign(schedules.find(s => s.id === id), values);
          return { error: null };
        } }; },
      };
      if (table === 'devices') return {
        update(values) { return { async eq(_field, id) {
          if (failDeviceUpdateOnce) {
            failDeviceUpdateOnce = false;
            return { error: new Error('temporary failure') };
          }
          for (const schedule of schedules) if (schedule.devices.id === id) Object.assign(schedule.devices, values);
          return { error: null };
        } }; },
      };
      if (table === 'relay_logs') return {
        async insert(value) { logs.push(value); return { error: null }; },
      };
      throw new Error(`unexpected table ${table}`);
    },
  };
  return { published, logs, mqttClient, supabase };
}

const device = () => ({
  id: 7, tank_id: 2, mac_address: 'AA:BB', is_active: true,
  relay_pump_state: false, relay_light_state: false, relay_aerator_state: false,
});
const schedule = (id, relay_name, props = {}) => ({
  id, relay_name, device_id: 7, devices: device(), is_active: true,
  is_daily: false, run_date: '2026-10-01', on_time: '10:05:00', off_time: null,
  on_executed_on: null, off_executed_on: null, ...props,
});

test('one-time ON runs once and only logs the actual command', async () => {
  const s = schedule(1, 'Pump');
  const h = harness([s]);
  const now = () => new Date('2026-10-01T03:05:10Z');
  assert.equal(vietnamMinute(now()), '2026-10-01 10:05');
  const check = createScheduleChecker({ ...h, now });
  await check(); await check();
  assert.equal(s.is_active, false);
  assert.equal(s.on_executed_on, '2026-10-01');
  assert.deepEqual(h.published.map(x => x.payload), [{ pin: 3, cmd: 'ON' }]);
  assert.deepEqual(h.logs.map(x => x.action), ['ON']);
});

test('daily schedule runs on a new day, not twice in one minute', async () => {
  const s = schedule(2, 'Light', { is_daily: true, run_date: null });
  const h = harness([s]);
  let instant = '2026-10-01T03:05:10Z';
  const check = createScheduleChecker({ ...h, now: () => new Date(instant) });
  await check(); await check();
  assert.equal(h.published.length, 1);
  assert.equal(s.is_active, true);
  s.devices.relay_light_state = false;
  instant = '2026-10-02T03:05:10Z';
  await check();
  assert.equal(h.published.length, 2);
  assert.deepEqual(h.logs.map(x => x.action), ['ON', 'ON']);
});

test('one-time OFF across midnight uses following date', () => {
  const s = schedule(3, 'Aerator', { on_time: '23:30:00', off_time: '00:30:00' });
  assert.equal(dueAction(s, '2026-10-01', '00:30'), null);
  assert.deepEqual(dueAction(s, '2026-10-02', '00:30'),
    { state: false, executedField: 'off_executed_on' });
});

test('one-time schedule tolerates a one-minute delay but does not replay old events', () => {
  const s = schedule(6, 'Pump');
  assert.deepEqual(dueAction(s, '2026-10-01', '10:06'),
    { state: true, executedField: 'on_executed_on' });
  assert.equal(dueAction(s, '2026-10-01', '10:08'), null);
  assert.equal(dueAction(s, '2026-10-02', '10:05'), null);
});

test('retries database update without republishing or double logging', async () => {
  const s = schedule(4, 'Aerator', { on_time: null, off_time: '10:05:00' });
  s.devices.relay_aerator_state = true;
  const h = harness([s], { failDeviceUpdateOnce: true });
  const check = createScheduleChecker({
    ...h, now: () => new Date('2026-10-01T03:05:10Z'), logger: { error() {} },
  });
  await check(); await check();
  assert.equal(h.published.length, 1);
  assert.equal(h.logs.length, 1);
  assert.equal(s.is_active, false);
});

test('inactive devices and disconnected MQTT do not run schedules', async () => {
  const s = schedule(5, 'Pump');
  s.devices.is_active = false;
  const h = harness([s]);
  const check = createScheduleChecker({ ...h, now: () => new Date('2026-10-01T03:05:10Z') });
  await check();
  s.devices.is_active = true;
  h.mqttClient.connected = false;
  await check();
  assert.equal(h.published.length, 0);
  assert.equal(h.logs.length, 0);
});
