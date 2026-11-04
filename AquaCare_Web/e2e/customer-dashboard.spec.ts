import { test, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const localUrl = 'http://127.0.0.1:54321'
const evidenceRoot = join('..', 'test-results', 'evidence')

function db() {
  if (process.env.AQUACARE_TEST_MODE !== '1' || process.env.VITE_SUPABASE_URL !== localUrl || process.env.VITE_API_URL !== 'http://127.0.0.1:5051') {
    throw new Error('Customer dashboard tests require isolated local services')
  }
  return createClient(localUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function login(page: import('@playwright/test').Page, email = 'qa_a@aquacare.test') {
  await page.route('**/*', route => {
    const url = new URL(route.request().url())
    return url.hostname === '127.0.0.1' && ['5174', '5051', '54321'].includes(url.port)
      ? route.continue() : route.abort('blockedbyclient')
  })
  await page.goto('/login')
  await page.getByPlaceholder('email@example.com').fill(email)
  await page.getByPlaceholder('••••••••').fill('Qa-only-2026!')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(page).toHaveURL('http://127.0.0.1:5174/dashboard')
  await expect(page.locator('[data-tour-target="pond-select"]')).toBeVisible()
}

async function shot(page: import('@playwright/test').Page, id: string, file: string) {
  const folder = join(evidenceRoot, id)
  await mkdir(folder, { recursive: true })
  await page.screenshot({ path: join(folder, file), fullPage: true })
}

test('[TANK-01] customer creates, edits and deletes a tank through the web UI', async ({ page }) => {
  const client = db()
  const name = `QA E2E ${Date.now()}`
  let tankId: number | undefined
  try {
    await login(page)
    await page.locator('[data-tour-target="pond-select"] > button').click()
    await page.getByRole('button', { name: 'Thêm bể mới' }).click()
    await page.getByPlaceholder('VD: Bể Rồng Phòng Ngủ').fill(name)
    await page.getByPlaceholder('VD: 250').fill('250')
    await page.getByRole('button', { name: 'Thêm bể', exact: true }).click()
    await expect(page.locator('[data-tour-target="pond-select"] > button')).toContainText(name)
    const { data: created, error: createError } = await client.from('tanks').select('id, water_volume_liter').eq('tank_name', name).single()
    expect(createError).toBeNull()
    tankId = created!.id
    expect(created!.water_volume_liter).toBe(250)
    await shot(page, 'TANK-01', 'created.png')

    await page.locator('[data-tour-target="pond-select"] > button').click()
    await page.getByTitle('Cấu hình').last().click()
    await page.getByPlaceholder('VD: Bể Rồng Phòng Ngủ').fill(`${name} edited`)
    await page.getByRole('button', { name: 'Lưu thay đổi' }).click()
    await expect(page.locator('[data-tour-target="pond-select"] > button')).toContainText(`${name} edited`)
    const { data: edited } = await client.from('tanks').select('tank_name').eq('id', tankId).single()
    expect(edited?.tank_name).toBe(`${name} edited`)
    await shot(page, 'TANK-01', 'edited.png')

    await page.locator('[data-tour-target="pond-select"] > button').click()
    await page.getByTitle('Xóa').last().click()
    await page.getByRole('button', { name: 'Xóa bể', exact: true }).click()
    await expect(page.locator('[data-tour-target="pond-select"] > button')).not.toContainText(`${name} edited`)
    const { data: removed } = await client.from('tanks').select('id').eq('id', tankId).maybeSingle()
    expect(removed).toBeNull()
    await shot(page, 'TANK-01', 'deleted.png')
  } finally {
    if (tankId) await client.from('tanks').delete().eq('id', tankId)
  }
})

test('[CTRL-01] customer switches a local simulator device off and on', async ({ page }) => {
  const client = db()
  const { data: device, error } = await client.from('devices').select('id, is_active, tank_id').eq('mac_address', 'QA:00:00:00:00:02').single()
  expect(error).toBeNull()
  expect(device?.tank_id).toBeTruthy()
  try {
    await login(page, 'qa_b@aquacare.test')
    await page.getByRole('button', { name: 'Điều khiển thiết bị' }).click()
    const deviceSwitch = page.getByRole('switch', { name: 'Bật hoặc tắt thiết bị của bể' })
    await expect(deviceSwitch).toBeEnabled()
    const initial = await deviceSwitch.getAttribute('aria-checked') === 'true'
    await deviceSwitch.click()
    await expect(deviceSwitch).toHaveAttribute('aria-checked', String(!initial))
    const { data: changed } = await client.from('devices').select('is_active').eq('id', device!.id).single()
    expect(changed?.is_active).toBe(!initial)
    await shot(page, 'CTRL-01', 'switched.png')
    await deviceSwitch.click()
    await expect(deviceSwitch).toHaveAttribute('aria-checked', String(initial))
  } finally {
    await client.from('devices').update({ is_active: device!.is_active }).eq('id', device!.id)
  }
})

test('[SCHED-01] customer saves and cancels a daily pump schedule', async ({ page }) => {
  const client = db()
  const { data: device, error } = await client.from('devices').select('id').eq('mac_address', 'QA:00:00:00:00:02').single()
  expect(error).toBeNull()
  try {
    await login(page, 'qa_b@aquacare.test')
    await page.getByRole('button', { name: 'Điều khiển thiết bị' }).click()
    const card = page.locator('.device-control-pump.device-control-card')
    await card.getByLabel('Lặp lại hằng ngày').check()
    await card.getByLabel('Giờ bật Máy bơm nước').fill('07:00')
    await card.getByLabel('Giờ tắt Máy bơm nước').fill('08:00')
    await card.getByRole('button', { name: 'Lưu lịch' }).click()
    await expect(card.getByRole('button', { name: 'Hủy lịch' })).toBeVisible()
    const { data: saved } = await client.from('device_schedules').select('id, on_time, off_time, is_daily').eq('device_id', device!.id).eq('relay_name', 'Pump').eq('is_active', true).single()
    expect(saved?.is_daily).toBe(true)
    expect(saved?.on_time?.startsWith('07:00')).toBe(true)
    expect(saved?.off_time?.startsWith('08:00')).toBe(true)
    await shot(page, 'SCHED-01', 'saved.png')
    await card.getByRole('button', { name: 'Hủy lịch' }).click()
    await expect(card.getByRole('button', { name: 'Hủy lịch' })).toHaveCount(0)
    const { data: canceled } = await client.from('device_schedules').select('is_active').eq('id', saved!.id).single()
    expect(canceled?.is_active).toBe(false)
    await shot(page, 'SCHED-01', 'canceled.png')
  } finally {
    await client.from('device_schedules').delete().eq('device_id', device!.id).eq('relay_name', 'Pump')
  }
})
