import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.protocol === 'data:' || url.protocol === 'blob:' ||
        (url.hostname === '127.0.0.1' && ['5174', '5051', '54321'].includes(url.port))) {
      await route.continue()
    } else {
      await route.abort('blockedbyclient')
    }
  })
})

test('landing shows the guide entry on desktop', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: 'Hướng dẫn' }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: /Bắt đầu cùng/ })).toBeVisible()
})

test('unknown route shows the AquaCare 404 page', async ({ page }) => {
  await page.goto('/duong-dan-khong-ton-tai')
  await expect(page.getByText('Ối! Bạn đã bơi lạc rồi.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Về trang chủ', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('Ối! Bạn đã bơi lạc rồi.')).toBeVisible()
  await page.getByRole('link', { name: 'Về trang chủ', exact: true }).click()
  await expect(page).toHaveURL('http://127.0.0.1:5174/')
})

test('landing keeps the guide available on a narrow phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await expect(page.locator('#guide')).toBeAttached()
  await expect(page.locator('#guide video')).toHaveAttribute('src', '/videos/AquaCare_UserGuide.mp4')
})
