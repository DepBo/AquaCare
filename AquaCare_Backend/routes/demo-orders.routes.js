const express = require('express');

function createDemoOrdersRouter({ supabase, processEmail }) {
  const router = express.Router();

  router.post('/checkout', async (req, res) => {
    const token = /^Bearer (.+)$/i.exec(req.headers.authorization || '')?.[1];
    if (!token) return res.status(401).json({ error: 'Vui lòng đăng nhập để dùng V3 Demo.' });

    const { data: auth, error: authError } = await supabase.auth.getUser(token);
    if (authError || !auth?.user) return res.status(401).json({ error: 'Phiên đăng nhập không hợp lệ.' });

    const { requestKey, quantity, fullName, note } = req.body || {};
    if (!requestKey || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestKey)
      || !Number.isInteger(quantity) || quantity < 1 || quantity > 100
      || typeof fullName !== 'string' || !fullName.trim() || fullName.length > 500
      || (note != null && (typeof note !== 'string' || note.length > 2000))) {
      return res.status(400).json({ error: 'Thông tin đơn demo không hợp lệ.' });
    }

    const { data: orderId, error } = await supabase.rpc('checkout_v3_demo', {
      p_user_id: auth.user.id,
      p_request_key: requestKey,
      p_quantity: quantity,
      p_name: fullName,
      p_phone: 'Không áp dụng',
      p_address: 'Không giao thiết bị vật lý',
      p_note: note || null,
    });
    if (error) {
      console.error('[Demo checkout]', error.message);
      const noStock = error.message.includes('Not enough V3 Demo MACs');
      const unavailable = error.message.includes('V3 Demo is not available');
      return res.status(noStock || unavailable ? 409 : 500).json({
        error: noStock ? 'Đã hết mã V3 Demo. Vui lòng thử lại sau.' :
          unavailable ? 'V3 Demo hiện không khả dụng.' : 'Không thể hoàn tất đơn demo. Vui lòng thử lại.',
      });
    }

    // Fulfilment is already committed. Email is retried by the worker if this request fails.
    processEmail().catch(err => console.error('[Demo email]', err.message));
    return res.status(201).json({ orderId, status: 'delivered', emailPending: true });
  });

  return router;
}

function startDemoEmailWorker({ supabase, sendDemoMacEmail, intervalMs = 30000 }) {
  let busy = false;
  async function processEmail() {
    if (busy) return;
    busy = true;
    try {
      for (let i = 0; i < 10; i += 1) {
        const { data, error } = await supabase.rpc('claim_demo_email');
        if (error) throw error;
        const job = data?.[0];
        if (!job) break;
        const macs = Array.isArray(job.macs) ? job.macs : [];
        const sent = await sendDemoMacEmail(job.user_email, job.order_id, macs);
        const update = sent
          ? { email_sent_at: new Date().toISOString(), email_claim_until: null, last_email_error: null }
          : { email_claim_until: null, email_retry_at: new Date(Date.now() + 5 * 60_000).toISOString(), last_email_error: 'Email provider rejected delivery' };
        const { error: updateError } = await supabase.from('demo_fulfillments').update(update).eq('order_id', job.order_id);
        if (updateError) throw updateError;
      }
    } finally {
      busy = false;
    }
  }
  const timer = setInterval(() => processEmail().catch(err => console.error('[Demo email worker]', err.message)), intervalMs);
  timer.unref?.();
  processEmail().catch(err => console.error('[Demo email worker]', err.message));
  return { processEmail, stop: () => clearInterval(timer) };
}

module.exports = { createDemoOrdersRouter, startDemoEmailWorker };
