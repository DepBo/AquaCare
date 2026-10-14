const express = require('express');

const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 500;

function vnDateKey(value) {
  return new Date(new Date(value).getTime() + VIETNAM_OFFSET_MS)
    .toISOString().slice(0, 10);
}

function monthBoundaries(now) {
  const local = new Date(now.getTime() + VIETNAM_OFFSET_MS);
  const year = local.getUTCFullYear();
  const month = local.getUTCMonth();
  return {
    previousStart: new Date(Date.UTC(year, month - 1, 1) - VIETNAM_OFFSET_MS),
    currentStart: new Date(Date.UTC(year, month, 1) - VIETNAM_OFFSET_MS),
    nextStart: new Date(Date.UTC(year, month + 1, 1) - VIETNAM_OFFSET_MS),
  };
}

function makeSeries(amountByDay, now, days) {
  const localMidnight = Date.UTC(
    new Date(now.getTime() + VIETNAM_OFFSET_MS).getUTCFullYear(),
    new Date(now.getTime() + VIETNAM_OFFSET_MS).getUTCMonth(),
    new Date(now.getTime() + VIETNAM_OFFSET_MS).getUTCDate(),
  );
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(localMidnight - (days - 1 - index) * DAY_MS)
      .toISOString().slice(0, 10);
    return { date, amount: amountByDay.get(date) || 0 };
  });
}

function buildDashboardData({ deliveredOrders, counts, recentOrders, now }) {
  const { currentStart, nextStart } = monthBoundaries(now);
  const amountByDay = new Map();
  let currentMonth = 0;
  let previousMonth = 0;
  let deliveredMonth = 0;

  for (const order of deliveredOrders) {
    const createdAt = new Date(order.created_at);
    const amount = Number(order.total_price);
    if (!Number.isFinite(createdAt.getTime()) || !Number.isFinite(amount)) continue;

    const key = vnDateKey(createdAt);
    amountByDay.set(key, (amountByDay.get(key) || 0) + amount);
    if (createdAt >= currentStart && createdAt < nextStart) {
      currentMonth += amount;
      deliveredMonth += 1;
    } else if (createdAt < currentStart) {
      previousMonth += amount;
    }
  }

  const series7 = makeSeries(amountByDay, now, 7);
  const series30 = makeSeries(amountByDay, now, 30);
  return {
    generatedAt: now.toISOString(),
    timezone: 'Asia/Ho_Chi_Minh',
    revenue: {
      currentMonth,
      previousMonth,
      changePercent: previousMonth > 0
        ? Math.round((currentMonth - previousMonth) / previousMonth * 1000) / 10
        : null,
      deliveredMonth,
      averageOrder: deliveredMonth > 0 ? Math.round(currentMonth / deliveredMonth) : 0,
      last7Days: series7.reduce((total, day) => total + day.amount, 0),
      series7,
      series30,
    },
    orders: {
      pending: counts.pending,
      packing: counts.packing,
      shipping: counts.shipping,
      deliveredMonth,
    },
    devices: { assigned: counts.assignedDevices },
    staff: { total: counts.staff },
    recentOrders: recentOrders.map(order => ({
      id: order.id,
      status: order.status,
      createdAt: order.created_at,
    })),
  };
}

async function checked(promise, label) {
  const result = await promise;
  if (result.error) throw new Error(`${label}: ${result.error.message}`);
  return result;
}

async function fetchDeliveredOrders(supabase, from, until) {
  const orders = [];
  for (let start = 0; ; start += PAGE_SIZE) {
    const { data } = await checked(
      supabase.from('orders')
        .select('id,total_price,created_at')
        .eq('status', 'delivered')
        .gte('created_at', from.toISOString())
        .lt('created_at', until.toISOString())
        .order('created_at', { ascending: true })
        .order('id', { ascending: true })
        .range(start, start + PAGE_SIZE - 1),
      'delivered orders',
    );
    orders.push(...data);
    if (data.length < PAGE_SIZE) return orders;
  }
}

async function loadDashboard(supabase, now = new Date()) {
  const { previousStart, nextStart } = monthBoundaries(now);
  const [deliveredOrders, pending, packing, shipping, assignedDevices, staff, recentOrders] =
    await Promise.all([
      fetchDeliveredOrders(supabase, previousStart, nextStart),
      checked(supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'), 'pending orders'),
      checked(supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('task_type', 'packing').in('status', ['todo', 'in_progress']), 'packing tasks'),
      checked(supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'shipping'), 'shipping orders'),
      checked(supabase.from('devices').select('id', { count: 'exact', head: true }).not('tank_id', 'is', null), 'assigned devices'),
      checked(supabase.from('users').select('id', { count: 'exact', head: true }).like('role', 'staff%'), 'staff'),
      checked(supabase.from('orders').select('id,status,created_at').order('created_at', { ascending: false }).limit(4), 'recent orders'),
    ]);

  return buildDashboardData({
    deliveredOrders,
    counts: {
      pending: pending.count || 0,
      packing: packing.count || 0,
      shipping: shipping.count || 0,
      assignedDevices: assignedDevices.count || 0,
      staff: staff.count || 0,
    },
    recentOrders: recentOrders.data || [],
    now,
  });
}

function createAdminDashboardRouter({ supabase, dashboardLoader = loadDashboard }) {
  const router = express.Router();
  router.get('/', async (req, res) => {
    const match = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '');
    if (!match) return res.status(401).json({ error: 'Authentication required' });

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser(match[1]);
      if (authError || !authData?.user) {
        return res.status(401).json({ error: 'Invalid session' });
      }

      const { data: profile, error: profileError } = await supabase
        .from('users').select('role').eq('id', authData.user.id).maybeSingle();
      if (profileError) throw profileError;
      if (profile?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const dashboard = await dashboardLoader(supabase);
      res.set('Cache-Control', 'private, no-store');
      return res.json(dashboard);
    } catch (error) {
      console.error('[ADMIN DASHBOARD]', error);
      return res.status(500).json({ error: 'Failed to load admin dashboard' });
    }
  });
  return router;
}

module.exports = { createAdminDashboardRouter, loadDashboard, buildDashboardData, monthBoundaries };
