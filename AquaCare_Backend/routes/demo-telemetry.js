const MINUTE = 60_000;

function samples(tank, now, { from = -Infinity, until = Infinity, limit = 720 } = {}) {
  const origin = Date.parse(tank.created_at);
  if (!Number.isFinite(origin)) throw new Error('Invalid tank creation time');
  const last = Math.floor((Math.min(now, until) - origin) / MINUTE);
  const first = Math.max(0, last - limit + 1, Math.ceil((from - origin) / MINUTE));
  const phase = Number(tank.id) * 2.39996;
  const rows = [];
  for (let i = first; i <= last; i++) {
    const wave = Math.sin(i / 53 + phase);
    const ripple = Math.sin(i / 7 + phase * 3);
    rows.push({
      id: i, recorded_at: new Date(origin + i * MINUTE).toISOString(),
      ph: Number((7.2 + 0.22 * wave + 0.07 * ripple).toFixed(2)),
      temp: Number((25 + 0.9 * Math.sin(i / 190 + phase) + 0.18 * ripple).toFixed(2)),
      tds: Math.round(245 + 22 * wave + 6 * ripple),
      water_level_ok: Math.sin(i / 47 + phase) > -0.96,
    });
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
      if (alerts) {
        if (!active) return res.json([]);
        const thresholds = await require('../config/species_thresholds').getSpeciesThresholds(db, req.params.id);
        return res.json(incidents(samples(result.data, Date.now()), thresholds));
      }
      return res.json(active ? samples(result.data, Date.now(), options) : []);
    } catch (error) {
      console.error('[demo telemetry]', error.message);
      return res.sendStatus(500);
    }
  };
}

module.exports = { demoTelemetry, samples, incidents };
