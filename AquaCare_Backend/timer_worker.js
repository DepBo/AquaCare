const RELAYS = {
  Pump: { field: 'relay_pump_state', pin: 3 },
  Light: { field: 'relay_light_state', pin: 1 },
  Aerator: { field: 'relay_aerator_state', pin: 2 },
};

function vietnamMinute(date) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).map(({ type, value }) => [type, value]));
  return `${parts.year}-${parts.month}-${parts.day} ${parts.hour}:${parts.minute}`;
}

function nextDate(date) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + 1);
  return value.toISOString().slice(0, 10);
}

function dueAction(schedule, date, time) {
  const onTime = schedule.on_time?.slice(0, 5);
  const offTime = schedule.off_time?.slice(0, 5);
  const offDate = schedule.is_daily ? date :
    onTime && offTime && offTime <= onTime ? nextDate(schedule.run_date) : schedule.run_date;
  const dueNow = (eventDate, eventTime) => {
    if (!eventTime) return false;
    if (schedule.is_daily) return eventTime === time;
    const nowMinute = Date.parse(`${date}T${time}:00Z`);
    const eventMinute = Date.parse(`${eventDate}T${eventTime}:00Z`);
    return nowMinute >= eventMinute && nowMinute - eventMinute <= 120000;
  };
  const onDue = dueNow(schedule.run_date, onTime)
    && schedule.on_executed_on !== date;
  const offDue = dueNow(offDate, offTime)
    && schedule.off_executed_on !== date;
  if (offDue) return { state: false, executedField: 'off_executed_on' };
  if (onDue) return { state: true, executedField: 'on_executed_on' };
  return null;
}

function publishCommand(mqttClient, topic, payload) {
  return new Promise((resolve, reject) => {
    mqttClient.publish(topic, JSON.stringify(payload), { qos: 1 }, error => error ? reject(error) : resolve());
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
      const date = minute.slice(0, 10);
      const time = minute.slice(-5);
      for (const key of processed.keys()) if (!key.startsWith(`${minute}:`)) processed.delete(key);

      const { data: schedules, error } = await supabase.from('device_schedules')
        .select('*, devices(id, tank_id, mac_address, is_active, relay_pump_state, relay_light_state, relay_aerator_state)')
        .eq('is_active', true);
      if (error) throw error;

      for (const schedule of schedules || []) {
        const device = schedule.devices;
        const relay = RELAYS[schedule.relay_name];
        if (!relay || !device?.is_active || !device.tank_id || !device.mac_address) continue;
        const due = dueAction(schedule, date, time);
        if (!due) continue;
        const key = `${minute}:${schedule.id}:${schedule.updated_at}:${due.executedField}`;
        const progress = processed.get(key) || {};
        if (progress.complete) continue;

        try {
          const needsCommand = device[relay.field] !== due.state;
          if (needsCommand && !progress.published) {
            await publishCommand(mqttClient, `iras-rag/command/${device.mac_address}`, {
              pin: relay.pin, cmd: due.state ? 'ON' : 'OFF',
            });
            processed.set(key, { published: true });
          }
          if (needsCommand) {
            const { error: updateError } = await supabase.from('devices')
              .update({ [relay.field]: due.state }).eq('id', device.id);
            if (updateError) throw updateError;
          }

          if ((needsCommand || progress.published) && !progress.logged) {
            const { error: logError } = await supabase.from('relay_logs').insert({
              device_id: device.id, relay_name: schedule.relay_name,
              action: due.state ? 'ON' : 'OFF', triggered_by: 'AUTO',
            });
            if (logError) throw logError;
            processed.set(key, { published: true, logged: true });
          }
          const finished = !schedule.is_daily &&
            (due.executedField === 'off_executed_on' || !schedule.off_time);
          const { error: scheduleError } = await supabase.from('device_schedules')
            .update({ [due.executedField]: date, ...(finished ? { is_active: false } : {}) })
            .eq('id', schedule.id);
          if (scheduleError) throw scheduleError;
          processed.set(key, { published: true, logged: true, complete: true });
        } catch (relayError) {
          logger.error(`Không thể chạy lịch ${schedule.relay_name} cho thiết bị ${device.id}:`, relayError);
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

module.exports = { createScheduleChecker, startTimerWorker, vietnamMinute, dueAction };
