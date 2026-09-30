const RELAYS = [
  { name: 'Pump', key: 'pump', field: 'relay_pump_state', pin: 3 },
  { name: 'Light', key: 'light', field: 'relay_light_state', pin: 1 },
  { name: 'Aerator', key: 'aerator', field: 'relay_aerator_state', pin: 2 },
];

function vietnamMinute(date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(date).map(({ type, value }) => [type, value]),
  );
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

function publishCommand(mqttClient, topic, payload) {
  return new Promise((resolve, reject) => {
    mqttClient.publish(topic, JSON.stringify(payload), { qos: 1 }, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

function createScheduleChecker({ supabase, mqttClient, now = () => new Date(), logger = console }) {
  const processed = new Map();
  let checking = false;

  return async function checkSchedules() {
    if (checking || !mqttClient.connected) return;
    checking = true;
    try {
      const minute = vietnamMinute(now());
      const time = minute.slice(-5);
      for (const key of processed.keys()) {
        if (!key.startsWith(`${minute}:`)) processed.delete(key);
      }

      const { data: devices, error } = await supabase.from('devices').select('*');
      if (error) throw error;

      for (const device of devices || []) {
        if (!device.is_active || !device.tank_id || !device.mac_address) continue;
        for (const relay of RELAYS) {
          const onDue = device[`${relay.key}_on_time`] === time;
          const offDue = device[`${relay.key}_off_time`] === time;
          if (!onDue && !offDue) continue;

          // When both times are equal, switch off to avoid contradictory commands.
          const desiredState = offDue ? false : true;
          const key = `${minute}:${device.id}:${relay.key}`;
          const progress = processed.get(key);
          if (progress?.complete || (!progress && device[relay.field] === desiredState)) continue;

          try {
            if (!progress?.published) {
              await publishCommand(mqttClient, `iras-rag/command/${device.mac_address}`, {
                pin: relay.pin, cmd: desiredState ? 'ON' : 'OFF',
              });
              processed.set(key, { published: true });
            }

            const { error: updateError } = await supabase.from('devices')
              .update({ [relay.field]: desiredState }).eq('id', device.id);
            if (updateError) throw updateError;

            processed.set(key, { published: true, complete: true });
            const { error: logError } = await supabase.from('relay_logs').insert({
              device_id: device.id,
              relay_name: relay.name,
              action: desiredState ? 'ON' : 'OFF',
              triggered_by: 'AUTO',
            });
            if (logError) logger.error('Không thể ghi relay log:', logError);
          } catch (relayError) {
            logger.error(`Không thể chạy lịch ${relay.key} cho thiết bị ${device.id}:`, relayError);
          }
        }
      }
    } catch (error) {
      logger.error('Không thể kiểm tra lịch thiết bị:', error);
    } finally {
      checking = false;
    }
  };
}

function startTimerWorker(dependencies) {
  const checkSchedules = createScheduleChecker(dependencies);
  const interval = setInterval(checkSchedules, 10000);
  void checkSchedules();
  return interval;
}

module.exports = { createScheduleChecker, startTimerWorker, vietnamMinute };
