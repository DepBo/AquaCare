import { defineConfig } from '@playwright/test'

if (process.env.AQUACARE_TEST_MODE !== '1' ||
    process.env.VITE_SUPABASE_URL !== 'http://127.0.0.1:54321' ||
    process.env.VITE_API_URL !== 'http://127.0.0.1:5051') {
  throw new Error('Playwright requires isolated local AquaCare test configuration')
}

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../test-results/playwright-html' }], ['json', { outputFile: '../test-results/playwright.json' }]],
  use: {
    baseURL: 'http://127.0.0.1:5174',
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --mode isolated-test --host 127.0.0.1 --port 5174 --strictPort',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
