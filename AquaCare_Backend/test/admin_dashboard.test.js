const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createAdminDashboardRouter, buildDashboardData, monthBoundaries } =
  require('../routes/admin-dashboard.routes');

test('dashboard groups delivered order value by Vietnam calendar date', () => {
  const now = new Date('2026-10-10T10:00:00+07:00');
  const bounds = monthBoundaries(now);
  assert.equal(bounds.currentStart.toISOString(), '2026-09-30T17:00:00.000Z');
  assert.equal(bounds.previousStart.toISOString(), '2026-08-31T17:00:00.000Z');

  const result = buildDashboardData({
    now,
    deliveredOrders: [
      { created_at: '2026-09-30T16:59:00Z', total_price: 100000 },
      { created_at: '2026-09-30T17:01:00Z', total_price: 200000 },
      { created_at: '2026-10-10T02:00:00Z', total_price: 400000 },
    ],
    counts: { pending: 2, packing: 1, shipping: 3, assignedDevices: 4, staff: 5 },
    recentOrders: [{ id: 42, status: 'pending', created_at: now.toISOString() }],
  });

  assert.equal(result.revenue.previousMonth, 100000);
  assert.equal(result.revenue.currentMonth, 600000);
  assert.equal(result.revenue.deliveredMonth, 2);
  assert.equal(result.revenue.averageOrder, 300000);
  assert.equal(result.revenue.changePercent, 500);
  assert.equal(result.revenue.series7.at(-1).date, '2026-10-10');
  assert.equal(result.revenue.series7.at(-1).amount, 400000);
  assert.equal(result.orders.pending, 2);
  assert.deepEqual(result.recentOrders[0], {
    id: 42, status: 'pending', createdAt: now.toISOString(),
  });
});

test('dashboard API requires a valid admin session before reading aggregates', async (t) => {
  let dashboardReads = 0;
  const supabase = {
    auth: {
      async getUser(token) {
        if (token === 'invalid') return { data: null, error: new Error('invalid') };
        return { data: { user: { id: token } }, error: null };
      },
    },
    from(table) {
      assert.equal(table, 'users');
      return {
        select() { return this; },
        eq(_column, userId) { this.userId = userId; return this; },
        async maybeSingle() {
          return { data: { role: this.userId === 'admin' ? 'admin' : 'customer' }, error: null };
        },
      };
    },
  };
  const app = express();
  app.use('/api/admin/dashboard', createAdminDashboardRouter({
    supabase,
    dashboardLoader: async () => { dashboardReads += 1; return { revenue: { currentMonth: 123 } }; },
  }));
  const server = app.listen(0);
  t.after(() => server.close());
  const url = `http://127.0.0.1:${server.address().port}/api/admin/dashboard`;

  assert.equal((await fetch(url)).status, 401);
  assert.equal((await fetch(url, { headers: { Authorization: 'Bearer invalid' } })).status, 401);
  assert.equal((await fetch(url, { headers: { Authorization: 'Bearer customer' } })).status, 403);
  assert.equal(dashboardReads, 0);
  const response = await fetch(url, { headers: { Authorization: 'Bearer admin' } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual(await response.json(), { revenue: { currentMonth: 123 } });
  assert.equal(dashboardReads, 1);
});
