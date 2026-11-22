const MINUTE = 60_000;

// Two non-overlapping windows within the Vietnamese calendar day.
function dailyEvent(tankId, timestamp) {
  const localMinute = Math.floor(timestamp / MINUTE) + 420;
  const day = Math.floor(localMinute / 1440);
  const minute = localMinute % 1440;
  const slot = Math.floor(minute / 720);
  const seed = Math.imul(Number(tankId), 2654435761) ^ Math.imul(day, 2246822519);
  const hash = Math.imul(seed ^ (seed >>> 16) ^ slot, 1597334677) >>> 0;
  if (slot >= (seed >>> 0) % 3) return null;
  const elapsed = minute % 720 - (10 + hash % 680);
  if (elapsed < 0 || elapsed >= 5) return null;
  return { metric: ['ph','temp','tds','water_level_ok'][(hash >>> 12) % 4],
    danger: (hash >>> 16) % 3 === 0, start: timestamp - elapsed * MINUTE };
}

function samples(tank, now, { from = -Infinity, until = Infinity, limit = 720 } = {}, thresholds) {
  const origin = Date.parse(tank.created_at);
  if (!Number.isFinite(origin)) throw new Error('Invalid tank creation time');
  const last = Math.floor((Math.min(now, until) - origin) / MINUTE);
  const first = Math.max(0, last - limit + 1, Math.ceil((from - origin) / MINUTE));
  const phase = Number(tank.id) * 2.39996;
  const rows = [];
  for (let i = first; i <= last; i++) {
    const wave = Math.sin(i / 53 + phase);
    const ripple = Math.sin(i / 7 + phase * 3);
    const timestamp = origin + i * MINUTE;
    const event = dailyEvent(tank.id, timestamp);
    const row = { id: i, recorded_at: new Date(timestamp).toISOString(), water_level_ok: event?.metric !== 'water_level_ok' };
    for (const [index, key] of ['ph', 'temp', 'tds'].entries()) {
      const { good: [min, max], warn } = thresholds[key];
      const mid = (min + max) / 2;
      const variation = (0.15 * wave + 0.05 * ripple + 0.05 * Math.sin(i / 23 + index)) * (max - min);
      const value = event?.metric === key
        ? (event.danger ? warn[1] + (key === 'tds' ? 5 : 0.2) : (max + warn[1]) / 2)
        : mid + variation;
      const rounded = Number(value.toFixed(key === 'tds' ? 0 : 2));
      row[key] = event?.metric === key ? rounded : Math.min(max, Math.max(min, rounded));
    }
    rows.push(row);
  }
  return rows;
}

function incidents(rows, thresholds) {
  const result = [];
  const metrics = { ph: 'pH', temp: 'Nhiệt độ', tds: 'TDS', water_level_ok: 'Mực nước' };
  for (const [key, name] of Object.entries(metrics)) {
    let open;
    let worst = 0;
    for (const row of rows) {
      const value = Number(row[key]);
      const bounds = thresholds[key];
      const deviation = bounds ? Math.max(bounds.good[0] - value, value - bounds.good[1], 0) : 1 - value;
      if (!deviation) {
        if (open) open.ended_at = row.recorded_at;
        open = null;
        worst = 0;
        continue;
      }
      if (!open) {
        open = { id: row.id * 4 + Object.keys(metrics).indexOf(key), alert_type: name,
          created_at: row.recorded_at, actual_value: value, ended_at: null, is_read: true };
        result.push(open);
      }
      if (deviation >= worst) {
        open.actual_value = value;
        worst = deviation;
      }
      if (!bounds || value < bounds.warn[0] || value > bounds.warn[1]) open.severity = 'Nguy hiểm';
      else open.severity ??= 'Cảnh báo';
    }
  }
  for (const event of result) {
    event.alert_message = `Mô phỏng · ${event.alert_type}: ${event.actual_value} · ${event.severity}`;
  }
  return result.sort((a, b) => b.id - a.id);
}

function demoTelemetry(db, alerts = false) {
  return async (req, res) => {
    res.set('Cache-Control', 'private, no-store');
    const token = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '')?.[1];
    if (!token) return res.sendStatus(401);
    const { from, until, limit = 720 } = req.query;
    const options = { limit: Number(limit) };
    if (from !== undefined) options.from = Date.parse(from);
    if (until !== undefined) options.until = Date.parse(until);
    if (!Object.values(options).every(Number.isFinite) || !Number.isInteger(options.limit)
      || options.limit < 1 || options.limit > 1000 || !/^\d+$/.test(req.params.id)) return res.sendStatus(400);
    try {
      const { data: auth, error } = await db.auth.getUser(token);
      if (error || !auth.user) return res.sendStatus(401);
      const result = await db.from('tanks').select('id,created_at,devices!inner(is_active)')
        .eq('id', req.params.id).eq('user_id', auth.user.id)
        .eq('devices.is_simulator', true).maybeSingle();
      if (result.error) throw result.error;
      if (!result.data) return res.sendStatus(404);
      const devices = Array.isArray(result.data.devices)
        ? result.data.devices
        : [result.data.devices];
      const active = devices.some(device => device?.is_active === true);
      if (!active) return res.json([]);
      const thresholds = await require('../config/species_thresholds').getSpeciesThresholds(db, req.params.id);
      const rows = samples(result.data, Date.now(), alerts ? {} : options, thresholds);
      return res.json(alerts ? incidents(rows, thresholds) : rows);
    } catch (error) {
      console.error('[demo telemetry]', error.message);
      return res.sendStatus(500);
    }
  };
}

module.exports = { demoTelemetry, samples, incidents, dailyEvent };
