import { test, expect } from '@playwright/test'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'

const evidenceDir = join('..', 'test-results', 'evidence')
const localApi = 'http://127.0.0.1:54321'
function serviceDb() {
  if (process.env.AQUACARE_TEST_MODE !== '1' || process.env.VITE_SUPABASE_URL !== localApi) {
    throw new Error('System cases require isolated local Supabase')
  }
  return createClient(localApi, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
async function loginCustomer(page: import('@playwright/test').Page, email = 'qa_a@aquacare.test') {
  await page.goto('/login')
  await page.getByPlaceholder('email@example.com').fill(email)
  await page.getByPlaceholder('••••••••').fill('Qa-only-2026!')
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click()
  await expect(page).toHaveURL('http://127.0.0.1:5174/dashboard')
}
async function capture(page: import('@playwright/test').Page, id: string, name: string) {
  const folder = join(evidenceDir, id)
  await mkdir(folder, { recursive: true })
  await page.screenshot({ path: join(folder, name), fullPage: true })
}

async function cleanupDemoOrder(db: ReturnType<typeof serviceDb>, orderId: number) {
  const fulfillment = await db.from('demo_fulfillments').select('macs').eq('order_id', orderId).maybeSingle()
  const macs: string[] = Array.isArray(fulfillment.data?.macs) ? fulfillment.data.macs : []
  const tasks = await db.from('tasks').delete().eq('order_id', orderId)
  const items = await db.from('order_items').delete().eq('order_id', orderId)
  const order = await db.from('orders').delete().eq('id', orderId)
  for (const result of [tasks, items, order]) if (result.error) throw result.error
  for (const mac of macs) {
    const device = await db.from('devices').update({ is_active: false, tank_id: null }).eq('mac_address', mac)
    if (device.error) throw device.error
  }
}

test.beforeEach(async ({ context }) => {
  await context.route('**/*', async route => {
    const url = new URL(route.request().url())
    if (url.protocol === 'data:' || url.protocol === 'blob:' ||
        (url.hostname === '127.0.0.1' && ['5174', '5051', '54321'].includes(url.port))) {
      await route.continue()
    } else {
      await route.abort('blockedbyclient')
    }
  })
})

test('[NAV-02] unknown root and deep URLs survive reload with AquaCare 404', async ({ page }) => {
  for (const [index, path] of ['/duong-dan-khong-ton-tai', '/khong-co/trang/con'].entries()) {
    await test.step(`Open and reload ${path}`, async () => {
      await page.goto(path)
      await expect(page.getByRole('heading', { name: 'Ối! Bạn đã bơi lạc rồi.' })).toBeVisible()
      await expect(page.getByRole('img', { name: 'Số 404 với bể cá ở giữa' })).toBeVisible()
      await expect(page.getByRole('link', { name: 'Về trang chủ', exact: true })).toBeVisible()
      await expect(page).toHaveTitle('404 · Không tìm thấy trang | AquaCare')
      await page.reload()
      await expect(page.getByRole('heading', { name: 'Ối! Bạn đã bơi lạc rồi.' })).toBeVisible()
      await expect(page).toHaveURL(`http://127.0.0.1:5174${path}`)
      await capture(page, 'NAV-02', `route-${index + 1}.png`)
    })
  }
})

test('[NAV-03] 404 back follows browser history', async ({ page }) => {
  await page.goto('/cart')
  await expect(page).toHaveURL('http://127.0.0.1:5174/cart')
  // Navigate within the SPA so React Router records a previous route (idx > 0).
  await page.evaluate(() => {
    const current = window.history.state || {}
    const next = { ...current, idx: (current.idx ?? 0) + 1 }
    window.history.pushState(next, '', '/khong-co-trang-nay')
    window.dispatchEvent(new PopStateEvent('popstate', { state: next }))
  })
  await expect(page.getByRole('heading', { name: 'Ối! Bạn đã bơi lạc rồi.' })).toBeVisible()
  await page.getByRole('button', { name: 'Quay lại' }).click()
  await page.waitForURL(url => url.pathname !== '/khong-co-trang-nay')
  await expect(page.getByRole('heading', { name: 'Ối! Bạn đã bơi lạc rồi.' })).toHaveCount(0)
  await capture(page, 'NAV-03', 'back-result.png')
  await expect(page).toHaveURL('http://127.0.0.1:5174/cart')
})

test('[NAV-03] 404 home opens landing from a new tab', async ({ context }) => {
  const newTab = await context.newPage()
  await newTab.goto('/duong-dan-khong-ton-tai')
  await newTab.getByRole('link', { name: 'Về trang chủ', exact: true }).click()
  await expect(newTab).toHaveURL('http://127.0.0.1:5174/')
  await capture(newTab, 'NAV-03', 'home-result.png')
})

test('[NAV-01] landing desktop navigation, sections, footer and visible images', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  for (const id of ['hero', 'about', 'features', 'products', 'guide', 'subscriptions', 'technology', 'howitworks', 'contact']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1)
  }
  for (const [label, id] of [['Sản phẩm', 'products'], ['Hướng dẫn', 'guide'], ['Liên hệ', 'contact']] as const) {
    await page.locator('nav').getByRole('link', { name: label, exact: true }).first().click()
    await expect(page).toHaveURL(new RegExp(`#${id}$`))
  }
  await expect(page.locator('footer')).toBeVisible()
  const broken = await page.locator('img').evaluateAll(images => images
    .filter(image => {
      const element = image as HTMLImageElement
      return element.getBoundingClientRect().width > 0 && element.complete && element.naturalWidth === 0
    })
    .map(image => (image as HTMLImageElement).src))
  expect(broken).toEqual([])
  await capture(page, 'NAV-01', 'desktop-footer.png')
})

test('[NAV-01] landing phone menu and viewport fit', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  for (const [label, id] of [['Sản phẩm', 'products'], ['Hướng dẫn', 'guide'], ['Liên hệ', 'contact']] as const) {
    await page.getByRole('button', { name: 'Toggle menu' }).click()
    await page.locator('div[class="xl:hidden"]').getByRole('link', { name: label, exact: true }).click()
    await expect(page).toHaveURL(new RegExp(`#${id}$`))
  }
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, view: innerWidth }))
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.view + 1)
  await capture(page, 'NAV-01', 'phone-contact.png')
})

test('[DEMO-01] free V3 Demo shows simulator stock and enters the cart', async ({ page }) => {
  await page.goto('/')
  const card = page.locator('#product-v3-demo')
  await expect(card).toBeVisible()
  await expect(card).toContainText('AquaCare V3 Demo')
  await expect(card).toContainText('DEMO · KHÔNG PHẦN CỨNG')
  await expect(card).toContainText(/0\s*₫/)
  await expect(card).toContainText('Còn: 1')
  await card.getByRole('button', { name: 'Chi tiết' }).click()
  await expect(page.getByText('Mã MAC simulator riêng')).toBeVisible()
  await capture(page, 'DEMO-01', 'product-details.png')
  await page.getByRole('heading', { name: 'AquaCare V3 Demo' }).last().locator('xpath=../..').getByRole('button').first().click()
  await card.getByRole('button', { name: 'Thêm', exact: true }).click()
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('aquacare_cart') || '[]').some((item: { id: string }) => item.id === 'v3-demo'))).toBe(true)
  await capture(page, 'DEMO-01', 'added-to-cart.png')
})

