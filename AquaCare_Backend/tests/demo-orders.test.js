const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { createDemoOrdersRouter, startDemoEmailWorker } = require('../routes/demo-orders.routes');

async function withServer(supabase, callback) {
  const app = express();
  app.use(express.json());
  app.use('/api/orders/demo', createDemoOrdersRouter({ supabase, processEmail: async () => {} }));
  const server = app.listen(0);
  try {
    await new Promise(resolve => server.once('listening', resolve));
    return await callback(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
}

const body = {
  requestKey: 'd1ec1d4d-7877-4c9f-9e5a-93b1a885ba30',
  quantity: 2, fullName: 'Nguyễn A', phone: '0900000000', address: 'Hà Nội', note: '',
};

test('demo checkout rejects anonymous requests without allocating MACs', async () => {
  let called = false;
  const supabase = { auth: { getUser: async () => { called = true; } }, rpc: async () => { called = true; } };
  await withServer(supabase, async origin => {
    const response = await fetch(`${origin}/api/orders/demo/checkout`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    assert.equal(response.status, 401);
    assert.equal(called, false);
  });
});

test('demo checkout passes authenticated identity and idempotency key to transaction', async () => {
  const calls = [];
  const supabase = {
    auth: { getUser: async token => {
      assert.equal(token, 'valid-token');
      return { data: { user: { id: 'user-123' } }, error: null };
    } },
    rpc: async (name, params) => {
      calls.push({ name, params });
      return { data: 42, error: null };
    },
  };
  await withServer(supabase, async origin => {
    for (let retry = 0; retry < 2; retry += 1) {
      const response = await fetch(`${origin}/api/orders/demo/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer valid-token' },
        body: JSON.stringify(body),
      });
      assert.equal(response.status, 201);
      assert.deepEqual(await response.json(), { orderId: 42, status: 'delivered', emailPending: true });
    }
  });
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0], calls[1]);
  assert.equal(calls[0].name, 'checkout_v3_demo');
  assert.equal(calls[0].params.p_user_id, 'user-123');
  assert.equal(calls[0].params.p_quantity, 2);
});

test('demo checkout does not call transaction for invalid quantity', async () => {
  let called = false;
  const supabase = {
    auth: { getUser: async () => ({ data: { user: { id: 'user-123' } }, error: null }) },
    rpc: async () => { called = true; },
  };
  await withServer(supabase, async origin => {
    const response = await fetch(`${origin}/api/orders/demo/checkout`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
      body: JSON.stringify({ ...body, quantity: 0 }),
    });
    assert.equal(response.status, 400);
    assert.equal(called, false);
  });
});

test('out of stock is reported without exposing database internals', async () => {
  const supabase = {
    auth: { getUser: async () => ({ data: { user: { id: 'user-123' } }, error: null }) },
    rpc: async () => ({ data: null, error: { message: 'Not enough V3 Demo MACs in stock' } }),
  };
  await withServer(supabase, async origin => {
    const response = await fetch(`${origin}/api/orders/demo/checkout`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
      body: JSON.stringify(body),
    });
    assert.equal(response.status, 409);
    assert.match((await response.json()).error, /hết mã/);
  });
});

test('email worker marks accepted mail as sent and does not claim twice', async () => {
  let claimCount = 0;
  const updates = [];
  const supabase = {
    rpc: async () => ({ data: claimCount++ === 0
      ? [{ order_id: 42, user_email: 'buyer@example.com', macs: ['AA:BB:CC:DD:EE:FF'] }]
      : [], error: null }),
    from: () => ({ update: fields => ({ eq: async () => { updates.push(fields); return { error: null }; } }) }),
  };
  const worker = startDemoEmailWorker({
    supabase, sendDemoMacEmail: async () => true, intervalMs: 3600000,
  });
  try {
    for (let i = 0; i < 20 && updates.length === 0; i += 1) {
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    assert.equal(updates.length, 1);
    assert.ok(updates[0].email_sent_at);
    assert.equal(updates[0].email_claim_until, null);
  } finally {
    worker.stop();
  }
});

test('email worker schedules retry when provider rejects mail', async () => {
  let claimed = false;
  const updates = [];
  const supabase = {
    rpc: async () => {
      const data = claimed ? [] : [{ order_id: 43, user_email: 'buyer@example.com', macs: ['AA:BB:CC:DD:EE:00'] }];
      claimed = true;
      return { data, error: null };
    },
    from: () => ({ update: fields => ({ eq: async () => { updates.push(fields); return { error: null }; } }) }),
  };
  const worker = startDemoEmailWorker({ supabase, sendDemoMacEmail: async () => false, intervalMs: 3600000 });
  try {
    for (let i = 0; i < 20 && updates.length === 0; i += 1) await new Promise(resolve => setTimeout(resolve, 5));
    assert.equal(updates.length, 1);
    assert.equal(updates[0].email_sent_at, undefined);
    assert.ok(updates[0].email_retry_at);
  } finally {
    worker.stop();
  }
});
