import { test, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const localHosts = new Set(['127.0.0.1:5174', '127.0.0.1:5051', '127.0.0.1:54321'])

test.beforeEach(async ({ page }) => {
  if (process.env.AQUACARE_TEST_MODE !== '1' ||
      process.env.VITE_SUPABASE_URL !== 'http://127.0.0.1:54321' ||
      process.env.VITE_API_URL !== 'http://127.0.0.1:5051') {
    throw new Error('Role portal tests require isolated local services')
  }
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    return localHosts.has(url.host) ? route.continue() : route.abort('blockedbyclient')
  })
})

async function login(page: import('@playwright/test').Page, email: string, destination: string) {
  await page.goto('/login')
  await page.getByPlaceholder('email@example.com').fill(email)
  await page.getByPlaceholder('••••••••').fill('Qa-only-2026!')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(page).toHaveURL(`http://127.0.0.1:5174${destination}`)
}

async function evidence(page: import('@playwright/test').Page, id: string) {
  const dir = join('..', 'test-results', 'evidence', id)
  await mkdir(dir, { recursive: true })
  await page.screenshot({ path: join(dir, 'portal.png'), fullPage: true })
}

test('[ADMIN-01] admin opens dashboard and device inventory', async ({ page }) => {
  await login(page, 'qa_admin@aquacare.test', '/admin')
  await expect(page.getByRole('heading', { name: 'Tổng quan quản trị' })).toBeVisible()
  await page.getByRole('button', { name: 'Thiết bị' }).first().click()
  await expect(page.getByRole('heading', { name: 'Thiết bị & Kho' })).toBeVisible()
  await evidence(page, 'ADMIN-01')
})

test('[STAFF-01] staff opens work board and history', async ({ page }) => {
  await login(page, 'qa_staff@aquacare.test', '/staff')
  await expect(page.getByText('Bảng Công Việc').first()).toBeVisible()
  await page.getByText('Lịch Sử Làm Việc').first().click()
  await expect(page.getByText('Lịch sử công việc').first()).toBeVisible()
  await evidence(page, 'STAFF-01')
})