test('[DEMO-02] web demo checkout retry with the same key keeps one order and one MAC', async ({ page, request }) => {
  test.setTimeout(60_000)
  const db = serviceDb()
  const qaUser = await db.from('users').select('id').eq('email', 'qa_a@aquacare.test').single()
  if (qaUser.error) throw qaUser.error
  const clearCart = await db.from('cart_items').delete().eq('user_id', qaUser.data.id)
  if (clearCart.error) throw clearCart.error
  let orderId: number | undefined
  let requestBody: { requestKey: string; quantity: number; fullName: string; note?: string } | undefined
  try {
    await loginCustomer(page)
    await page.goto('/')
    const card = page.locator('#product-v3-demo')
    await expect(card).toBeVisible()
    await card.getByRole('button', { name: 'Thêm', exact: true }).click()
    await page.goto('/cart')
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('aquacare_cart') || '[]').map((item: { id: string; quantity: number }) => ({ id: item.id, quantity: item.quantity })))).toEqual([{ id: 'v3-demo', quantity: 1 }])
    page.on('request', outgoing => {
      if (outgoing.method() === 'POST' && outgoing.url().includes('/api/orders/demo/checkout')) {
        requestBody = outgoing.postDataJSON()
      }
    })
    const responsePromise = page.waitForResponse(response => response.url().includes('/api/orders/demo/checkout') && response.request().method() === 'POST')
    await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click()
    const submit = page.locator('button[form="checkout-form"]')
    if (!requestBody && await submit.isVisible().catch(() => false)) {
      const nameField = page.locator('[name="fullName"]')
      if (await nameField.isVisible().catch(() => false)) await nameField.fill('QA Demo A').catch(() => {})
      await submit.click({ timeout: 3000 }).catch(() => {})
    }
    const firstResponse = await responsePromise
    const first = await firstResponse.json()
    orderId = first.orderId
    await expect(page.getByRole('heading', { name: 'Đặt hàng thành công!' })).toBeVisible()
    await capture(page, 'DEMO-02', 'web-checkout-success.png')
    const token = await page.evaluate(() => localStorage.getItem('access_token'))
    const retry = await request.post('http://127.0.0.1:5051/api/orders/demo/checkout', {
      headers: { Authorization: `Bearer ${token}` }, data: requestBody,
    })
    const second = await retry.json()
    const fulfillments = await db.from('demo_fulfillments').select('order_id,macs,request_key').eq('order_id', orderId)
    const orders = await db.from('orders').select('id,user_id,status,total_price').eq('id', orderId)
    const items = await db.from('order_items').select('id,product_id,quantity,device_macs').eq('order_id', orderId)
    const evidence = { firstStatus: firstResponse.status(), first, retryStatus: retry.status(), second,
      requestKey: requestBody?.requestKey, fulfillments: fulfillments.data, orders: orders.data, items: items.data }
    const folder = join(evidenceDir, 'DEMO-02')
    await mkdir(folder, { recursive: true })
    await writeFile(join(folder, 'idempotent-web-checkout.json'), JSON.stringify(evidence, null, 2), 'utf8')
    expect(firstResponse.status()).toBe(201)
    expect(retry.status()).toBe(201)
    expect(second.orderId).toBe(orderId)
    expect(fulfillments.data).toHaveLength(1)
    expect(fulfillments.data?.[0].macs).toHaveLength(1)
    expect(orders.data).toHaveLength(1)
    expect(items.data).toHaveLength(1)
  } finally {
    if (!orderId && requestBody?.requestKey) {
      const existing = await db.from('demo_fulfillments').select('order_id').eq('request_key', requestBody.requestKey).maybeSingle()
      orderId = existing.data?.order_id
    }
    if (orderId) await cleanupDemoOrder(db, orderId)
    const leftoverCart = await db.from('cart_items').delete().eq('user_id', qaUser.data.id)
    if (leftoverCart.error) throw leftoverCart.error
  }
})

test('[DEMO-03] demo checkout records automatic approval, packing and simulated delivery', async ({ request }) => {
  const db = serviceDb()
  const fixture = JSON.parse(await readFile(join('..', 'test-results', 'local-fixtures.json'), 'utf8'))
  const auth = await request.post(`${localApi}/auth/v1/token?grant_type=password`, {
    headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY! },
    data: { email: 'qa_a@aquacare.test', password: 'Qa-only-2026!' },
  })
  expect(auth.ok()).toBe(true)
  const token = (await auth.json()).access_token as string
  let orderId: number | undefined
  try {
    const response = await request.post('http://127.0.0.1:5051/api/orders/demo/checkout', {
      headers: { Authorization: `Bearer ${token}` },
      data: { requestKey: crypto.randomUUID(), quantity: 1, fullName: 'QA Demo A', note: 'QA local only' },
    })
    const body = await response.json()
    orderId = body.orderId
    const order = orderId ? await db.from('orders').select('id,user_id,status,total_price,payment_method,shipping_address').eq('id', orderId).single() : null
    const items = orderId ? await db.from('order_items').select('product_id,product_price,quantity,device_macs').eq('order_id', orderId) : null
    const tasks = orderId ? await db.from('tasks').select('task_type,status,assigned_to,description,completed_at').eq('order_id', orderId) : null
    const fulfillment = orderId ? await db.from('demo_fulfillments').select('user_id,macs,approved_at,packed_at,delivered_at').eq('order_id', orderId).single() : null
    const mac = fulfillment?.data?.macs?.[0]
    const device = mac ? await db.from('devices').select('mac_address,firmware_version,is_simulator,is_active').eq('mac_address', mac).single() : null
    const evidence = { responseStatus: response.status(), body, order: order?.data, items: items?.data, tasks: tasks?.data,
      fulfillment: fulfillment?.data, device: device?.data }
    const folder = join(evidenceDir, 'DEMO-03')
    await mkdir(folder, { recursive: true })
    await writeFile(join(folder, 'automatic-flow.json'), JSON.stringify(evidence, null, 2), 'utf8')
    expect(response.status()).toBe(201)
    expect(order?.data).toMatchObject({ user_id: fixture.a, status: 'delivered', total_price: 0, payment_method: 'demo', shipping_address: 'Không giao thiết bị vật lý' })
    expect(items?.data).toEqual([expect.objectContaining({ product_id: 'v3-demo', product_price: 0, quantity: 1 })])
    expect(tasks?.data).toHaveLength(2)
    expect((tasks?.data || []).map(row => row.task_type).sort()).toEqual(['delivery_install', 'packing'])
    expect((tasks?.data || []).every(row => row.status === 'done' && row.assigned_to === null && row.completed_at && row.description.includes('Mô phỏng'))).toBe(true)
    expect(fulfillment?.data?.macs).toHaveLength(1)
    expect(Date.parse(fulfillment!.data!.approved_at)).toBeLessThanOrEqual(Date.parse(fulfillment!.data!.packed_at))
    expect(Date.parse(fulfillment!.data!.packed_at)).toBeLessThanOrEqual(Date.parse(fulfillment!.data!.delivered_at))
    expect(device?.data).toMatchObject({ firmware_version: 'V3 Demo', is_simulator: true, is_active: true })
  } finally {
    if (orderId) await cleanupDemoOrder(db, orderId)
  }
})

test('[DEMO-04] two accounts competing for one demo MAC cannot both receive it', async ({ request }) => {
  const db = serviceDb()
  const free = await db.from('devices').select('mac_address').eq('firmware_version', 'V3 Demo').eq('is_active', false).is('tank_id', null)
  if (free.error) throw free.error
  expect(free.data).toHaveLength(1)
  const tokenFor = async (email: string) => {
    const auth = await request.post(`${localApi}/auth/v1/token?grant_type=password`, {
      headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY! }, data: { email, password: 'Qa-only-2026!' },
    })
    expect(auth.ok()).toBe(true)
    return (await auth.json()).access_token as string
  }
  const [tokenA, tokenB] = await Promise.all([tokenFor('qa_a@aquacare.test'), tokenFor('qa_b@aquacare.test')])
  const checkout = (token: string, label: string) => request.post('http://127.0.0.1:5051/api/orders/demo/checkout', {
    headers: { Authorization: `Bearer ${token}` },
    data: { requestKey: crypto.randomUUID(), quantity: 1, fullName: `QA ${label}` },
  })
  const [responseA, responseB] = await Promise.all([checkout(tokenA, 'A'), checkout(tokenB, 'B')])
  const [bodyA, bodyB] = await Promise.all([responseA.json(), responseB.json()])
  const ids = [bodyA.orderId, bodyB.orderId].filter((id): id is number => Number.isInteger(id))
  try {
    const fulfillments = ids.length ? await db.from('demo_fulfillments').select('order_id,user_id,macs').in('order_id', ids) : { data: [] }
    const evidence = { stockBefore: free.data, a: { status: responseA.status(), body: bodyA },
      b: { status: responseB.status(), body: bodyB }, fulfillments: fulfillments.data }
    const folder = join(evidenceDir, 'DEMO-04')
    await mkdir(folder, { recursive: true })
    await writeFile(join(folder, 'single-mac-race.json'), JSON.stringify(evidence, null, 2), 'utf8')
    expect([responseA.status(), responseB.status()].sort()).toEqual([201, 409])
    expect(ids).toHaveLength(1)
    expect(fulfillments.data).toHaveLength(1)
    expect(fulfillments.data?.[0].macs).toEqual([free.data![0].mac_address])
  } finally {
    for (const id of ids) await cleanupDemoOrder(db, id)
  }
})

