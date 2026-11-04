const express = require('express');
const MAC = /^[0-9A-F]{2}(?::[0-9A-F]{2}){5}$/i;
function createOrderMacEmail({ supabase, sendEmail, enabled = true, intervalMs = 30000 }) {
  const router = express.Router();
  async function processOrder(orderId) {
    if (!enabled) return 'pending';
    const { data: claimed, error: claimError } = await supabase.from('orders')
      .update({ mac_email_claim_until: new Date(Date.now() + 120000).toISOString() })
      .eq('id', orderId).eq('status', 'delivered').is('mac_email_sent_at', null)
      .lte('mac_email_retry_at', new Date().toISOString())
      .lt('mac_email_claim_until', new Date().toISOString())
      .select('id, user_id, shipping_email, mac_email_attempts').maybeSingle();
    if (claimError) throw claimError;
    if (!claimed) return 'pending';
    try {
      const { data: items, error: itemsError } = await supabase.from('order_items').select('device_macs, product_name').eq('order_id', orderId);
      if (itemsError) throw itemsError;
      const macs = [...new Set((items || []).flatMap(item => Array.isArray(item.device_macs) ? item.device_macs : []))];
      if (!macs.length || !macs.every(mac => MAC.test(mac))) throw new Error('Order has no valid assigned MACs');
      const { data: user } = await supabase.from('users').select('email').eq('id', claimed.user_id).maybeSingle();
      const address = user?.email || claimed.shipping_email;
      if (!address) throw new Error('Customer email missing');
      const { data: devices, error: devicesError } = await supabase.from('devices').select('mac_address, firmware_version').in('mac_address', macs);
      if (devicesError) throw devicesError;
      const details = macs.map(mac => ({ mac, name: items.find(item => Array.isArray(item.device_macs) && item.device_macs.includes(mac))?.product_name || 'Thiết bị AquaCare', version: devices?.find(device => device.mac_address === mac)?.firmware_version || 'Chưa xác định' }));
      if (!await sendEmail(address, orderId, macs, details)) throw new Error('Email provider rejected delivery');
      const { error } = await supabase.from('orders').update({ mac_email_sent_at: new Date().toISOString(), mac_email_claim_until: null, mac_email_retry_at: null, mac_email_last_error: null, mac_email_attempts: claimed.mac_email_attempts + 1 }).eq('id', orderId);
      if (error) throw error;
      return 'sent';
    } catch (error) {
      console.error('[Order MAC email]', orderId, error.message);
      await supabase.from('orders').update({ mac_email_claim_until: new Date(0).toISOString(), mac_email_retry_at: new Date(Date.now() + 5 * 60000).toISOString(), mac_email_last_error: error.message, mac_email_attempts: claimed.mac_email_attempts + 1 }).eq('id', orderId);
      return 'failed';
    }
  }
  router.get('/mine', async (req, res) => {
    const token = /^Bearer (.+)$/i.exec(req.headers.authorization || '')?.[1];
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser(token);
      if (authError || !auth?.user) return res.status(401).json({ error: 'Invalid session' });
      const { data: orders, error: ordersError } = await supabase.from('orders').select('id, order_items(product_name, device_macs)').eq('user_id', auth.user.id).eq('status', 'delivered');
      if (ordersError) throw ordersError;
      const owned = new Map();
      for (const order of orders || []) for (const item of order.order_items || [])
        for (const mac of Array.isArray(item.device_macs) ? item.device_macs : [])
          if (MAC.test(mac)) owned.set(mac.toUpperCase(), { mac: mac.toUpperCase(), name: item.product_name || 'Thiết bị AquaCare' });
      // Existing tanks may predate order_items.device_macs. Always include their attached devices.
      const { data: tanks, error: tanksError } = await supabase.from('tanks').select('id, tank_name, devices(mac_address, firmware_version)').eq('user_id', auth.user.id);
      if (tanksError) throw tanksError;
      const used = new Map();
      for (const tank of tanks || []) for (const device of Array.isArray(tank.devices) ? tank.devices : tank.devices ? [tank.devices] : []) {
        if (!device.mac_address) continue;
        const mac = device.mac_address.toUpperCase();
        used.set(mac, { mac, name: owned.get(mac)?.name || 'Thiết bị AquaCare', version: device.firmware_version, tankName: tank.tank_name });
      }
      if (!owned.size) return res.json([...used.values()]);
      const { data: devices, error: devicesError } = await supabase.from('devices').select('mac_address, firmware_version, tank_id').in('mac_address', [...owned.keys()]);
      if (devicesError) throw devicesError;
      const result = new Map(used);
      for (const device of devices || []) {
        const mac = device.mac_address.toUpperCase();
        if (result.has(mac)) continue;
        // A MAC attached to somebody else's tank must never become selectable here.
        if (device.tank_id) continue;
        result.set(mac, { ...owned.get(mac), version: device.firmware_version, tankName: null });
      }
      return res.json([...result.values()]);
    } catch (error) { console.error('[Owned MAC list]', error.message); return res.status(500).json({ error: 'Could not load devices' }); }
  });
  router.post('/:orderId/complete', async (req, res) => {
    const id = Number(req.params.orderId);
    const token = /^Bearer (.+)$/i.exec(req.headers.authorization || '')?.[1];
    if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid order' });
    if (!token) return res.status(401).json({ error: 'Authentication required' });
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser(token);
      if (authError || !auth?.user) return res.status(401).json({ error: 'Invalid session' });
      const { data: task, error: taskError } = await supabase.from('tasks').select('id,status').eq('order_id', id).eq('task_type', 'delivery_install').eq('assigned_to', auth.user.id).eq('status', 'done').maybeSingle();
      if (taskError) throw taskError;
      if (!task) return res.status(403).json({ error: 'Delivery task not completed by this staff member' });
      const { data: order, error: orderError } = await supabase.from('orders').select('id,status,mac_email_sent_at,mac_email_retry_at,mac_email_last_error').eq('id', id).maybeSingle();
      if (orderError) throw orderError;
      if (!order) return res.status(404).json({ error: 'Order not found' });
      if (order.status !== 'delivered') {
        const { error } = await supabase.from('orders').update({ status: 'delivered', mac_email_retry_at: new Date().toISOString(), mac_email_claim_until: new Date(0).toISOString() }).eq('id', id);
        if (error) throw error;
      } else if (!order.mac_email_sent_at && !order.mac_email_retry_at) {
        const { error } = await supabase.from('orders').update({ mac_email_retry_at: new Date().toISOString(), mac_email_claim_until: new Date(0).toISOString() }).eq('id', id);
        if (error) throw error;
      }
      if (order.mac_email_sent_at) return res.json({ status: 'sent' });
      const status = await processOrder(id);
      return res.json({ status });
    } catch (error) {
      console.error('[Order MAC completion]', error.message);
      return res.status(500).json({ error: 'Could not complete MAC email processing' });
    }
  });
  const timer = enabled ? setInterval(async () => {
    try {
      const { data, error } = await supabase.from('orders').select('id').eq('status', 'delivered').is('mac_email_sent_at', null).lte('mac_email_retry_at', new Date().toISOString()).limit(10);
      if (error) throw error;
      for (const order of data || []) await processOrder(order.id);
    } catch (error) { console.error('[Order MAC retry]', error.message); }
  }, intervalMs) : null;
  timer?.unref?.();
  return { router, processOrder, stop: () => timer && clearInterval(timer) };
}
module.exports = { createOrderMacEmail };
