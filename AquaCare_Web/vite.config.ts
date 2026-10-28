import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'

const pubspec = readFileSync(new URL('../AquaCare_App/pubspec.yaml', import.meta.url), 'utf8')
const appVersion = pubspec.match(/^version:\s*([^\s+#]+)/m)?.[1]
if (!appVersion) throw new Error('Không tìm thấy version trong AquaCare_App/pubspec.yaml')

export default defineConfig(({ command, mode }) => {
  if (mode === 'isolated-test') {
    const env = loadEnv(mode, process.cwd(), 'VITE_')
    if (env.VITE_SUPABASE_URL !== 'http://127.0.0.1:54321' ||
        env.VITE_API_URL !== 'http://127.0.0.1:5051') {
      throw new Error('Isolated test mode requires local Supabase and API URLs')
    }
    if (!env.VITE_SUPABASE_ANON_KEY?.startsWith('sb_publishable_')) {
      throw new Error('Isolated test mode requires a local Supabase publishable key')
    }
  }
  return {
  define: {
    __AQUACARE_APP_VERSION__: JSON.stringify(appVersion),
  },
  // base: '/aquacare/',  // Thêm dòng này
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: command === 'serve' ? {
    proxy: {
      '/api': {
        target: mode === 'isolated-test' ? 'http://127.0.0.1:5051' : 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  } : undefined,
  }
})