test('[DEMO-06] mixed cart and exhausted demo stock do not create an incomplete free order', async ({ page, request }) => {
  const db = serviceDb()
  const fixture = JSON.parse(await readFile(join('..', 'test-results', 'local-fixtures.json'), 'utf8'))
  const marker = `QA out of stock ${Date.now()}`
  const baseline = await db.from('orders').select('id').eq('user_id', fixture.a)
  if (baseline.error) throw baseline.error
  const baselineIds = new Set((baseline.data || []).map(row => row.id))
  const dialogs: string[] = []
  page.on('dialog', async dialog => { dialogs.push(dialog.message()); await dialog.dismiss() })
  await db.from('cart_items').delete().eq('user_id', fixture.a)
  await loginCustomer(page)
  await page.goto('/')
  await page.locator('#product-v3-demo').getByRole('button', { name: 'Thêm', exact: true }).click()
  const advanced = page.locator('#products .glass-card').filter({ hasText: 'AquaCare Advanced' })
  await advanced.locator('.product-action-bar button').last().click()
  await page.goto('/cart')
  await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click()
  const confirm = page.locator('button[form="checkout-form"]')
  if (await confirm.isVisible().catch(() => false)) {
    for (const [name, value] of Object.entries({ fullName: 'QA Mixed', phone: '0900000888', email: 'qa_a@aquacare.test', address: 'QA local only' })) {
      await page.locator(`[name="${name}"]`).fill(value).catch(() => {})
    }
    await confirm.click({ timeout: 3000 }).catch(() => {})
  }
  await expect.poll(() => dialogs.length).toBeGreaterThan(0)
  const afterMix = await db.from('orders').select('id').eq('user_id', fixture.a)
  if (afterMix.error) throw afterMix.error
  const mixedCreatedIds = (afterMix.data || []).map(row => row.id).filter(id => !baselineIds.has(id))
  const mixedSuccessShown = await page.getByRole('heading', { name: 'Đặt hàng thành công!' }).isVisible().catch(() => false)
  await capture(page, 'DEMO-06', 'mixed-cart-rejected.png')

  const stock = await db.from('devices').select('id,is_active,tank_id').eq('mac_address', 'QA:00:00:00:00:01').single()
  if (stock.error) throw stock.error
  expect(stock.data).toMatchObject({ is_active: false, tank_id: null })
  let soldOut: { badge: boolean; buttonDisabled: boolean; responseStatus: number; body: unknown; createdOrders: unknown[] } | undefined
  try {
    const blockStock = await db.from('devices').update({ is_active: true }).eq('id', stock.data.id)
    if (blockStock.error) throw blockStock.error
    await page.goto('/')
    const card = page.locator('#product-v3-demo')
    await expect(card).toBeVisible()
    const badge = await card.getByText('Sắp mở dùng thử').isVisible()
    const buttonDisabled = await card.getByRole('button', { name: 'Sắp mở', exact: true }).isDisabled()
    await capture(page, 'DEMO-06', 'stock-exhausted.png')
    const token = await page.evaluate(() => localStorage.getItem('access_token'))
    const response = await request.post('http://127.0.0.1:5051/api/orders/demo/checkout', {
      headers: { Authorization: `Bearer ${token}` },
      data: { requestKey: crypto.randomUUID(), quantity: 1, fullName: marker },
    })
    const created = await db.from('orders').select('id').eq('shipping_name', marker)
    if (created.error) throw created.error
    soldOut = { badge, buttonDisabled, responseStatus: response.status(), body: await response.json(), createdOrders: created.data || [] }
  } finally {
    const restore = await db.from('devices').update({ is_active: false }).eq('id', stock.data.id)
    if (restore.error) throw restore.error
  }
  const evidence = { dialogs, mixedCreatedIds, mixedSuccessShown, soldOut }
  const folder = join(evidenceDir, 'DEMO-06')
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'mixed-and-out-of-stock.json'), JSON.stringify(evidence, null, 2), 'utf8')
  for (const id of mixedCreatedIds) {
    await db.from('order_items').delete().eq('order_id', id)
    await db.from('orders').delete().eq('id', id)
  }
  for (const row of soldOut?.createdOrders || []) await cleanupDemoOrder(db, (row as { id: number }).id)
  expect(dialogs.some(message => message.includes('đơn riêng'))).toBe(true)
  expect(mixedCreatedIds).toEqual([])
  expect(mixedSuccessShown).toBe(false)
  expect(soldOut).toMatchObject({ badge: true, buttonDisabled: true, responseStatus: 409, createdOrders: [] })
})

test('[DEMO-07] customer B cannot attach A demo MAC or command A demo relay', async ({ request }) => {
  const db = serviceDb()
  const fixture = JSON.parse(await readFile(join('..', 'test-results', 'local-fixtures.json'), 'utf8'))
  const tokenFor = async (email: string) => {
    const auth = await request.post(`${localApi}/auth/v1/token?grant_type=password`, {
      headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY! }, data: { email, password: 'Qa-only-2026!' },
    })
    expect(auth.ok()).toBe(true)
    return (await auth.json()).access_token as string
  }
  const [tokenA, tokenB] = await Promise.all([tokenFor('qa_a@aquacare.test'), tokenFor('qa_b@aquacare.test')])
  const purchase = await request.post('http://127.0.0.1:5051/api/orders/demo/checkout', {
    headers: { Authorization: `Bearer ${tokenA}` },
    data: { requestKey: crypto.randomUUID(), quantity: 1, fullName: 'QA Demo Owner' },
  })
  const purchased = await purchase.json()
  const orderId = purchased.orderId as number | undefined
  expect(purchase.status()).toBe(201)
  let tankAId: number | undefined
  let tankBId: number | undefined
  try {
    const a = await db.from('tanks').insert({ user_id: fixture.a, tank_name: 'QA Demo owner tank', water_volume_liter: 100 }).select('id').single()
    const b = await db.from('tanks').insert({ user_id: fixture.b, tank_name: 'QA Demo other tank', water_volume_liter: 100 }).select('id').single()
    if (a.error) throw a.error
    if (b.error) throw b.error
    tankAId = a.data.id
    tankBId = b.data.id
    const device = await db.from('devices').select('mac_address,relay_pump_state,tank_id').eq('mac_address', 'QA:00:00:00:00:01').single()
    if (device.error) throw device.error
    const headers = { apikey: process.env.VITE_SUPABASE_ANON_KEY!, Authorization: `Bearer ${tokenB}`, Prefer: 'return=representation' }
    const attachB = await request.patch(`${localApi}/rest/v1/devices?mac_address=eq.QA%3A00%3A00%3A00%3A00%3A01`, {
      headers, data: { tank_id: tankBId },
    })
    const afterAttach = await db.from('devices').select('tank_id').eq('mac_address', device.data.mac_address).single()
    const attachA = await db.from('devices').update({ tank_id: tankAId }).eq('mac_address', device.data.mac_address)
    if (attachA.error) throw attachA.error
    const relay = await request.post('http://127.0.0.1:5051/api/device/relay', {
      headers: { Authorization: `Bearer ${tokenB}` },
      data: { tank_id: tankAId, pin: 3, state: true, relay_field: 'relay_pump_state' },
    })
    const afterRelay = await db.from('devices').select('relay_pump_state,tank_id').eq('mac_address', device.data.mac_address).single()
    const evidence = { purchaseStatus: purchase.status(), orderId, mac: device.data.mac_address,
      attachB: { status: attachB.status(), body: await attachB.json(), savedTankId: afterAttach.data?.tank_id },
      relayB: { status: relay.status(), body: await relay.json(), beforeState: device.data.relay_pump_state,
        afterState: afterRelay.data?.relay_pump_state, savedTankId: afterRelay.data?.tank_id },
      ownerTankId: tankAId, otherTankId: tankBId }
    const folder = join(evidenceDir, 'DEMO-07')
    await mkdir(folder, { recursive: true })
    await writeFile(join(folder, 'cross-owner-demo-mac.json'), JSON.stringify(evidence, null, 2), 'utf8')
    expect(afterAttach.data?.tank_id).toBeNull()
    expect([401, 403]).toContain(relay.status())
    expect(afterRelay.data?.relay_pump_state).toBe(device.data.relay_pump_state)
  } finally {
    if (orderId) await cleanupDemoOrder(db, orderId)
    await db.from('devices').update({ relay_pump_state: false }).eq('mac_address', 'QA:00:00:00:00:01')
    if (tankAId) await db.from('tanks').delete().eq('id', tankAId)
    if (tankBId) await db.from('tanks').delete().eq('id', tankBId)
  }
})

test('[SHOP-01] cart combines repeated V3, adjusts quantity, persists after reload and can be removed', async ({ page }) => {
  await page.goto('/')
  const advanced = page.locator('#products .glass-card').filter({ hasText: 'AquaCare Advanced' })
  await expect(advanced).toBeVisible()
  await advanced.locator('.product-action-bar button').last().click()
  await advanced.locator('.product-action-bar button').last().click()
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('aquacare_cart') || '[]'))).toMatchObject([
    expect.objectContaining({ id: 'v3', quantity: 2 }),
  ])
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Giỏ hàng của bạn' })).toBeVisible()
  await expect(page.getByText(/7\.400\.000/).first()).toBeVisible()
  await capture(page, 'SHOP-01', 'two-products.png')
  const advancedRow = page.getByRole('heading', { name: 'AquaCare Advanced' }).locator('xpath=../..')
  await advancedRow.locator('button').first().click()
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('aquacare_cart') || '[]').find((item: { id: string }) => item.id === 'v3')?.quantity)).toBe(1)
  await expect(page.getByText(/3\.700\.000/).first()).toBeVisible()
  await advancedRow.locator('button').nth(1).click()
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('aquacare_cart') || '[]').find((item: { id: string }) => item.id === 'v3')?.quantity)).toBe(2)
  await expect(page.getByText(/7\.400\.000/).first()).toBeVisible()
  await page.reload()
  await expect(page.getByRole('heading', { name: 'AquaCare Advanced' })).toBeVisible()
  await expect(page.getByText(/7\.400\.000/).first()).toBeVisible()
  const advancedRowAfterReload = page.getByRole('heading', { name: 'AquaCare Advanced' }).locator('xpath=../..')
  await advancedRowAfterReload.getByRole('button', { name: 'Xóa' }).click()
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('aquacare_cart') || '[]'))).toEqual([])
  await expect(page.getByRole('heading', { name: 'Giỏ hàng trống' })).toBeVisible()
  await capture(page, 'SHOP-01', 'after-reload.png')
})

