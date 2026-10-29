const fs = require('node:fs');
const { createClient } = require('@supabase/supabase-js');
const { assertIsolatedTestEnvironment } = require('./isolation');

assertIsolatedTestEnvironment(process.env);
if (process.env.AQUACARE_TEST_MODE !== '1') throw new Error('Local fixture requires test mode');
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function user(email, phone) {
  const existing = await db.from('users').select('id').eq('email', email).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) {
    const updated = await db.auth.admin.updateUserById(existing.data.id, { phone: `+84${phone.slice(1)}`, phone_confirm: true });
    if (updated.error) throw updated.error;
    return existing.data.id;
  }
  const created = await db.auth.admin.createUser({ email, phone: `+84${phone.slice(1)}`, password: 'Qa-only-2026!', email_confirm: true, phone_confirm: true });
  if (created.error) throw created.error;
  const id = created.data.user.id;
  const profile = await db.from('users').upsert({ id, email, full_name: `QA ${phone}`, phone, role: 'user' });
  if (profile.error) throw profile.error;
  return id;
}

async function tank(ownerId, name) {
  const existing = await db.from('tanks').select('id').eq('user_id', ownerId).eq('tank_name', name).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data.id;
  const created = await db.from('tanks').insert({ user_id: ownerId, tank_name: name, water_volume_liter: 100 }).select('id').single();
  if (created.error) throw created.error;
  return created.data.id;
}

(async () => {
  const a = await user('qa_a@aquacare.test', '0900000001');
  const b = await user('qa_b@aquacare.test', '0900000002');
  const admin = await user('qa_admin@aquacare.test', '0900000003');
  const staff = await user('qa_staff@aquacare.test', '0900000004');
  const role = await db.from('users').update({ role: 'admin' }).eq('id', admin);
  if (role.error) throw role.error;
  const staffRole = await db.from('users').update({ role: 'staff' }).eq('id', staff);
  if (staffRole.error) throw staffRole.error;
  const tankA = await tank(a, 'QA A');
  const tankB = await tank(b, 'QA B');
  const assigned = await db.from('devices').update({ tank_id: tankB, is_active: true })
    .eq('mac_address', 'QA:00:00:00:00:02');
  if (assigned.error) throw assigned.error;
  fs.writeFileSync(process.argv[2], JSON.stringify({ a, b, admin, staff, tankA, tankB }));
  process.stdout.write('Local synthetic Auth fixtures ready\n');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
