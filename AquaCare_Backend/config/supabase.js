const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

// Khởi tạo Supabase client với SERVICE_ROLE_KEY để có quyền Admin (ghi vào bảng profiles, xóa user...)
// New sb_secret_ keys belong in `apikey`, not `Authorization: Bearer`.
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    fetch: (input, init = {}) => {
      const url = typeof input === 'string' ? input : input?.url || '';
      const headers = new Headers(init.headers);
      if (url.includes('/rest/v1/')) {
        if (supabaseServiceKey.startsWith('sb_secret_')) {
          headers.delete('Authorization');
        } else {
          headers.set('Authorization', `Bearer ${supabaseServiceKey}`);
        }
      } else if (supabaseServiceKey.startsWith('sb_secret_') && headers.get('Authorization') === `Bearer ${supabaseServiceKey}`) {
        headers.delete('Authorization');
      }
      return fetch(input, { ...init, headers });
    }
  }
});

module.exports = supabase;
