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

function demoTelemetry(db) {
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
        .eq('devices.is_simulator', true).eq('devices.firmware_version', 'V3 Demo').maybeSingle();
      if (result.error) throw result.error;
      if (!result.data) return res.sendStatus(404);
      const active = result.data.devices.some(device => device.is_active);
      return res.json(active ? samples(result.data, Date.now(), options) : []);
    } catch (error) {
      console.error('[demo telemetry]', error.message);
      return res.sendStatus(500);
    }
  };
}

module.exports = { demoTelemetry, samples };