test('[SHOP-09] transfer option shows placeholder QR without confirming payment', async ({ page }) => {
  await page.goto('/')
  const advanced = page.locator('#products .glass-card').filter({ hasText: 'AquaCare Advanced' })
  await expect(advanced).toBeVisible()
  await advanced.locator('.product-action-bar button').last().click()
  await page.goto('/cart')
  await page.getByRole('button', { name: /thanh toán/i }).click()
  await page.getByRole('radio', { name: 'Chuyển khoản ngân hàng' }).check()
  await expect(page.getByText('Quét mã QR dưới đây')).toBeVisible()
  await expect(page.getByRole('img', { name: 'QR Code' })).toHaveAttribute('src', /example_qr_code/)
  await expect(page.getByRole('heading', { name: 'Đặt hàng thành công!' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Xác nhận đặt hàng' })).toBeVisible()
  await capture(page, 'SHOP-09', 'transfer-placeholder.png')
})

test('[SHOP-02] invalid quantities and an empty cart cannot proceed to checkout', async ({ page }) => {
  test.setTimeout(60_000)
  await page.goto('/cart')
  await expect(page.getByRole('heading', { name: 'Giỏ hàng trống' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tiến hành thanh toán' })).toHaveCount(0)
  const samples = [0, -1, 1.5, 999999]
  const outcomes = []
  for (const quantity of samples) {
    await page.evaluate(value => localStorage.setItem('aquacare_cart', JSON.stringify([{
      id: 'v3', name: 'AquaCare Advanced', description: 'Test fixture', price: 3700000,
      image: '/images/Version3.png', quantity: value,
    }])), quantity)
    await page.reload()
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('aquacare_cart') || '[]'))
    const canCheckout = await page.getByRole('button', { name: 'Tiến hành thanh toán' }).isVisible().catch(() => false)
    const totalText = await page.getByText('Tổng cộng:').locator('xpath=..').innerText({ timeout: 1000 }).catch(() => '')
    outcomes.push({ quantity, storedQuantity: stored[0]?.quantity ?? null, canCheckout, totalText })
    await capture(page, 'SHOP-02', `quantity-${String(quantity).replace('.', '-')}.png`)
  }
  const folder = join(evidenceDir, 'SHOP-02')
  await writeFile(join(folder, 'quantity-results.json'), JSON.stringify(outcomes, null, 2), 'utf8')
  for (const result of outcomes) {
    expect(result.canCheckout, `quantity ${result.quantity}`).toBe(false)
    expect(result.totalText).not.toMatch(/NaN|-\d/)
  }
})

test('[SHOP-05] checkout rejects missing and malformed contact fields and limits notes to 60 words', async ({ page }) => {
  test.setTimeout(45_000)
  await page.goto('/')
  const advanced = page.locator('#products .glass-card').filter({ hasText: 'AquaCare Advanced' })
  await expect(advanced).toBeVisible()
  await advanced.locator('.product-action-bar button').last().click()
  await page.goto('/cart')
  await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click()
  const form = page.locator('#checkout-form')
  const field = (name: string) => form.locator(`[name="${name}"]`)
  const valid = { fullName: 'QA Local', phone: '0900000123', email: 'qa@example.test', address: 'Test local only' }
  for (const [name, value] of Object.entries(valid)) await field(name).fill(value)
  let attemptedOrders = 0
  await page.route('**/rest/v1/orders*', async route => {
    attemptedOrders++
    await route.fulfill({ status: 400, contentType: 'application/json', body: '{"message":"Blocked by isolated validation test"}' })
  })
  page.on('dialog', dialog => dialog.dismiss())
  const outcomes = []
  for (const name of Object.keys(valid)) {
    await field(name).fill('')
    await page.getByRole('button', { name: 'Xác nhận đặt hàng' }).click()
    outcomes.push({ sample: `empty-${name}`, valid: await form.evaluate((element: HTMLFormElement) => element.checkValidity()), attemptedOrders })
    await field(name).fill(valid[name as keyof typeof valid])
  }
  await field('email').fill('not-an-email')
  await page.getByRole('button', { name: 'Xác nhận đặt hàng' }).click()
  outcomes.push({ sample: 'invalid-email', valid: await form.evaluate((element: HTMLFormElement) => element.checkValidity()), attemptedOrders })
  await field('email').fill(valid.email)
  await field('phone').fill('bad-phone')
  await page.getByRole('button', { name: 'Xác nhận đặt hàng' }).click()
  await page.waitForTimeout(800)
  outcomes.push({ sample: 'invalid-phone', valid: await form.evaluate((element: HTMLFormElement) => element.checkValidity()), attemptedOrders })
  const note = field('note')
  await note.fill(Array.from({ length: 60 }, () => 'qa').join(' '))
  const atSixty = await note.inputValue()
  await note.fill(Array.from({ length: 61 }, () => 'qa').join(' '))
  const afterSixtyOne = await note.inputValue()
  outcomes.push({ sample: 'note-limit', atSixtyWords: atSixty.split(/\s+/).length, afterSixtyOneWords: afterSixtyOne.split(/\s+/).length })
  await capture(page, 'SHOP-05', 'validation.png')
  const folder = join(evidenceDir, 'SHOP-05')
  await writeFile(join(folder, 'validation-results.json'), JSON.stringify(outcomes, null, 2), 'utf8')
  expect(outcomes.filter(item => item.sample.startsWith('empty-') || item.sample === 'invalid-email').every(item => item.valid === false && item.attemptedOrders === 0)).toBe(true)
  expect(outcomes.find(item => item.sample === 'invalid-phone')?.valid).toBe(false)
  expect(outcomes.find(item => item.sample === 'invalid-phone')?.attemptedOrders).toBe(0)
  expect(afterSixtyOne.split(/\s+/).length).toBe(60)
})

test('[SHOP-03] guest COD checkout creates one pending order with matching items before clearing cart', async ({ page }) => {
  const db = serviceDb()
  const email = `qa-guest-${Date.now()}@aquacare.test`
  await page.goto('/')
  const advanced = page.locator('#products .glass-card').filter({ hasText: 'AquaCare Advanced' })
  await expect(advanced).toBeVisible()
  await advanced.locator('.product-action-bar button').last().click()
  await page.goto('/cart')
  await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click()
  await page.locator('[name="fullName"]').fill('QA Guest')
  await page.locator('[name="phone"]').fill('0900000888')
  await page.locator('[name="email"]').fill(email)
  await page.locator('[name="address"]').fill('QA local address')
  await expect(page.getByRole('radio', { name: /COD/ })).toBeChecked()
  await page.getByRole('button', { name: 'Xác nhận đặt hàng' }).click()
  await page.getByRole('heading', { name: 'Đặt hàng thành công!' }).waitFor({ timeout: 10_000 }).catch(() => {})
  const success = await page.getByRole('heading', { name: 'Đặt hàng thành công!' }).isVisible().catch(() => false)
  const { data: orders, error } = await db.from('orders').select('id,user_id,status,total_price,shipping_address,payment_method').eq('shipping_email', email)
  if (error) throw error
  const order = orders?.[0]
  const items = order ? (await db.from('order_items').select('product_id,quantity,product_price').eq('order_id', order.id)).data : []
  const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('aquacare_cart') || '[]'))
  const evidence = { success, orders, items, cart }
  const folder = join(evidenceDir, 'SHOP-03')
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'guest-order.json'), JSON.stringify(evidence, null, 2), 'utf8')
  await capture(page, 'SHOP-03', 'checkout-result.png')
  expect(success).toBe(true)
  expect(orders).toHaveLength(1)
  expect(order).toMatchObject({ user_id: null, status: 'pending', total_price: 3700000, payment_method: 'cod', shipping_address: 'QA local address' })
  expect(items).toEqual([expect.objectContaining({ product_id: 'v3', quantity: 1, product_price: 3700000 })])
  expect(cart).toEqual([])
  if (order) {
    await db.from('order_items').delete().eq('order_id', order.id)
    await db.from('orders').delete().eq('id', order.id)
  }
})

