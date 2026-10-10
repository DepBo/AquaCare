import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'

const pubspec = readFileSync(new URL('../AquaCare_App/pubspec.yaml', import.meta.url), 'utf8')
const appVersion = pubspec.match(/^version:\s*([^\s+#]+)/m)?.[1]
if (!appVersion) throw new Error('Không tìm thấy version trong AquaCare_App/pubspec.yaml')

export default defineConfig({
  define: {
    __AQUACARE_APP_VERSION__: JSON.stringify(appVersion),
  },
  // base: '/aquacare/',  // Thêm dòng này
  plugins: [
    react(),
    tailwindcss(),
  ],
})
