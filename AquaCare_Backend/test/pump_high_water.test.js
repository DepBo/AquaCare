const test = require('node:test');
const assert = require('node:assert/strict');
const { stopPumpAtHighWater, isHighWaterNow } = require('../pump_high_water');
const { createScheduleChecker } = require('../timer_worker');

test('[RELAY-AUTO-OFF-HIGH-WATER] stopPumpAtHighWater turns off active hardware pump, updates DB and logs AUTO OFF', async () => {
  const published = [];
  const logs = [];
  const state = { is_active: true, relay_pump_state: true };
  const mqttClient = {
    connected: true,
    publish(topic, payload, options, cb) {
      published.push({ topic, payload: JSON.parse(payload), options });
      cb(null);
    },
  };
  const supabase = {
    from(table) {
      if (table === 'devices') {
        return {
          select() {
            return {
              eq() {
                return { async single() { return { data: { ...state }, error: null }; } };
              },
            };
          },
          update(values) {
            return {
              async eq() {
                Object.assign(state, values);
                return { error: null };
              },
            };
          },
        };
      }
      if (table === 'relay_logs') {
        return {
          async insert(entry) {
            logs.push(entry);
            return { error: null };
          },
        };
      }
      throw new Error(`Unexpected table ${table}`);
    },
  };

  const device = { id: 101, tank_id: 10, mac_address: 'HW:01', is_simulator: false };
  const stopped = await stopPumpAtHighWater({ supabase, mqttClient, device, water: true, logger: { log() {}, error() {} } });
  assert.equal(stopped, true);
  assert.equal(state.relay_pump_state, false);
  assert.deepEqual(published.map(p => ({ topic: p.topic, payload: p.payload })), [
    { topic: 'iras-rag/command/HW:01', payload: { pin: 3, cmd: 'ON' } },
  ]);
  assert.deepEqual(logs, [
    { device_id: 101, relay_name: 'Pump', action: 'OFF', triggered_by: 'AUTO' },
  ]);

  // Repeated wet reading while already OFF and commanded should not spam MQTT or logs
  const repeated = await stopPumpAtHighWater({ supabase, mqttClient, device, water: true, logger: { log() {}, error() {} } });
  assert.equal(repeated, false);
  assert.equal(published.length, 1);
  assert.equal(logs.length, 1);
});

test('stopPumpAtHighWater ignores simulator devices and non-wet readings', async () => {
  const published = [];
  const mqttClient = {
    connected: true,
    publish(topic, payload, _opts, cb) {
      published.push({ topic, payload });
      cb(null);
    },
  };
  const supabase = {
    from() {
      throw new Error('Should not query DB for simulator or non-wet readings');
    },
  };

  assert.equal(
    await stopPumpAtHighWater({
      supabase,
      mqttClient,
      device: { id: 102, tank_id: 11, mac_address: 'SIM:01', is_simulator: true },
      water: true,
    }),
    false,
  );
  assert.equal(
    await stopPumpAtHighWater({
      supabase,
      mqttClient,
      device: { id: 103, tank_id: 12, mac_address: 'HW:02', is_simulator: false },
      water: null,
    }),
    false,
  );
  assert.equal(published.length, 0);
});

test('[SCH-02] timer worker skips Pump ON schedule when hardware Y26 is at high water, and runs when below threshold', async () => {
  let latestWaterOk = true;
  const published = [];
  const logs = [];
  const scheduleRow = {
    id: 99,
    relay_name: 'Pump',
    device_id: 104,
    devices: {
      id: 104,
      tank_id: 13,
      mac_address: 'HW:03',
      is_active: true,
      is_simulator: false,
      relay_pump_state: false,
      relay_light_state: false,
      relay_aerator_state: false,
    },
    is_active: true,
    is_daily: true,
    run_date: null,
    on_time: '10:05:00',
    off_time: null,
    on_executed_on: null,
    off_executed_on: null,
  };

  const mqttClient = {
    connected: true,
    publish(topic, payload, _opts, cb) {
      published.push({ topic, payload: JSON.parse(payload) });
      cb(null);
    },
  };
  const supabase = {
    from(table) {
      if (table === 'device_schedules') {
        return {
          select() { return { async eq() { return { data: [scheduleRow], error: null }; } }; },
          update(values) {
            return {
              async eq() {
                Object.assign(scheduleRow, values);
                return { error: null };
              },
            };
          },
        };
      }
      if (table === 'telemetry_logs') {
        return {
          select() {
            return {
              eq() {
                return {
                  order() {
                    return {
                      async limit() {
                        return { data: [{ water_level_ok: latestWaterOk }], error: null };
                      },
                    };
                  },
                };
              },
            };
          },
        };
      }
      if (table === 'devices') {
        return {
          update(values) {
            return {
              async eq() {
                Object.assign(scheduleRow.devices, values);
                return { error: null };
              },
            };
          },
        };
      }
      if (table === 'relay_logs') {
        return {
          async insert(entry) {
            logs.push(entry);
            return { error: null };
          },
        };
      }
      throw new Error(`Unexpected table ${table}`);
    },
  };

  assert.equal(await isHighWaterNow(supabase, 104), true);
  const check = createScheduleChecker({
    supabase,
    mqttClient,
    now: () => new Date('2026-10-01T03:05:10Z'),
    logger: { log() {}, error() {} },
  });

  await check();
  assert.equal(published.length, 0);
  assert.equal(scheduleRow.on_executed_on, null);
  assert.equal(scheduleRow.devices.relay_pump_state, false);

  latestWaterOk = false;
  assert.equal(await isHighWaterNow(supabase, 104), false);
  await check();
  assert.deepEqual(published.map(p => p.payload), [{ pin: 3, cmd: 'OFF' }]);
  assert.equal(scheduleRow.on_executed_on, '2026-10-01');
  assert.equal(scheduleRow.devices.relay_pump_state, true);
  assert.deepEqual(logs.map(l => l.action), ['ON']);
});
