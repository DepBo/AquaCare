const { URL } = require('node:url');

function assertIsolatedTestEnvironment(env = process.env) {
  if (env.AQUACARE_TEST_MODE !== '1') return;
  const expected = 'http://127.0.0.1:54321';
  let actual;
  try { actual = new URL(env.SUPABASE_URL).origin; } catch { /* rejected below */ }
  if (actual !== expected || env.SUPABASE_URL !== expected) {
    throw new Error(`Test mode requires SUPABASE_URL=${expected}; refusing to start`);
  }
  if (String(env.PORT) !== '5051') {
    throw new Error('Test mode requires PORT=5051; refusing to start');
  }
  if (!env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('sb_secret_')) {
    throw new Error('Test mode requires a local Supabase secret key');
  }
  for (const name of ['EMAIL_USER', 'EMAIL_PASS', 'BREVO_API_KEY', 'FIREBASE_SERVICE_ACCOUNT']) {
    if (env[name] && env[name] !== '__AQUACARE_TEST_DISABLED__') {
      throw new Error(`Test mode forbids ${name}; refusing to start`);
    }
  }
}

module.exports = { assertIsolatedTestEnvironment };
