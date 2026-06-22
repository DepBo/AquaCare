import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // base: '/aquacare/',  // Thêm dòng này
  plugins: [
    react(),
    tailwindcss(),
  ],
})