test('[SHOP-06] a slow double-click checkout creates only one order and keeps cart until response', async ({ page }) => {
  const db = serviceDb()
  const email = `qa-double-${Date.now()}@aquacare.test`
  await page.goto('/')
  const advanced = page.locator('#products .glass-card').filter({ hasText: 'AquaCare Advanced' })
  await expect(advanced).toBeVisible()
  await advanced.locator('.product-action-bar button').last().click()
  await page.goto('/cart')
  await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click()
  await page.locator('[name="fullName"]').fill('QA Double')
  await page.locator('[name="phone"]').fill('0900000666')
  await page.locator('[name="email"]').fill(email)
  await page.locator('[name="address"]').fill('QA local slow checkout')
  let postCount = 0
  await page.route('**/rest/v1/orders?**', async route => {
    if (route.request().method() === 'POST') {
      postCount++
      await new Promise(resolve => setTimeout(resolve, 600))
    }
    await route.continue()
  })
  const submit = page.locator('button[form="checkout-form"]')
  const clickPromise = submit.click()
  await expect(submit).toBeDisabled()
  const cartDuringWait = await page.evaluate(() => JSON.parse(localStorage.getItem('aquacare_cart') || '[]'))
  await submit.evaluate((el: HTMLButtonElement) => el.click())
  await clickPromise
  await expect(page.getByRole('heading', { name: 'Đặt hàng thành công!' })).toBeVisible()
  const orders = await db.from('orders').select('id,status,total_price').eq('shipping_email', email)
  if (orders.error) throw orders.error
  const items = orders.data?.[0] ? await db.from('order_items').select('id').eq('order_id', orders.data[0].id) : { data: [] }
  const cartAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('aquacare_cart') || '[]'))
  const evidence = { postCount, cartDuringWait, orders: orders.data, items: items.data, cartAfter }
  const folder = join(evidenceDir, 'SHOP-06')
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'slow-double-click.json'), JSON.stringify(evidence, null, 2), 'utf8')
  await capture(page, 'SHOP-06', 'checkout-success.png')
  if (orders.data?.[0]) {
    await db.from('order_items').delete().eq('order_id', orders.data[0].id)
    await db.from('orders').delete().eq('id', orders.data[0].id)
  }
  expect(postCount).toBe(1)
  expect(cartDuringWait).toHaveLength(1)
  expect(orders.data).toHaveLength(1)
  expect(items.data).toHaveLength(1)
  expect(cartAfter).toEqual([])
})

test('[SHOP-07] failed order items insert does not leave a processable empty order', async ({ page }) => {
  const db = serviceDb()
  const email = `qa-items-fail-${Date.now()}@aquacare.test`
  await page.goto('/')
  const advanced = page.locator('#products .glass-card').filter({ hasText: 'AquaCare Advanced' })
  await expect(advanced).toBeVisible()
  await advanced.locator('.product-action-bar button').last().click()
  await page.goto('/cart')
  await page.getByRole('button', { name: 'Tiến hành thanh toán' }).click()
  await page.locator('[name="fullName"]').fill('QA Items Fail')
  await page.locator('[name="phone"]').fill('0900000777')
  await page.locator('[name="email"]').fill(email)
  await page.locator('[name="address"]').fill('QA local failed order items')
  const dialogs: string[] = []
  page.on('dialog', async dialog => { dialogs.push(dialog.message()); await dialog.dismiss() })
  let itemPostCount = 0
  await page.route('**/rest/v1/order_items*', async route => {
    if (route.request().method() === 'POST') {
      itemPostCount++
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"QA isolated item insert failure"}' })
    } else await route.continue()
  })
  const itemResponse = page.waitForResponse(response => response.url().includes('/rest/v1/order_items') && response.request().method() === 'POST')
  await page.locator('button[form="checkout-form"]').click()
  await itemResponse
  await expect.poll(() => dialogs.length).toBeGreaterThan(0)
  const orders = await db.from('orders').select('id,status,total_price').eq('shipping_email', email)
  if (orders.error) throw orders.error
  const items = orders.data?.[0] ? await db.from('order_items').select('id').eq('order_id', orders.data[0].id) : { data: [] }
  const successShown = await page.getByRole('heading', { name: 'Đặt hàng thành công!' }).isVisible().catch(() => false)
  const cart = await page.evaluate(() => JSON.parse(localStorage.getItem('aquacare_cart') || '[]'))
  const evidence = { itemPostCount, dialogs, orders: orders.data, items: items.data, successShown, cart }
  const folder = join(evidenceDir, 'SHOP-07')
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'failed-items-insert.json'), JSON.stringify(evidence, null, 2), 'utf8')
  await capture(page, 'SHOP-07', 'after-items-error.png')
  await db.from('orders').delete().eq('shipping_email', email)
  expect(itemPostCount).toBe(1)
  expect(successShown).toBe(false)
  expect(cart).toHaveLength(1)
  expect(orders.data).toEqual([])
})

test('[SHOP-11] subscription catalog handles data, empty data and load errors', async ({ page }) => {
  test.setTimeout(60_000)
  const db = serviceDb()
  const stamp = Date.now()
  const rows = [
    { name: `QA Free ${stamp}`, plan_type: 'free', price: 0, duration_months: 1, max_tanks: 1, smart_device_setup: false, history_days: 7 },
    { name: `QA Premium ${stamp}`, plan_type: 'premium', price: 99000, duration_months: 3, max_tanks: 5, smart_device_setup: true, history_days: 90 },
    { name: `QA Enterprise ${stamp}`, plan_type: 'enterprise', price: 299000, duration_months: 12, max_tanks: 25, smart_device_setup: true, history_days: 365 },
  ]
  const created = await db.from('subscription_plans').insert(rows).select('id,name')
  if (created.error) throw created.error
  const ids = (created.data || []).map(row => row.id)
  try {
    await page.goto('/')
    const section = page.locator('#subscriptions')
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByText(rows[0].name)).toBeVisible()
    const names = await Promise.all(rows.map(row => section.getByText(row.name).isVisible()))
    const free = await section.getByText('Miễn phí').isVisible()
    const premium = await section.getByText(/99[.,]000/).first().isVisible()
    const benefit = await section.getByText('5 bể cá').first().isVisible()
    const history = await section.getByText('90 ngày').first().isVisible()
    const duration = await section.getByText(/3 tháng/).isVisible().catch(() => false)
    await capture(page, 'SHOP-11', 'catalog-with-data.png')

    await page.route('**/rest/v1/subscription_plans?**', route => route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }))
    await page.reload()
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByRole('status')).toBeVisible({ timeout: 30_000 })
    await expect(section.locator('.glass-card')).toHaveCount(0)
    const emptyNotice = await section.getByText(/chưa có gói|không có gói|trống/i).isVisible().catch(() => false)
    await capture(page, 'SHOP-11', 'catalog-empty.png')

    await page.unroute('**/rest/v1/subscription_plans?**')
    await page.route('**/rest/v1/subscription_plans?**', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"QA isolated outage"}' }))
    await page.reload()
    await section.scrollIntoViewIfNeeded()
    await expect(section.getByRole('status')).toBeVisible({ timeout: 30_000 })
    await expect(section.locator('.glass-card')).toHaveCount(0)
    const errorNotice = await section.getByText(/không tải|thử lại|lỗi/i).isVisible().catch(() => false)
    await capture(page, 'SHOP-11', 'catalog-load-error.png')

    const evidence = { names, free, premium, benefit, history, duration, emptyNotice, errorNotice }
    const folder = join(evidenceDir, 'SHOP-11')
    await mkdir(folder, { recursive: true })
    await writeFile(join(folder, 'catalog-results.json'), JSON.stringify(evidence, null, 2), 'utf8')
    expect(names).toEqual([true, true, true])
    expect(free && premium && benefit && history && duration && emptyNotice && errorNotice).toBe(true)
  } finally {
    if (ids.length) await db.from('subscription_plans').delete().in('id', ids)
  }
})

test('[SUP-01] guest and customer support requests create separate pending records', async ({ page }) => {
  const db = serviceDb()
  const fixture = JSON.parse(await readFile(join('..', 'test-results', 'local-fixtures.json'), 'utf8'))
  const marker = `QA support ${Date.now()}`
  const guestEmail = `qa-support-${Date.now()}@aquacare.test`
  await page.goto('/')
  const form = page.locator('#contact form')
  await form.getByPlaceholder('Nguyễn Văn A').fill('QA Guest')
  await form.getByPlaceholder('email@example.com').fill(guestEmail)
  await form.getByPlaceholder('Mô tả sự cố hoặc thắc mắc cần giải đáp...').fill(`${marker} guest`)
  await form.getByRole('button', { name: 'Gửi yêu cầu hỗ trợ' }).click()
  await expect(page.getByText('Yêu cầu hỗ trợ đã được gửi thành công')).toBeVisible()
  await capture(page, 'SUP-01', 'guest-submitted.png')
  const guestResult = await db.from('support_requests').select('id,user_id,email,message,status,phone,address').eq('email', guestEmail)
  if (guestResult.error) throw guestResult.error

  await loginCustomer(page)
  await page.goto('/')
  const customerForm = page.locator('#contact form')
  await customerForm.getByPlaceholder('Mô tả sự cố hoặc thắc mắc cần giải đáp...').fill(`${marker} customer`)
  await customerForm.getByRole('button', { name: 'Gửi yêu cầu hỗ trợ' }).click()
  await expect(page.getByText('Yêu cầu hỗ trợ đã được gửi thành công')).toBeVisible()
  await capture(page, 'SUP-01', 'customer-submitted.png')
  const customerResult = await db.from('support_requests').select('id,user_id,email,message,status').eq('message', `${marker} customer`)
  if (customerResult.error) throw customerResult.error
  const evidence = { guest: guestResult.data, customer: customerResult.data }
  const folder = join(evidenceDir, 'SUP-01')
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'requests.json'), JSON.stringify(evidence, null, 2), 'utf8')
  expect(guestResult.data).toHaveLength(1)
  expect(guestResult.data?.[0]).toMatchObject({ user_id: null, email: guestEmail, message: `${marker} guest`, status: 'pending', phone: null, address: null })
  expect(customerResult.data).toHaveLength(1)
  expect(customerResult.data?.[0]).toMatchObject({ user_id: fixture.a, email: 'qa_a@aquacare.test', message: `${marker} customer`, status: 'pending' })
})

