const test = require('node:test');
const assert = require('node:assert/strict');
const { buildAnnualData, buildDashboardData, yearBoundaries } = require('../routes/admin-dashboard.routes');

const annual = (orders, year = 2024, now = new Date('2026-10-10T03:00:00Z')) => buildAnnualData({
  year, now, availableYears: [year], deliveredOrders: orders,
});
const order = (created_at, total_price, order_items = []) => ({ created_at, total_price, order_items });
const dashboard = (orders, now = new Date('2026-10-10T03:00:00Z')) => buildDashboardData({
  now, deliveredOrders: orders,
  counts: { pending: 0, packing: 0, shipping: 0, assignedDevices: 0, staff: 0 },
  recentOrders: [],
});

test('Vietnam year boundary places orders on the correct side of midnight', () => {
  const bounds = yearBoundaries(2024);
  assert.equal(bounds.start.toISOString(), '2023-12-31T17:00:00.000Z');
  assert.equal(bounds.end.toISOString(), '2024-12-31T17:00:00.000Z');
  const result = annual([
    order('2023-12-31T16:59:59.999Z', 10),
    order('2023-12-31T17:00:00.000Z', 20),
    order('2024-12-31T16:59:59.999Z', 30),
    order('2024-12-31T17:00:00.000Z', 40),
  ]);
  assert.equal(result.months[0].revenue, 20);
  assert.equal(result.months[11].revenue, 30);
});

test('growth stays undefined after a zero month and resumes after positive revenue', () => {
  const result = annual([
    order('2024-01-15T00:00:00Z', 100),
    order('2024-03-15T00:00:00Z', 50),
    order('2024-04-15T00:00:00Z', 75),
  ]);
  assert.deepEqual(result.months.slice(0, 4).map(row => row.growthPercent), [null, -100, null, 50]);
  assert.deepEqual(result.months.slice(0, 4).map(row => row.movingAverage), [null, null, 50, 42]);
});

test('equal peak revenue picks the earliest month and does not invent growth', () => {
  const result = annual([
    order('2024-02-15T00:00:00Z', 200),
    order('2024-04-15T00:00:00Z', 200),
  ]);
  assert.equal(result.highlights.peakMonthlyRevenue, 200);
  assert.equal(result.highlights.peakMonth, 2);
  assert.equal(result.highlights.maxGrowthPercent, null);
  assert.equal(result.highlights.maxDeclinePercent, -100);
});

test('invalid and negative order totals do not enter annual revenue', () => {
  const result = annual([
    order('2024-06-15T00:00:00Z', -10),
    order('2024-06-15T00:00:00Z', 'not-a-number'),
    order('2024-06-15T00:00:00Z', 90),
  ]);
  assert.equal(result.months[5].revenue, 90);
  assert.equal(result.highlights.peakMonthlyRevenue, 90);
});

test('version revenue allocates a discounted order proportionally', () => {
  const result = annual([order('2024-07-15T00:00:00Z', 900, [
    { product_id: 'v1', product_price: 200, quantity: 1 },
    { product_id: 'v3', product_price: 400, quantity: 1 },
  ])]);
  assert.deepEqual(result.byVersion[6].versions, { V1: 300, V2: 0, V3: 600, V4: 0 });
  assert.equal(result.months[6].revenue, 900);
});

test('unknown product version is not silently assigned to a known version', () => {
  const result = annual([order('2024-08-15T00:00:00Z', 100, [
    { product_id: 'v1', product_price: 1, quantity: 1 },
    { product_id: 'v3-demo', product_price: 1, quantity: 1 },
  ])]);
  assert.equal(result.months[7].revenue, 100);
  assert.deepEqual(result.byVersion[7].versions, { V1: 50, V2: 0, V3: 0, V4: 0 });
});

test('daily revenue series fills missing days with zero and keeps newest day last', () => {
  const result = dashboard([
    order('2026-10-08T03:00:00Z', 40),
    order('2026-10-10T02:00:00Z', 60),
  ]);
  assert.equal(result.revenue.series7.length, 7);
  assert.deepEqual(result.revenue.series7.slice(-3), [
    { date: '2026-10-08', amount: 40 },
    { date: '2026-10-09', amount: 0 },
    { date: '2026-10-10', amount: 60 },
  ]);
  assert.equal(result.revenue.last7Days, 100);
});

test('monthly growth has no percentage when previous month has zero revenue', () => {
  const result = dashboard([order('2026-10-09T03:00:00Z', 120)]);
  assert.equal(result.revenue.previousMonth, 0);
  assert.equal(result.revenue.currentMonth, 120);
  assert.equal(result.revenue.changePercent, null);
});

test('current-year future months are absent while completed months remain zero', () => {
  const result = annual([], 2026, new Date('2026-10-10T03:00:00Z'));
  assert.equal(result.months[8].revenue, 0);
  assert.equal(result.months[9].revenue, 0);
  assert.equal(result.months[10].revenue, null);
  assert.equal(result.months[11].movingAverage, null);
  assert.equal(result.highlights.peakMonth, null);
});
