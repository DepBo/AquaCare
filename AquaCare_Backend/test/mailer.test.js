const test = require('node:test');
const assert = require('node:assert/strict');

const { sendAlertEmail } = require('../config/mailer');

test('gửi cảnh báo qua Brevo HTTP khi có API key', async () => {
  const oldKey = process.env.BREVO_API_KEY;
  const oldFrom = process.env.ALERT_EMAIL_FROM;
  const oldFetch = global.fetch;
  const oldLog = console.log;
  const messages = [];
  console.log = (...args) => messages.push(args.join(' '));
  process.env.BREVO_API_KEY = 'test-key';
  process.env.ALERT_EMAIL_FROM = 'alerts@example.com';
  let request;
  global.fetch = async (url, options) => {
    request = { url, options };
    return { ok: true, status: 201, json: async () => ({ messageId: 'test-message' }) };
  };

  try {
    assert.equal(await sendAlertEmail('owner@example.com', 'Bể thử', 'pH thấp'), true);
    assert.equal(request.url, 'https://api.brevo.com/v3/smtp/email');
    assert.equal(request.options.headers['api-key'], 'test-key');
    const body = JSON.parse(request.options.body);
    assert.deepEqual(body.sender, { name: 'AquaCare System', email: 'alerts@example.com' });
    assert.deepEqual(body.to, [{ email: 'owner@example.com' }]);
    assert.match(body.htmlContent, /pH thấp/);
    assert.ok(messages.some(message => message.includes('Đã nhận email cảnh báo')));
  } finally {
    console.log = oldLog;
    global.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = oldKey;
    if (oldFrom === undefined) delete process.env.ALERT_EMAIL_FROM;
    else process.env.ALERT_EMAIL_FROM = oldFrom;
  }
});

test('báo thất bại khi Brevo từ chối email', async () => {
  const oldKey = process.env.BREVO_API_KEY;
  const oldFrom = process.env.ALERT_EMAIL_FROM;
  const oldFetch = global.fetch;
  const oldError = console.error;
  const errors = [];
  console.error = (...args) => errors.push(args.join(' '));
  process.env.BREVO_API_KEY = 'test-key';
  process.env.ALERT_EMAIL_FROM = 'alerts@example.com';
  global.fetch = async () => ({
    ok: false,
    status: 401,
    json: async () => ({ message: 'Invalid API key' }),
  });

  try {
    assert.equal(await sendAlertEmail('owner@example.com', 'Bể thử', 'pH thấp'), false);
    assert.ok(errors.some(message => message.includes('Brevo HTTP 401')));
  } finally {
    console.error = oldError;
    global.fetch = oldFetch;
    if (oldKey === undefined) delete process.env.BREVO_API_KEY;
    else process.env.BREVO_API_KEY = oldKey;
    if (oldFrom === undefined) delete process.env.ALERT_EMAIL_FROM;
    else process.env.ALERT_EMAIL_FROM = oldFrom;
  }
});
