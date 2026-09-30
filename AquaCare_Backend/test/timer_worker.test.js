const test = require('node:test');
const assert = require('node:assert/strict');
const { createScheduleChecker, vietnamMinute } = require('../timer_worker');

function harness(device, { failUpdateOnce = false } = {}) {
  const published = [];
  const updates = [];
  const logs = [];
  const mqttClient = {
    connected: true,
    publish(topic, payload, options, done) {
      published.push({ topic, payload: JSON.parse(payload), options });
      done(null);
    },
  };
  const supabase = {
    from(table) {
      if (table === 'devices') return {
        async select() { return { data: [device], error: null }; },
        update(values) { return { async eq(_field, id) {
          updates.push({ id, values });
          if (failUpdateOnce) {
            failUpdateOnce = false;
            return { error: new Error('temporary database failure') };
          }
          Object.assign(device, values);
          return { error: null };
        } }; },
      };
      return { async insert(values) { logs.push(values); return { error: null }; } };
    },
  };
  return { published, updates, logs, mqttClient, supabase };
}

test('runs all three relays in Vietnam time and publishes once per minute', async () => {
  const device = {
    id: 7, tank_id: 2, mac_address: 'AA:BB', is_active: true,
    pump_on_time: '10:05', light_on_time: '10:05', aerator_on_time: '10:05',
    relay_pump_state: false, relay_light_state: false, relay_aerator_state: false,
  };
  const h = harness(device);
  const now = () => new Date('2026-09-30T03:05:10.000Z');
  assert.equal(vietnamMinute(now()), '2026-09-30 10:05');
  const check = createScheduleChecker({ ...h, now });
  await check();
  await check();

  assert.deepEqual(h.published.map(({ payload }) => payload), [
    { pin: 3, cmd: 'ON' }, { pin: 1, cmd: 'ON' }, { pin: 2, cmd: 'ON' },
  ]);
  assert.equal(h.updates.length, 3);
  assert.equal(h.logs.length, 3);
  assert.ok(h.published.every(({ topic, options }) =>
    topic === 'iras-rag/command/AA:BB' && options.qos === 1));
});

test('skips disconnected and inactive devices', async () => {
  const device = {
    id: 7, tank_id: 2, mac_address: 'AA:BB', is_active: false,
    aerator_off_time: '10:05', relay_aerator_state: true,
  };
  const h = harness(device);
  const check = createScheduleChecker({ ...h, now: () => new Date('2026-09-30T03:05:10Z') });
  await check();
  h.mqttClient.connected = false;
  device.is_active = true;
  await check();
  assert.equal(h.published.length, 0);
});

test('retries database update without publishing a second OFF command', async () => {
  const device = {
    id: 7, tank_id: 2, mac_address: 'AA:BB', is_active: true,
    aerator_off_time: '10:05', relay_aerator_state: true,
  };
  const h = harness(device, { failUpdateOnce: true });
  const check = createScheduleChecker({
    ...h,
    now: () => new Date('2026-09-30T03:05:10Z'),
    logger: { error() {} },
  });
  await check();
  await check();
  assert.deepEqual(h.published.map(({ payload }) => payload), [{ pin: 2, cmd: 'OFF' }]);
  assert.equal(h.updates.length, 2);
  assert.equal(device.relay_aerator_state, false);
  assert.equal(h.logs.length, 1);
});
