const { samples, incidents, dailyEvent } = require('./routes/demo-telemetry');
const { getSpeciesThresholds } = require('./config/species_thresholds');

function startSimulatorAlertWorker({ supabase, notifyTank, now = Date.now, intervalMs = 60000 }) {
  let running = false;
  let stopped = false;
  async function run() {
    if (running || stopped) return;
    running = true;
    try {
      const seen = new Set();
      for (let offset = 0; !stopped; offset += 100) {
        const { data: devices, error } = await supabase.from('devices')
          .select('id,tank_id,tanks!inner(id,created_at)')
          .eq('is_simulator', true).eq('is_active', true).order('id').range(offset, offset + 99);
        if (error) throw error;
        for (const device of devices || []) {
          if (stopped) break;
          const tank = Array.isArray(device.tanks) ? device.tanks[0] : device.tanks;
          if (!tank || seen.has(tank.id)) continue;
          seen.add(tank.id);
          try {
            const currentTime = now();
            const origin = Date.parse(tank.created_at);
            if (!Number.isFinite(origin) || currentTime < origin) continue;
            const latest = origin + Math.floor((currentTime - origin) / 60000) * 60000;
            const event = dailyEvent(tank.id, latest);
            if (!event) continue;
            const thresholds = await getSpeciesThresholds(supabase, tank.id);
            const rows = samples(tank, latest, { limit: 1 }, thresholds);
            const alerts = incidents(rows, thresholds).map(event => ({
              label: event.alert_type, severity: event.severity === 'Nguy hiểm' ? 'Danger' : 'Warn',
              msg: event.alert_type + ' ở mức ' + event.actual_value,
            }));
            await notifyTank(tank.id, alerts, { simulator: true, incidentStart: event.start });
          } catch (error) {
            console.error('[Simulator alerts] Tank', tank.id, error.message);
          }
        }
        if (!devices || devices.length < 100) break;
      }
    } catch (error) {
      console.error('[Simulator alerts]', error.message);
    } finally {
      running = false;
    }
  }
  const timer = setInterval(run, intervalMs);
  timer.unref?.();
  void run();
  return { run, stop() { stopped = true; clearInterval(timer); } };
}

module.exports = { startSimulatorAlertWorker };
