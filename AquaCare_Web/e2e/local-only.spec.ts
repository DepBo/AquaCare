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

test('unknown route shows the AquaCare 404 page', async ({ page }) => {
  await page.goto('/duong-dan-khong-ton-tai')
  await expect(page.getByText('Ối! Bạn đã bơi lạc rồi.')).toBeVisible()
  await expect(page.getByRole('link', { name: 'Về trang chủ', exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('Ối! Bạn đã bơi lạc rồi.')).toBeVisible()
  await page.getByRole('link', { name: 'Về trang chủ', exact: true }).click()
  await expect(page).toHaveURL('http://127.0.0.1:5174/')
})

test('[AUTH-UI-01] visitor opens password recovery from login', async ({ page }) => {
  await page.goto('/login')
  await page.getByText('Quên mật khẩu?', { exact: true }).click()
  await expect(page).toHaveURL('http://127.0.0.1:5174/forgot-password')
  await expect(page.getByRole('button', { name: 'Gửi link đặt lại' })).toBeVisible()
})

test('[AUTH-UI-02] registration requires agreement before submitting', async ({ page }) => {
  await page.goto('/signup')
  await page.getByPlaceholder('Nguyễn Văn A').fill('Khách QA')
  await page.getByPlaceholder('email@example.com').fill('qa-ui@example.com')
  await page.getByPlaceholder('+84 xxx xxx xxx').fill('0900000000')
  await page.getByPlaceholder('••••••••').first().fill('Pass1234')
  await page.getByPlaceholder('••••••••').last().fill('Pass1234')
  await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
  await expect(page.getByText('Vui lòng đồng ý với Điều khoản dịch vụ')).toBeVisible()
})

test('[AUTH-UI-03] registration rejects mismatched passwords', async ({ page }) => {
  await page.goto('/signup')
  await page.getByPlaceholder('Nguyễn Văn A').fill('Khách QA')
  await page.getByPlaceholder('email@example.com').fill('qa-ui@example.com')
  await page.getByPlaceholder('+84 xxx xxx xxx').fill('0900000000')
  await page.getByPlaceholder('••••••••').first().fill('Pass1234')
  await page.getByPlaceholder('••••••••').last().fill('Pass9999')
  await page.locator('input[type="checkbox"]').check()
  await page.getByRole('button', { name: 'Tạo tài khoản' }).click()
  await expect(page.getByText('Mật khẩu xác nhận không khớp')).toBeVisible()
})
