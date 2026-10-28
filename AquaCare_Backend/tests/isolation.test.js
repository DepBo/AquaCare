const test = require('node:test');
const assert = require('node:assert/strict');
const { assertIsolatedTestEnvironment } = require('../testing/isolation');

const safe = {
  AQUACARE_TEST_MODE: '1',
  SUPABASE_URL: 'http://127.0.0.1:54321',
  SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_local-test',
  PORT: '5051',
};

test('isolated backend accepts only the local test endpoint', () => {
  assert.doesNotThrow(() => assertIsolatedTestEnvironment(safe));
  for (const url of ['https://nwmeysspxfgqxtvxeuil.supabase.co', 'http://localhost:54321', 'http://127.0.0.1:5000']) {
    assert.throws(() => assertIsolatedTestEnvironment({ ...safe, SUPABASE_URL: url }), /refusing to start/);
  }
});

test('isolated backend refuses live notification credentials and production port', () => {
  for (const name of ['EMAIL_USER', 'EMAIL_PASS', 'BREVO_API_KEY', 'FIREBASE_SERVICE_ACCOUNT']) {
    assert.throws(() => assertIsolatedTestEnvironment({ ...safe, [name]: 'live-value' }), /refusing to start/);
  }
  assert.throws(() => assertIsolatedTestEnvironment({ ...safe, PORT: '5000' }), /refusing to start/);
});