test('[SUP-02] support form validates fields and reports database errors without duplicate sends', async ({ page }) => {
  const db = serviceDb()
  const email = `qa-support-validation-${Date.now()}@aquacare.test`
  const message = `QA support validation ${Date.now()}`
  await page.goto('/#contact')
  const form = page.locator('#contact form')
  const button = form.locator('button[type="submit"]')
  await button.click()
  const missingBlocked = await form.getByPlaceholder('Nguyễn Văn A').evaluate((el: HTMLInputElement) => !el.validity.valid)
  await form.getByPlaceholder('Nguyễn Văn A').fill('QA Validation')
  await form.getByPlaceholder('email@example.com').fill('bad-email')
  await form.getByPlaceholder('Mô tả sự cố hoặc thắc mắc cần giải đáp...').fill(message)
  await button.click()
  const emailBlocked = await form.getByPlaceholder('email@example.com').evaluate((el: HTMLInputElement) => !el.validity.valid)
  await form.getByPlaceholder('email@example.com').fill(email)

  let failedCalls = 0
  await page.route('**/rest/v1/support_requests', async route => {
    if (route.request().method() === 'POST') {
      failedCalls++
      await route.fulfill({ status: 503, contentType: 'application/json', body: '{"message":"QA isolated DB outage"}' })
    } else await route.continue()
  })
  await button.click()
  await expect(page.getByText('Lỗi từ Supabase: QA isolated DB outage')).toBeVisible()
  const falseSuccess = await page.getByText('Yêu cầu hỗ trợ đã được gửi thành công').isVisible().catch(() => false)
  await capture(page, 'SUP-02', 'database-error.png')
  await page.unroute('**/rest/v1/support_requests')

  let successfulCalls = 0
  await page.route('**/rest/v1/support_requests', async route => {
    if (route.request().method() === 'POST') {
      successfulCalls++
      await new Promise(resolve => setTimeout(resolve, 300))
    }
    await route.continue()
  })
  const clickPromise = button.click()
  await expect(button).toBeDisabled()
  const disabledWhileSending = await button.isDisabled()
  await button.evaluate((el: HTMLButtonElement) => el.click())
  await clickPromise
  await expect(page.getByText('Yêu cầu hỗ trợ đã được gửi thành công')).toBeVisible()
  const saved = await db.from('support_requests').select('id,email,message').eq('email', email).eq('message', message)
  if (saved.error) throw saved.error
  const evidence = { missingBlocked, emailBlocked, failedCalls, falseSuccess, disabledWhileSending, successfulCalls, saved: saved.data }
  const folder = join(evidenceDir, 'SUP-02')
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'validation-results.json'), JSON.stringify(evidence, null, 2), 'utf8')
  await capture(page, 'SUP-02', 'successful-send.png')
  expect(missingBlocked && emailBlocked && disabledWhileSending).toBe(true)
  expect(failedCalls).toBe(1)
  expect(falseSuccess).toBe(false)
  expect(successfulCalls).toBe(1)
  expect(saved.data).toHaveLength(1)
})

test('[SEC-10] backend CORS rejects foreign origins and does not replace authentication', async ({ request }) => {
  const endpoint = 'http://127.0.0.1:5051/api/admin/dashboard'
  const allowed = await request.fetch(endpoint, {
    method: 'OPTIONS',
    headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'GET' },
  })
  expect(allowed.status()).toBe(204)
  expect(allowed.headers()['access-control-allow-origin']).toBe('http://localhost:5173')

  const denied = await request.fetch(endpoint, {
    method: 'OPTIONS',
    headers: { Origin: 'https://untrusted.example', 'Access-Control-Request-Method': 'GET' },
  })
  expect(denied.headers()['access-control-allow-origin']).toBeUndefined()

  const originless = await request.get(endpoint)
  expect(originless.status()).toBe(401)
  const evidence = {
    allowedOrigin: { status: allowed.status(), allowOrigin: allowed.headers()['access-control-allow-origin'] },
    foreignOrigin: { status: denied.status(), allowOrigin: denied.headers()['access-control-allow-origin'] ?? null },
    originlessPrivateRequest: { status: originless.status() },
  }
  const folder = join(evidenceDir, 'SEC-10')
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'cors-results.json'), JSON.stringify(evidence, null, 2), 'utf8')
})

test('[SEC-02] relay rejects missing token and a different tank owner before changing state', async ({ request }) => {
  const fixtures = JSON.parse(await readFile(join('..', 'test-results', 'local-fixtures.json'), 'utf8'))
  const api = 'http://127.0.0.1:5051/api/device/relay'
  const local = 'http://127.0.0.1:54321'
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY!
  const readState = async () => {
    const response = await request.get(`${local}/rest/v1/devices?tank_id=eq.${fixtures.tankB}&select=relay_pump_state`, {
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
    })
    expect(response.ok()).toBe(true)
    return (await response.json())[0]?.relay_pump_state
  }
  const before = await readState()
  const payload = { tank_id: fixtures.tankB, pin: 3, state: !before, relay_field: 'relay_pump_state' }
  const anonymous = await request.post(api, { data: payload })
  const afterAnonymous = await readState()

  const login = await request.post(`${local}/auth/v1/token?grant_type=password`, {
    headers: { apikey: anonKey }, data: { email: 'qa_a@aquacare.test', password: 'Qa-only-2026!' },
  })
  expect(login.ok()).toBe(true)
  const accessToken = (await login.json()).access_token as string
  const crossOwner = await request.post(api, { headers: { Authorization: `Bearer ${accessToken}` }, data: payload })
  const afterCrossOwner = await readState()
  const folder = join(evidenceDir, 'SEC-02')
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'relay-access-results.json'), JSON.stringify({
    anonymousStatus: anonymous.status(), crossOwnerStatus: crossOwner.status(),
    before, afterAnonymous, afterCrossOwner,
  }, null, 2), 'utf8')
  expect([401, 403]).toContain(anonymous.status())
  expect(afterAnonymous).toBe(before)
  expect([401, 403]).toContain(crossOwner.status())
  expect(afterCrossOwner).toBe(before)
})

test('[SEC-03] relay rejects string state, invalid pin and mismatched field', async ({ request }) => {
  const fixtures = JSON.parse(await readFile(join('..', 'test-results', 'local-fixtures.json'), 'utf8'))
  const api = 'http://127.0.0.1:5051/api/device/relay'
  const samples = [
    { name: 'string-state', pin: 3, state: 'false', relay_field: 'relay_pump_state' },
    { name: 'invalid-pin', pin: 99, state: true, relay_field: 'relay_pump_state' },
    { name: 'mismatched-field', pin: 3, state: true, relay_field: 'relay_light_state' },
  ]
  const outcomes = []
  for (const sample of samples) {
    const response = await request.post(api, { data: { tank_id: fixtures.tankB, ...sample } })
    outcomes.push({ name: sample.name, status: response.status() })
  }
  const folder = join(evidenceDir, 'SEC-03')
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'relay-validation-results.json'), JSON.stringify(outcomes, null, 2), 'utf8')
  for (const result of outcomes) expect(result.status, result.name).toBe(400)
})

