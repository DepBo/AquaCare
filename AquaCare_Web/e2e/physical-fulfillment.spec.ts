import { test, expect, type Browser, type Page } from '@playwright/test'
import { createClient } from '@supabase/supabase-js'
import { createRequire } from 'node:module'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'
import { join } from 'node:path'

const localSupabase = 'http://127.0.0.1:54321'
const localHosts = new Set(['127.0.0.1:5174', '127.0.0.1:5051', '127.0.0.1:54321'])
const require = createRequire(import.meta.url)
const { createOrderMacEmail } = require('../../AquaCare_Backend/routes/order-mac-email.routes.js')

function isolatedDb() {
  if (process.env.AQUACARE_TEST_MODE !== '1' || process.env.VITE_SUPABASE_URL !== localSupabase ||
      process.env.VITE_API_URL !== 'http://127.0.0.1:5051' ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('sb_secret_')) {
    throw new Error('Physical fulfillment test requires isolated local services')
  }
  return createClient(localSupabase, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function actor(browser: Browser, email: string, destination: string) {
  const context = await browser.newContext()
  await context.route('**/*', route => {
    const url = new URL(route.request().url())
    return url.protocol === 'data:' || url.protocol === 'blob:' || localHosts.has(url.host)
      ? route.continue() : route.abort('blockedbyclient')
  })
  const page = await context.newPage()
  await page.goto('/login')
  await page.getByPlaceholder('email@example.com').fill(email)
  await page.getByPlaceholder('••••••••').fill('Qa-only-2026!')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(page).toHaveURL(`http://127.0.0.1:5174${destination}`)
  return { context, page }
}

async function screenshot(page: Page, file: string) {
  const dir = join('..', 'test-results', 'evidence', 'FULFILL-01')
  await mkdir(dir, { recursive: true })
  await page.screenshot({ path: join(dir, file), fullPage: true })
}

test('[FULFILL-01] admin approves, warehouse packs MAC, shipper delivers and customer attaches device', async ({ browser }) => {
  test.setTimeout(120_000)
  const db = isolatedDb()
  const fixture = JSON.parse(await readFile(join('..', 'test-results', 'local-fixtures.json'), 'utf8'))
  if (!fixture.warehouse || !fixture.shipper) throw new Error('QA warehouse and shipper accounts are missing')
  const mac = `02:AC:${[...randomBytes(4)].map(byte => byte.toString(16).padStart(2, '0')).join(':').toUpperCase()}`
  let orderId: number | undefined
  let tankId: number | undefined
  const evidence: Record<string, unknown> = { mac, emailTransport: 'local fake sender; no external email sent' }

  try {
    const device = await db.from('devices').insert({ mac_address: mac, firmware_version: 'V3', is_simulator: false, is_active: false, tank_id: null })
    if (device.error) throw device.error
    const order = await db.from('orders').insert({
      user_id: fixture.a, shipping_name: 'QA Physical Customer', shipping_phone: '0900000001',
      shipping_email: 'qa_a@aquacare.test', shipping_address: 'QA local address',
      payment_method: 'cod', status: 'pending', total_price: 3700000,
    }).select('id').single()
    if (order.error) throw order.error
    orderId = order.data.id
    const item = await db.from('order_items').insert({
      order_id: orderId, product_id: 'v3', product_name: 'AquaCare Advanced',
      product_price: 3700000, quantity: 1,
    })
    if (item.error) throw item.error

    await test.step('Admin approves the pending physical order', async () => {
      const { context, page } = await actor(browser, 'qa_admin@aquacare.test', '/admin')
      try {
        await page.getByRole('button', { name: 'Đơn hàng' }).first().click()
        const row = page.getByTestId(`admin-order-${orderId}`)
        await expect(row).toContainText('Chờ duyệt')
        await row.getByRole('button', { name: 'Duyệt đơn' }).click()
        await page.getByRole('button', { name: 'Xác nhận duyệt & Giao cho Kho' }).click()
        await expect(row).toContainText('Đã duyệt')
        const approved = await db.from('orders').select('status').eq('id', orderId!).single()
        expect(approved.data?.status).toBe('confirmed')
        await screenshot(page, 'admin-approved.png')
      } finally { await context.close() }
    })

    const packing = await db.from('tasks').select('id,assigned_to,status').eq('order_id', orderId).eq('task_type', 'packing').single()
    expect(packing.error).toBeNull()
    expect(packing.data).toMatchObject({ assigned_to: fixture.warehouse, status: 'todo' })
    evidence.packingTaskId = packing.data!.id

    await test.step('Warehouse enters the stocked MAC and completes packing', async () => {
      const { context, page } = await actor(browser, 'qa_warehouse@aquacare.test', '/staff')
      try {
        await page.getByText('Trạm Đóng Gói').first().click()
        await page.getByTestId(`packing-task-${packing.data!.id}`).click()
        await page.getByPlaceholder('Nhập mã MAC...').fill(mac)
        await page.getByRole('button', { name: 'Xác nhận Đóng gói & Chuyển Giao hàng' }).click()
        await expect(page.getByText(`Đã đóng gói xong Đơn #${orderId}`)).toBeVisible()
        const packed = await db.from('order_items').select('device_macs').eq('order_id', orderId!).single()
        expect(packed.data?.device_macs).toEqual([mac])
        await screenshot(page, 'warehouse-packed.png')
      } finally { await context.close() }
    })

    const delivery = await db.from('tasks').select('id,assigned_to,status').eq('order_id', orderId).eq('task_type', 'delivery_install').single()
    expect(delivery.error).toBeNull()
    expect(delivery.data).toMatchObject({ assigned_to: fixture.shipper, status: 'todo' })
    evidence.deliveryTaskId = delivery.data!.id

    await test.step('Shipper accepts and completes the delivery task', async () => {
      const { context, page } = await actor(browser, 'qa_shipper@aquacare.test', '/staff')
      try {
        const card = page.getByTestId(`staff-task-${delivery.data!.id}`)
        await expect(card).toContainText(`Đơn #${orderId}`)
        await card.getByRole('button', { name: 'Nhận việc' }).click()
        await expect(card.getByRole('button', { name: 'Hoàn thành' })).toBeVisible()
        await expect.poll(async () => (await db.from('tasks').select('status').eq('id', delivery.data!.id).single()).data?.status).toBe('in_progress')
        const accepted = await db.from('tasks').select('status,assigned_to').eq('id', delivery.data!.id).single()
        expect(accepted.data).toMatchObject({ status: 'in_progress', assigned_to: fixture.shipper })
        const completion = page.waitForResponse(response => response.url().includes(`/api/orders/mac-email/${orderId}/complete`))
        await card.getByRole('button', { name: 'Hoàn thành' }).click()
        const completionResponse = await completion
        expect(completionResponse.ok(), await completionResponse.text()).toBeTruthy()
        await expect.poll(async () => (await db.from('orders').select('status').eq('id', orderId!).single()).data?.status).toBe('delivered')
        const completed = await db.from('tasks').select('status,completed_at').eq('id', delivery.data!.id).single()
        expect(completed.data?.status).toBe('done')
        expect(completed.data?.completed_at).toBeTruthy()
        await screenshot(page, 'shipper-delivered.png')
      } finally { await context.close() }
    })

    await test.step('MAC email worker prepares the correct message using a local fake sender', async () => {
      const sent: Array<{ address: string; orderId: number; macs: string[]; details: unknown }> = []
      const worker = createOrderMacEmail({ supabase: db, enabled: true, intervalMs: 3_600_000,
        sendEmail: async (address: string, id: number, macs: string[], details: unknown) => {
          sent.push({ address, orderId: id, macs, details })
          return true
        },
      })
      try {
        expect(await worker.processOrder(orderId!)).toBe('sent')
        expect(sent).toEqual([expect.objectContaining({ address: 'qa_a@aquacare.test', orderId, macs: [mac] })])
        const delivered = await db.from('orders').select('mac_email_sent_at,mac_email_last_error').eq('id', orderId!).single()
        expect(delivered.data?.mac_email_sent_at).toBeTruthy()
        expect(delivered.data?.mac_email_last_error).toBeNull()
        evidence.email = sent[0]
      } finally { worker.stop() }
    })

    await test.step('Customer selects the delivered MAC for a new tank', async () => {
      const { context, page } = await actor(browser, 'qa_a@aquacare.test', '/dashboard')
      try {
        await page.locator('[data-tour-target="pond-select"] > button').click()
        await page.getByRole('button', { name: 'Thêm bể mới' }).click()
        await page.getByPlaceholder('Tìm tên, phiên bản hoặc mã MAC').fill(mac)
        const option = page.locator('.add-tank-device').filter({ hasText: mac })
        await expect(option).toBeEnabled()
        await option.click()
        await page.getByPlaceholder('VD: Bể Rồng Phòng Ngủ').fill(`QA Physical tank ${orderId}`)
        await page.getByPlaceholder('VD: 250').fill('250')
        await page.getByRole('button', { name: 'Thêm bể', exact: true }).click()
        await expect(page.locator('[data-tour-target="pond-select"] > button')).toContainText(`QA Physical tank ${orderId}`)
        const tank = await db.from('tanks').select('id,user_id').eq('tank_name', `QA Physical tank ${orderId}`).single()
        expect(tank.error).toBeNull()
        tankId = tank.data!.id
        expect(tank.data?.user_id).toBe(fixture.a)
        const attached = await db.from('devices').select('tank_id').eq('mac_address', mac).single()
        expect(attached.data?.tank_id).toBe(tankId)
        await screenshot(page, 'customer-attached-mac.png')
      } finally { await context.close() }
    })
  } finally {
    const dir = join('..', 'test-results', 'evidence', 'FULFILL-01')
    await mkdir(dir, { recursive: true })
    await writeFile(join(dir, 'local-flow.json'), JSON.stringify({ ...evidence, orderId, tankId }, null, 2))
    if (tankId) {
      await db.from('devices').update({ tank_id: null }).eq('mac_address', mac)
      await db.from('tanks').delete().eq('id', tankId)
    }
    if (orderId) {
      await db.from('tasks').delete().eq('order_id', orderId)
      await db.from('order_items').delete().eq('order_id', orderId)
      await db.from('orders').delete().eq('id', orderId)
    }
    await db.from('devices').delete().eq('mac_address', mac)
  }
})
