const { createClient } = require('@supabase/supabase-js');

// New sb_secret_ keys belong in `apikey`, not `Authorization: Bearer`.
// Keep this client scoped to demo fulfilment so existing backend requests stay unchanged.
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const url = process.env.SUPABASE_URL;
if (!key || !url) throw new Error('Missing Supabase backend configuration');

const demoSupabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: {
    fetch: (input, init = {}) => {
      const headers = new Headers(init.headers);
      if (key.startsWith('sb_secret_') && headers.get('Authorization') === `Bearer ${key}`) {
        headers.delete('Authorization');
      }
      return fetch(input, { ...init, headers });
    },
  },
});

module.exports = demoSupabase;