test('[SEC-05] customer A cannot read, create, edit or seize customer B schedules', async ({ request }) => {
  const db = serviceDb()
  const fixture = JSON.parse(await readFile(join('..', 'test-results', 'local-fixtures.json'), 'utf8'))
  const { data: deviceB, error: deviceBError } = await db.from('devices').select('id').eq('mac_address', 'QA:00:00:00:00:02').single()
  if (deviceBError) throw deviceBError
  const { data: deviceA, error: deviceAError } = await db.from('devices').upsert({
    mac_address: 'QA:00:00:00:00:06', firmware_version: 'V1', is_simulator: true,
    is_active: true, tank_id: fixture.tankA,
  }, { onConflict: 'mac_address' }).select('id').single()
  if (deviceAError) throw deviceAError
  let scheduleAId: number | undefined
  let scheduleBId: number | undefined
  let outcomes: Record<string, unknown> = {}
  try {
    const a = await db.from('device_schedules').insert({ device_id: deviceA.id, relay_name: 'Pump', on_time: '09:00:00', is_daily: true }).select('id').single()
    const b = await db.from('device_schedules').insert({ device_id: deviceB.id, relay_name: 'Pump', on_time: '09:00:00', is_daily: true }).select('id').single()
    if (a.error) throw a.error
    if (b.error) throw b.error
    scheduleAId = a.data.id
    scheduleBId = b.data.id
    const auth = await request.post(`${localApi}/auth/v1/token?grant_type=password`, {
      headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY! },
      data: { email: 'qa_a@aquacare.test', password: 'Qa-only-2026!' },
    })
    expect(auth.ok()).toBe(true)
    const token = (await auth.json()).access_token as string
    const headers = { apikey: process.env.VITE_SUPABASE_ANON_KEY!, Authorization: `Bearer ${token}`, Prefer: 'return=representation' }
    const api = `${localApi}/rest/v1/device_schedules`
    const readB = await request.get(`${api}?select=id&device_id=eq.${deviceB.id}`, { headers })
    const beforeB = await db.from('device_schedules').select('id', { count: 'exact', head: true }).eq('device_id', deviceB.id)
    const createB = await request.post(api, { headers, data: { device_id: deviceB.id, relay_name: 'Light', on_time: '11:00:00', is_daily: true } })
    const afterB = await db.from('device_schedules').select('id', { count: 'exact', head: true }).eq('device_id', deviceB.id)
    const editB = await request.patch(`${api}?id=eq.${scheduleBId}`, { headers, data: { on_time: '12:00:00' } })
    const seizeA = await request.patch(`${api}?id=eq.${scheduleAId}`, { headers, data: { device_id: deviceB.id } })
    const { data: scheduleA } = await db.from('device_schedules').select('device_id').eq('id', scheduleAId).single()
    const { data: scheduleB } = await db.from('device_schedules').select('on_time').eq('id', scheduleBId).single()
    outcomes = {
      readB: { status: readB.status(), rows: await readB.json() },
      createB: { status: createB.status(), beforeCount: beforeB.count, afterCount: afterB.count },
      editB: { status: editB.status(), rows: await editB.json(), savedTime: scheduleB?.on_time },
      seizeA: { status: seizeA.status(), rows: await seizeA.json(), savedDeviceId: scheduleA?.device_id },
      expectedDeviceA: deviceA.id,
    }
  } finally {
    if (scheduleAId) await db.from('device_schedules').delete().eq('id', scheduleAId)
    if (scheduleBId) await db.from('device_schedules').delete().eq('id', scheduleBId)
    await db.from('devices').delete().eq('mac_address', 'QA:00:00:00:00:06')
  }
  const folder = join(evidenceDir, 'SEC-05')
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'schedule-rls.json'), JSON.stringify(outcomes, null, 2), 'utf8')
  expect((outcomes.readB as { rows: unknown[] }).rows).toEqual([])
  expect((outcomes.createB as { beforeCount: number; afterCount: number }).afterCount).toBe((outcomes.createB as { beforeCount: number }).beforeCount)
  expect((outcomes.editB as { rows: unknown[]; savedTime: string }).rows).toEqual([])
  expect((outcomes.editB as { savedTime: string }).savedTime).toBe('09:00:00')
  expect((outcomes.seizeA as { status: number }).status).toBeGreaterThanOrEqual(400)
  expect((outcomes.seizeA as { savedDeviceId: number }).savedDeviceId).toBe(outcomes.expectedDeviceA)
})

test('[SEC-01] admin dashboard requires a valid admin token and private responses', async ({ request }) => {
  const api = 'http://127.0.0.1:5051/api/admin/dashboard'
  const local = 'http://127.0.0.1:54321'
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY!
  const tokenFor = async (email: string) => {
    const login = await request.post(`${local}/auth/v1/token?grant_type=password`, {
      headers: { apikey: anonKey }, data: { email, password: 'Qa-only-2026!' },
    })
    expect(login.ok()).toBe(true)
    return (await login.json()).access_token as string
  }
  const noToken = await request.get(api)
  const badToken = await request.get(api, { headers: { Authorization: 'Bearer invalid-qa-token' } })
  const customer = await request.get(api, { headers: { Authorization: `Bearer ${await tokenFor('qa_a@aquacare.test')}` } })
  const admin = await request.get(api, { headers: { Authorization: `Bearer ${await tokenFor('qa_admin@aquacare.test')}` } })
  const annualApi = `${api}/annual?year=2024`
  const annualNoToken = await request.get(annualApi)
  const annualBadToken = await request.get(annualApi, { headers: { Authorization: 'Bearer invalid-qa-token' } })
  const annualCustomer = await request.get(annualApi, { headers: { Authorization: `Bearer ${await tokenFor('qa_a@aquacare.test')}` } })
  const annualAdmin = await request.get(annualApi, { headers: { Authorization: `Bearer ${await tokenFor('qa_admin@aquacare.test')}` } })
  const outcomes = {
    noToken: noToken.status(), badToken: badToken.status(), customer: customer.status(), admin: admin.status(),
    adminCacheControl: admin.headers()['cache-control'] ?? null,
    annual: { noToken: annualNoToken.status(), badToken: annualBadToken.status(),
      customer: annualCustomer.status(), admin: annualAdmin.status(),
      cacheControl: annualAdmin.headers()['cache-control'] ?? null },
  }
  const folder = join(evidenceDir, 'SEC-01')
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'admin-access-results.json'), JSON.stringify(outcomes, null, 2), 'utf8')
  expect(outcomes.noToken).toBe(401)
  expect(outcomes.badToken).toBe(401)
  expect(outcomes.customer).toBe(403)
  expect(outcomes.admin).toBe(200)
  expect(outcomes.adminCacheControl).toContain('no-store')
  expect(outcomes.annual).toMatchObject({ noToken: 401, badToken: 401, customer: 403, admin: 200 })
  expect(outcomes.annual.cacheControl).toContain('no-store')
})

test('[REV-09] annual API defaults to current year and rejects malformed or out-of-range years', async ({ request }) => {
  const auth = await request.post(`${localApi}/auth/v1/token?grant_type=password`, {
    headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY! },
    data: { email: 'qa_admin@aquacare.test', password: 'Qa-only-2026!' },
  })
  expect(auth.ok()).toBe(true)
  const token = (await auth.json()).access_token as string
  const api = 'http://127.0.0.1:5051/api/admin/dashboard/annual'
  const headers = { Authorization: `Bearer ${token}` }
  const currentYear = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric' }).format(new Date()))
  const samples = [
    { label: 'default', query: '', status: 200 },
    { label: '1999', query: '?year=1999', status: 400 },
    { label: 'future', query: `?year=${currentYear + 1}`, status: 400 },
    { label: 'letters', query: '?year=abc', status: 400 },
    { label: 'fraction', query: '?year=2026.5', status: 400 },
    { label: 'duplicate', query: '?year=2024&year=2025', status: 400 },
  ]
  const outcomes = []
  for (const sample of samples) {
    const response = await request.get(`${api}${sample.query}`, { headers })
    const body = await response.json()
    outcomes.push({ label: sample.label, status: response.status(), year: body.year ?? null, error: body.error ?? null })
  }
  const folder = join(evidenceDir, 'REV-09')
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'year-validation.json'), JSON.stringify(outcomes, null, 2), 'utf8')
  for (const [index, sample] of samples.entries()) expect(outcomes[index].status, sample.label).toBe(sample.status)
  expect(outcomes[0].year).toBe(currentYear)
})

test('[REV-11] annual revenue paginates 1001 delivered orders sharing one timestamp', async ({ request }) => {
  test.setTimeout(60_000)
  const db = serviceDb()
  const marker = `qa-rev11-${Date.now()}@aquacare.test`
  const auth = await request.post(`${localApi}/auth/v1/token?grant_type=password`, {
    headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY! },
    data: { email: 'qa_admin@aquacare.test', password: 'Qa-only-2026!' },
  })
  expect(auth.ok()).toBe(true)
  const token = (await auth.json()).access_token as string
  const url = 'http://127.0.0.1:5051/api/admin/dashboard/annual?year=2020'
  const headers = { Authorization: `Bearer ${token}` }
  const baselineResponse = await request.get(url, { headers })
  expect(baselineResponse.status()).toBe(200)
  const baseline = await baselineResponse.json()
  const baselineJune = baseline.months.find((row: { month: number }) => row.month === 6)?.revenue
  try {
    const row = { user_id: null, shipping_name: 'QA Pagination', shipping_phone: '0900000111', shipping_email: marker,
      shipping_address: 'QA local only', total_price: 1, status: 'delivered', payment_method: 'cod', created_at: '2020-06-15T12:00:00.000Z' }
    for (let start = 0; start < 1001; start += 250) {
      const batch = Array.from({ length: Math.min(250, 1001 - start) }, () => ({ ...row }))
      const inserted = await db.from('orders').insert(batch)
      if (inserted.error) throw inserted.error
    }
    const saved = await db.from('orders').select('id', { count: 'exact', head: true }).eq('shipping_email', marker)
    if (saved.error) throw saved.error
    const response = await request.get(url, { headers })
    const result = await response.json()
    const juneRevenue = result.months?.find((entry: { month: number }) => entry.month === 6)?.revenue
    const evidence = { baselineJune, insertedCount: saved.count, responseStatus: response.status(), juneRevenue, delta: juneRevenue - baselineJune }
    const folder = join(evidenceDir, 'REV-11')
    await mkdir(folder, { recursive: true })
    await writeFile(join(folder, 'pagination-1001.json'), JSON.stringify(evidence, null, 2), 'utf8')
    expect(response.status()).toBe(200)
    expect(saved.count).toBe(1001)
    expect(juneRevenue - baselineJune).toBe(1001)
  } finally {
    await db.from('orders').delete().eq('shipping_email', marker)
  }
})

