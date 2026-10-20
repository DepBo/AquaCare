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

function yearBoundaries(year) {
  return {
    start: new Date(Date.UTC(year, 0, 1) - VIETNAM_OFFSET_MS),
    end: new Date(Date.UTC(year + 1, 0, 1) - VIETNAM_OFFSET_MS),
  };
}

function buildAnnualData({ year, deliveredOrders, availableYears, now = new Date() }) {
  const totals = Array(12).fill(0);
  const byVersion = Array.from({ length: 12 }, () => ({ V1: 0, V2: 0, V3: 0, V4: 0 }));
  for (const order of deliveredOrders) {
    const monthKey = vnDateKey(order.created_at);
    if (!monthKey.startsWith(`${year}-`)) continue;
    const monthIndex = Number(monthKey.slice(5, 7)) - 1;
    const orderTotal = Number(order.total_price);
    if (!Number.isFinite(orderTotal) || orderTotal < 0) continue;
    totals[monthIndex] += orderTotal;

    const items = Array.isArray(order.order_items) ? order.order_items : [];
    const pricedItems = items.map(item => ({
      version: /^v[1-4]$/i.test(String(item.product_id || '')) ? String(item.product_id).toUpperCase() : null,
      subtotal: Number(item.product_price) * Number(item.quantity),
    })).filter(item => Number.isFinite(item.subtotal) && item.subtotal > 0);
    const subtotal = pricedItems.reduce((sum, item) => sum + item.subtotal, 0);
    if (subtotal <= 0) continue;
    let allocated = 0;
    pricedItems.forEach((item, index) => {
      const amount = index === pricedItems.length - 1
        ? orderTotal - allocated
        : Math.floor(orderTotal * item.subtotal / subtotal);
      allocated += amount;
      if (item.version) byVersion[monthIndex][item.version] += amount;
    });
  }
  const currentMonthKey = vnDateKey(now);
  const currentYear = Number(currentMonthKey.slice(0, 4));
  const currentMonth = Number(currentMonthKey.slice(5, 7));
  const observed = totals.map((revenue, index) => year === currentYear && index + 1 > currentMonth ? null : revenue);
  const months = observed.map((revenue, index) => ({
    month: index + 1,
    revenue,
    growthPercent: index > 0 && revenue !== null && observed[index - 1] !== null && observed[index - 1] > 0
      ? Math.round((revenue / observed[index - 1] - 1) * 10000) / 100
      : null,
    movingAverage: index >= 2 && revenue !== null && observed[index - 1] !== null && observed[index - 2] !== null
      ? Math.round((observed[index - 2] + observed[index - 1] + revenue) / 3) : null,
  }));
  const growth = months.map(month => month.growthPercent).filter(value => value !== null);
  const peakRevenue = Math.max(...observed.filter(value => value !== null));
  return {
    year,
    availableYears,
    basis: 'delivered_orders_by_created_at_vietnam',
    months,
    byVersion: byVersion.map((versions, index) => ({ month: index + 1, versions })),
    highlights: {
      peakMonthlyRevenue: peakRevenue,
      peakMonth: peakRevenue > 0 ? observed.indexOf(peakRevenue) + 1 : null,
      maxGrowthPercent: growth.some(value => value > 0) ? Math.max(...growth) : null,
      maxDeclinePercent: growth.some(value => value < 0) ? Math.min(...growth) : null,
    },
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

async function fetchAnnualOrders(supabase, year) {
  const { start: from, end: until } = yearBoundaries(year);
  const orders = [];
  for (let start = 0; ; start += PAGE_SIZE) {
    const { data } = await checked(
      supabase.from('orders')
        .select('id,total_price,created_at,order_items(product_id,product_price,quantity)')
        .eq('status', 'delivered')
        .gte('created_at', from.toISOString())
        .lt('created_at', until.toISOString())
        .order('created_at', { ascending: true })
        .order('id', { ascending: true })
        .range(start, start + PAGE_SIZE - 1),
      'annual delivered orders',
    );
    orders.push(...data);
    if (data.length < PAGE_SIZE) return orders;
  }
}

async function loadAnnualDashboard(supabase, year, now = new Date()) {
  const currentYear = Number(vnDateKey(now).slice(0, 4));
  const [orders, earliest] = await Promise.all([
    fetchAnnualOrders(supabase, year),
    checked(supabase.from('orders').select('created_at').eq('status', 'delivered')
      .order('created_at', { ascending: true }).limit(1), 'earliest delivered order'),
  ]);
  const earliestYear = earliest.data?.length
    ? Number(vnDateKey(earliest.data[0].created_at).slice(0, 4))
    : currentYear;
  const firstYear = Math.max(2000, Math.min(currentYear - 2, earliestYear));
  const availableYears = Array.from({ length: currentYear - firstYear + 1 }, (_, index) => currentYear - index);
  if (!availableYears.includes(year)) availableYears.push(year);
  return buildAnnualData({ year, deliveredOrders: orders, availableYears, now });
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

function createAdminDashboardRouter({ supabase, dashboardLoader = loadDashboard, annualLoader = loadAnnualDashboard }) {
  const router = express.Router();
  const requireAdmin = async (req, res, next) => {
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
      return next();
    } catch (error) {
      console.error('[ADMIN DASHBOARD AUTH]', error);
      return res.status(500).json({ error: 'Failed to authorize admin dashboard' });
    }
  };
  router.get('/', requireAdmin, async (req, res) => {
    try {
      const dashboard = await dashboardLoader(supabase);
      res.set('Cache-Control', 'private, no-store');
      return res.json(dashboard);
    } catch (error) {
      console.error('[ADMIN DASHBOARD]', error);
      return res.status(500).json({ error: 'Failed to load admin dashboard' });
    }
  });
  router.get('/annual', requireAdmin, async (req, res) => {
    const currentYear = Number(vnDateKey(new Date()).slice(0, 4));
    const rawYear = req.query.year === undefined ? String(currentYear) : req.query.year;
    if (typeof rawYear !== 'string' || !/^\d{4}$/.test(rawYear) || Number(rawYear) < 2000 || Number(rawYear) > currentYear) {
      return res.status(400).json({ error: 'Invalid year' });
    }
    try {
      const annual = await annualLoader(supabase, Number(rawYear));
      res.set('Cache-Control', 'private, no-store');
      return res.json(annual);
    } catch (error) {
      console.error('[ADMIN DASHBOARD ANNUAL]', error);
      return res.status(500).json({ error: 'Failed to load annual dashboard' });
    }
  });
  return router;
}

module.exports = { createAdminDashboardRouter, loadDashboard, loadAnnualDashboard, buildDashboardData, buildAnnualData, monthBoundaries, yearBoundaries };