test('[REV-07] annual revenue assigns exact Vietnam year boundaries once', async ({ request }) => {
  const db = serviceDb()
  const marker = `qa-rev07-${Date.now()}@aquacare.test`
  const auth = await request.post(`${localApi}/auth/v1/token?grant_type=password`, {
    headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY! },
    data: { email: 'qa_admin@aquacare.test', password: 'Qa-only-2026!' },
  })
  expect(auth.ok()).toBe(true)
  const token = (await auth.json()).access_token as string
  const headers = { Authorization: `Bearer ${token}` }
  const annual = async (year: number) => {
    const response = await request.get(`http://127.0.0.1:5051/api/admin/dashboard/annual?year=${year}`, { headers })
    expect(response.status()).toBe(200)
    return response.json()
  }
  const years = [2019, 2020, 2021]
  const before = await Promise.all(years.map(annual))
  try {
    const points = [
      { at: '2019-12-31T16:59:59.999Z', price: 11 },
      { at: '2019-12-31T17:00:00.000Z', price: 13 },
      { at: '2020-12-31T16:59:59.999Z', price: 17 },
      { at: '2020-12-31T17:00:00.000Z', price: 19 },
    ]
    const inserted = await db.from('orders').insert(points.map(point => ({
      user_id: null, shipping_name: 'QA Boundary', shipping_phone: '0900000111', shipping_email: marker,
      shipping_address: 'QA local only', total_price: point.price, status: 'delivered', payment_method: 'cod', created_at: point.at,
    })))
    if (inserted.error) throw inserted.error
    const after = await Promise.all(years.map(annual))
    const at = (data: any, month: number) => Number(data.months.find((row: { month: number }) => row.month === month).revenue)
    const deltas = {
      dec2019: at(after[0], 12) - at(before[0], 12),
      jan2020: at(after[1], 1) - at(before[1], 1),
      dec2020: at(after[1], 12) - at(before[1], 12),
      jan2021: at(after[2], 1) - at(before[2], 1),
    }
    const folder = join(evidenceDir, 'REV-07')
    await mkdir(folder, { recursive: true })
    await writeFile(join(folder, 'vietnam-boundaries.json'), JSON.stringify({ points, deltas }, null, 2), 'utf8')
    expect(deltas).toEqual({ dec2019: 11, jan2020: 13, dec2020: 17, jan2021: 19 })
  } finally {
    await db.from('orders').delete().eq('shipping_email', marker)
  }
})

test('[AUTH-07:partial] local email login works and invalid credentials create no session', async ({ request }) => {
  const api = 'http://127.0.0.1:5051/api/auth/login'
  const attempts = [
    { name: 'email', identifier: 'qa_a@aquacare.test', password: 'Qa-only-2026!' },
    { name: 'phone', identifier: '+84900000001', password: 'Qa-only-2026!' },
    { name: 'wrong-password', identifier: 'qa_a@aquacare.test', password: 'Wrong-password' },
  ]
  const outcomes = []
  for (const attempt of attempts) {
    const response = await request.post(api, { data: { identifier: attempt.identifier, password: attempt.password } })
    const body = await response.json()
    outcomes.push({ name: attempt.name, status: response.status(), userId: body.user_info?.id ?? null, hasToken: !!body.access_token })
  }
  const folder = join(evidenceDir, 'AUTH-07')
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'login-results.json'), JSON.stringify(outcomes, null, 2), 'utf8')
  expect(outcomes[0].status).toBe(200)
  expect(outcomes[0].hasToken).toBe(true)
  expect(outcomes[2].status).toBe(401)
  expect(outcomes[2].hasToken).toBe(false)
})

test('[AUTH-14] guest and customer cannot enter admin or staff by direct URL or forged role storage', async ({ page, request }) => {
  const sensitiveRequests: string[] = []
  page.on('request', req => {
    if (/\/api\/admin\//.test(req.url())) {
      sensitiveRequests.push(req.url().replace(/\?.*$/, ''))
    }
  })
  const outcomes: { actor: string; path: string; finalPath: string; sensitiveRequests: string[] }[] = []
  for (const path of ['/admin', '/staff']) {
    sensitiveRequests.length = 0
    await page.goto(path)
    await expect(page).toHaveURL('http://127.0.0.1:5174/login')
    outcomes.push({ actor: 'guest', path, finalPath: new URL(page.url()).pathname, sensitiveRequests: [...sensitiveRequests] })
    await capture(page, 'AUTH-14', `guest-${path.slice(1)}.png`)
  }

  await loginCustomer(page)
  for (const path of ['/admin', '/staff']) {
    sensitiveRequests.length = 0
    await page.goto(path)
    await expect(page).toHaveURL('http://127.0.0.1:5174/dashboard')
    outcomes.push({ actor: 'customer', path, finalPath: new URL(page.url()).pathname, sensitiveRequests: [...sensitiveRequests] })
    await capture(page, 'AUTH-14', `customer-${path.slice(1)}.png`)
  }

  await page.evaluate(() => {
    for (const key of ['role', 'user_role', 'verifiedRole', 'aquacare_role', 'authRoleCache']) {
      localStorage.setItem(key, 'admin')
    }
  })
  sensitiveRequests.length = 0
  await page.goto('/admin')
  await expect(page).toHaveURL('http://127.0.0.1:5174/dashboard')
  outcomes.push({ actor: 'customer-forged-role-storage', path: '/admin', finalPath: new URL(page.url()).pathname, sensitiveRequests: [...sensitiveRequests] })

  const auth = await request.post(`${localApi}/auth/v1/token?grant_type=password`, {
    headers: { apikey: process.env.VITE_SUPABASE_ANON_KEY! },
    data: { email: 'qa_a@aquacare.test', password: 'Qa-only-2026!' },
  })
  expect(auth.ok()).toBe(true)
  const token = (await auth.json()).access_token as string
  const privateResponse = await request.get('http://127.0.0.1:5051/api/admin/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const evidence = { outcomes, customerAdminApiStatus: privateResponse.status() }
  const folder = join(evidenceDir, 'AUTH-14')
  await mkdir(folder, { recursive: true })
  await writeFile(join(folder, 'route-and-role-results.json'), JSON.stringify(evidence, null, 2), 'utf8')
  expect(outcomes.every(item => item.sensitiveRequests.length === 0)).toBe(true)
  expect(privateResponse.status()).toBe(403)
})

test('[RELAY-01-HIGH-WATER] manual pump ON is blocked with 409 when Y26 hardware sensor reports high water', async ({ page }) => {
  const db = serviceDb()
  const fixture = JSON.parse(await readFile(join('..', 'test-results', 'local-fixtures.json'), 'utf8'))
  const tankName = `QA High Water ${Date.now()}`
  const mac = `02:HW:${Date.now().toString(16).slice(-8).toUpperCase().match(/.{1,2}/g)!.join(':')}`
  let tankId: number | undefined
  let deviceId: number | undefined
  try {
    const tank = await db.from('tanks').insert({
      user_id: fixture.a, tank_name: tankName, water_volume_liter: 120,
    }).select('id').single()
    if (tank.error) throw tank.error
    tankId = tank.data.id
    const device = await db.from('devices').insert({
      mac_address: mac, firmware_version: 'V3', is_simulator: false, is_active: true,
      tank_id: tankId, relay_pump_state: false,
    }).select('id').single()
    if (device.error) throw device.error
    deviceId = device.data.id
    const telemetry = await db.from('telemetry_logs').insert({
      device_id: deviceId, temp: 26, ph: 7, tds: 200, water_level_ok: true, recorded_at: new Date().toISOString(),
    })
    if (telemetry.error) throw telemetry.error

    await loginCustomer(page)
    await page.locator('[data-tour-target="pond-select"] > button').click()
    await page.locator('[data-tour-target="pond-select"]').getByRole('button', { name: tankName }).click()
    await page.getByRole('button', { name: 'Điều khiển thiết bị' }).click()
    const pumpSwitch = page.getByRole('switch', { name: 'Bật Máy bơm nước' })
    await expect(pumpSwitch).toBeVisible()
    await expect(pumpSwitch).toHaveAttribute('aria-checked', 'false')

    const relayResponsePromise = page.waitForResponse(
      response => response.url().includes('/api/device/relay') && response.request().method() === 'POST',
    )
    await pumpSwitch.click()
    const relayResponse = await relayResponsePromise
    expect(relayResponse.status()).toBe(409)
    await expect(page.getByText('Mực nước đã đạt ngưỡng cao. Không thể bật máy bơm.')).toBeVisible()
    await expect(pumpSwitch).toHaveAttribute('aria-checked', 'false')
    const { data: afterDevice } = await db.from('devices').select('relay_pump_state').eq('id', deviceId).single()
    expect(afterDevice?.relay_pump_state).toBe(false)
    await capture(page, 'RELAY-01-HIGH-WATER', 'blocked-toast.png')
  } finally {
    if (deviceId) {
      await db.from('relay_logs').delete().eq('device_id', deviceId)
      await db.from('telemetry_logs').delete().eq('device_id', deviceId)
      await db.from('devices').delete().eq('id', deviceId)
    }
    if (tankId) await db.from('tanks').delete().eq('id', tankId)
  }
})
