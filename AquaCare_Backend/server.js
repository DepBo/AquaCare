const ISOLATED_TEST = process.env.AQUACARE_TEST_MODE === '1';
if (!ISOLATED_TEST) require('dotenv').config();
require('./testing/isolation').assertIsolatedTestEnvironment(process.env);
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const { createAdminDashboardRouter } = require('./routes/admin-dashboard.routes');
const { getSpeciesThresholds } = require('./config/species_thresholds');
const { createDemoOrdersRouter, startDemoEmailWorker } = require('./routes/demo-orders.routes');
const demoSupabase = require('./config/demo-supabase');
const { sendDemoMacEmail, sendOrderMacEmail } = ISOLATED_TEST
  ? { sendDemoMacEmail: async () => false }
  : require('./config/mailer');

const app = express();
const PORT = process.env.PORT || 5000;
// Dashboard admin dùng dữ liệu thật qua API có kiểm tra phiên và vai trò admin.
const ADMIN_DASHBOARD_ENABLED = true;

// Middlewares – CORS phải được khai báo ĐẦU TIÊN, trước mọi route
const allowedOrigins = [
  ...(ISOLATED_TEST ? ['http://127.0.0.1:5174'] : []),
  'http://localhost:5173',          // Dev local (Vite default)
  'http://localhost:3000',          // Dev local (alt port)
  'https://aquacare-p78r.onrender.com', // Backend Render (self)
  'https://aquacare.id.vn',        // Production custom domain
  'https://www.aquacare.id.vn',    // Optional www domain
  /\.vercel\.app$/,                 // Mọi subdomain Vercel
  /\.netlify\.app$/,                // Mọi subdomain Netlify
  /\.github\.io$/,                  // GitHub Pages
];

app.use(cors({
  origin: (origin, callback) => {
    // Cho phép request không có origin (Postman, curl, mobile app)
    if (!origin) return callback(null, true);
    const allowed = allowedOrigins.some(o =>
      typeof o === 'string' ? o === origin : o.test(origin)
    );
    if (allowed) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204, // Fix cho IE11 / một số browser cũ
}));

// Xử lý preflight OPTIONS cho tất cả routes (tương thích Express 5 / Node 24+)
app.options('/{*path}', cors());

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.get('/api/tanks/:id/demo-telemetry', require('./routes/demo-telemetry').demoTelemetry(demoSupabase));
app.get('/api/tanks/:id/demo-alerts', require('./routes/demo-telemetry').demoTelemetry(demoSupabase, true));
if (ADMIN_DASHBOARD_ENABLED) {
  app.use('/api/admin/dashboard', createAdminDashboardRouter({ supabase: require('./config/supabase') }));
}
const demoEmailWorker = ISOLATED_TEST
  ? { processEmail: async () => {}, stop: () => {} }
  : startDemoEmailWorker({ supabase: demoSupabase, sendDemoMacEmail });
const orderMacEmail = require('./routes/order-mac-email.routes').createOrderMacEmail({ supabase: demoSupabase, sendEmail: sendOrderMacEmail, enabled: !ISOLATED_TEST });
app.use('/api/orders/mac-email', orderMacEmail.router);
app.use('/api/orders/demo', createDemoOrdersRouter({ supabase: demoSupabase, processEmail: demoEmailWorker.processEmail }));

// Route Health Check dành cho UptimeRobot
app.get('/api/health', (req, res) => {
  // In ra màn hình log của Render
  console.log(`[${new Date().toLocaleTimeString()}] UptimeRobot vừa gọi để giữ Server thức!`); 
  
  // Trả về cho UptimeRobot biết là Server vẫn ổn
  res.status(200).send('Server is awake!');
});

// ==========================================
// TÍCH HỢP ĐIỀU KHIỂN RELAY QUA API (ZERO DELAY)
// ==========================================
app.post('/api/device/relay', async (req, res) => {
  try {
    const { tank_id, pin, state, relay_field } = req.body;
    
    if (pin === undefined || state === undefined || !tank_id || !relay_field) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const relayFieldsByPin = {
      1: 'relay_light_state',
      2: 'relay_aerator_state',
      3: 'relay_pump_state',
    };
    if (typeof state !== 'boolean' || !Number.isInteger(pin) || relayFieldsByPin[pin] !== relay_field) {
      return res.status(400).json({ error: "Invalid relay command" });
    }

    const token = /^Bearer\s+(.+)$/i.exec(req.headers.authorization || '')?.[1];
    if (!token) return res.status(401).json({ error: "Authentication required" });
    const { data: auth, error: authError } = await supabase.auth.getUser(token);
    if (authError || !auth?.user) return res.status(401).json({ error: "Invalid session" });
    const { data: tank, error: tankError } = await supabase.from('tanks')
      .select('id').eq('id', tank_id).eq('user_id', auth.user.id).maybeSingle();
    if (tankError) return res.status(500).json({ error: "Failed to verify tank" });
    if (!tank) return res.status(403).json({ error: "Tank access denied" });

    // Lấy MAC Address từ DB
    const { data: device, error: fetchErr } = await supabase.from('devices').select('id, mac_address, is_simulator').eq('tank_id', tank_id).single();
    if (fetchErr || !device || !device.mac_address) {
      return res.status(404).json({ error: "Device not found" });
    }
    const mac = device.mac_address;

    if (pin === 3 && state === true && device.is_simulator !== true) {
      const { isHighWaterNow } = require('./pump_high_water');
      if (await isHighWaterNow(supabase, device.id)) {
        return res.status(409).json({ error: 'High water level: pump cannot be turned on' });
      }
    }

    // 1. Lập tức bắn lệnh MQTT để phần cứng nhận liền (0 delay)
    const command = { pin: pin, cmd: state ? "OFF" : "ON" }; // Active-low relay
    const topic = `iras-rag/command/${mac}`;
    mqttClient.publish(topic, JSON.stringify(command));
    console.log(`[MQTT CONTROL] Đã gửi lệnh Relay tới ${mac}:`, command);

    // 2. Chạy ngầm việc update vào database Supabase
    const { error } = await supabase.from('devices')
      .update({ [relay_field]: state })
      .eq('tank_id', tank_id);

    if (error) {
      console.error('❌ Lỗi lưu trạng thái Relay vào DB:', error.message);
      return res.status(500).json({ error: "Failed to update database" });
    }
    
    res.json({ success: true, message: "Command sent & Database updated" });
  } catch (err) {
    console.error('❌ Lỗi API điều khiển Relay:', err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ==========================================
// TÍCH HỢP GỬI LỆNH THÔ QUA API (ZERO DELAY)
// ==========================================
app.post('/api/device/command', async (req, res) => {
  try {
    const { tank_id, command } = req.body;
    
    if (!command || !tank_id) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Lấy MAC Address từ DB
    const { data: device, error: fetchErr } = await supabase.from('devices').select('mac_address').eq('tank_id', tank_id).single();
    if (fetchErr || !device || !device.mac_address) {
      return res.status(404).json({ error: "Device not found" });
    }
    const mac = device.mac_address;

    // Lập tức bắn lệnh MQTT để phần cứng nhận liền
    const topic = `iras-rag/command/${mac}`;
    mqttClient.publish(topic, command); // Lưu ý: gửi dạng chuỗi thô (raw string) không phải JSON
    console.log(`[MQTT CONTROL] Đã gửi lệnh thô tới ${mac}:`, command);

    res.json({ success: true, message: "Raw command sent via MQTT" });
  } catch (err) {
    console.error('❌ Lỗi API điều khiển Raw Command:', err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Bắt các route không tồn tại
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, ISOLATED_TEST ? '127.0.0.1' : undefined, () => {
  console.log(`Server is running on port ${PORT}`);
});

// ==========================================
// TÍCH HỢP MQTT SUBSCRIBER (HIVEMQ TLS)
// ==========================================
const mqtt = require('mqtt');
const supabase = require('./config/supabase'); // Sử dụng chung supabase instance có sẵn
const { sendAlertEmail } = ISOLATED_TEST
  ? { sendAlertEmail: async () => false }
  : require('./config/mailer');
const { sendWebPush } = ISOLATED_TEST
  ? { sendWebPush: async () => {} }
  : require('./config/fcm');

const MQTT_HOST = '8263ee975ee9413ca344b39c068b3dbc.s1.eu.hivemq.cloud';
const MQTT_PORT = 8883;
const MQTT_USER = 'amazing_iot';
const MQTT_PASS = 'Amazing_iot2025';
const TOPIC_DATA = 'iras-rag/telemetry/+';

const connectUrl = `mqtts://${MQTT_HOST}:${MQTT_PORT}`;
const mqttClient = ISOLATED_TEST ? new (require('node:events').EventEmitter)() : mqtt.connect(connectUrl, {
  clientId: 'AquaCare_Backend_' + Math.random().toString(16).slice(2, 8),
  username: MQTT_USER,
  password: MQTT_PASS,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});
if (ISOLATED_TEST) {
  mqttClient.connected = true;
  mqttClient.publish = (_topic, _payload, options, callback) => {
    const done = typeof options === 'function' ? options : callback;
    done?.(null);
  };
  mqttClient.subscribe = (_topic, callback) => callback?.(null);
}

const { startTimerWorker } = require('./timer_worker');
const { stopPumpAtHighWater } = require('./pump_high_water');
if (!ISOLATED_TEST) startTimerWorker({ supabase, mqttClient });

const { createTankNotifier } = require('./tank_notifier');
const notifyTank = createTankNotifier({ supabase, sendAlertEmail, sendWebPush });
const { startSimulatorAlertWorker } = require('./simulator_alert_worker');
if (!ISOLATED_TEST) startSimulatorAlertWorker({ supabase, notifyTank });

// Hàm kiểm tra và lưu cảnh báo (Tích hợp bộ lọc chống spam & gộp trạng thái)
async function checkAndInsertAlerts(device, state, recordedAt) {
  if (!device.tank_id) return;
  const thresholds = await getSpeciesThresholds(supabase, device.tank_id);
  const metrics = [];
  for (const [key, label, unit] of [['ph', 'pH', ''], ['temp', 'Nhiệt độ', '°C'], ['tds', 'TDS', ' ppm']]) {
    const value = state[key];
    if (!Number.isFinite(value)) continue;
    const threshold = thresholds[key];
    const deviation = Math.max(0, threshold.good[0] - value, value - threshold.good[1]);
    const dangerous = value < threshold.warn[0] || value > threshold.warn[1];
    const severity = dangerous ? 'Nguy hiểm' : deviation > 0 ? 'Cảnh báo' : null;
    metrics.push({ label, value, threshold, deviation, severity, message: label + ' ở mức ' + value + unit });
  }
  if (typeof state.water_level_ok === 'boolean') {
    const low = !state.water_level_ok;
    metrics.push({ label: 'Mực nước', value: Number(!low), severity: low ? 'Nguy hiểm' : null,
      deviation: Number(low), threshold: { water_level_ok: true }, message: 'Bể bị cạn nước' });
  }
  const { data: accepted, error } = await supabase.rpc('record_hardware_alert_sample', {
    p_device: device.id, p_tank: device.tank_id, p_at: recordedAt, p_metrics: metrics
  });
  if (error) throw new Error('Lỗi ghi đợt cảnh báo: ' + error.message);
  const rawAlerts = metrics.filter(metric => accepted.includes(metric.label)).map(metric => ({
    label: metric.label, severity: metric.severity === 'Nguy hiểm' ? 'Danger' : 'Warn', msg: metric.message
  }));
  await notifyTank(device.tank_id, rawAlerts);
}

// Lắng nghe sự kiện kết nối
mqttClient.on('connect', () => {
  console.log('✅ Đã kết nối thành công tới Server HiveMQ (Tích hợp trong Express)!');
  mqttClient.subscribe(TOPIC_DATA, (err) => {
    if (!err) {
      console.log(`📡 Đã đăng ký lắng nghe dữ liệu thô từ: ${TOPIC_DATA}`);
    } else {
      console.error('❌ Lỗi subscribe MQTT:', err.message);
    }
  });
});

mqttClient.on('error', (err) => {
  console.error('❌ MQTT Error:', err.message);
});

// Xử lý message nhận được
mqttClient.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    const mac = payload.mac;
    const readings = payload.readings;

    if (!mac || !readings) return;

    // Fetch thông tin device (Chỉ lấy máy đang active)
    const { data: devices, error: fetchErr } = await supabase
      .from('devices')
      .select('id, mac_address, tank_id, is_simulator')
      .eq('mac_address', mac)
      .eq('is_active', true);

    if (fetchErr || !devices || devices.length === 0) {
      return; // Bỏ qua nếu thiết bị chưa đăng ký hoặc đang tắt
    }

    const device = devices[0];

    console.log(`\n📥 [HARDWARE DATA] Nhận được dữ liệu thật từ MAC: ${mac}`);

    // Map giá trị
    let temp = null, ph = null, tds = null, water = null;
    for (const r of readings) {
      if (r.pin === 1) temp = r.val;
      else if (r.pin === 2) ph = r.val;
      else if (r.pin === 3) tds = r.val;
      else if (r.pin === 5) water = (r.val === 1);
    }

    if (temp === null && ph === null && tds === null && water === null) {
      return;
    }

    const state = {
      temp: temp !== null ? Number(temp) : 0,
      ph: ph !== null ? Number(ph) : 0,
      tds: tds !== null ? Number(tds) : 0,
      water_level_ok: water !== null ? water : false
    };

    // Insert dữ liệu
    const recordedAt = new Date().toISOString();
    const { error: insertErr } = await supabase.from('telemetry_logs').insert({
      device_id: device.id,
      temp: state.temp,
      ph: state.ph,
      tds: state.tds,
      water_level_ok: state.water_level_ok,
      recorded_at: recordedAt
    });

    if (insertErr) {
      console.error('❌ Lỗi insert dữ liệu thật vào DB:', insertErr.message);
      return; // Nếu lỗi thì không chạy tiếp phần update
    }

    console.log(`✅ Đã lưu dữ liệu phần cứng lên Supabase! (Temp: ${state.temp} | pH: ${state.ph} | TDS: ${state.tds} | Water: ${state.water_level_ok})`);

    // Y26 is mounted at the upper water limit. Only an explicit wet reading
    // from real hardware may stop the pump; missing readings must not trigger it.
    if (water !== null) {
      await stopPumpAtHighWater({ supabase, mqttClient, device, water });
    }

    // TỰ ĐỘNG HÓA: Nếu thiết bị đang ở mode simulator, chuyển nó thành mode phần cứng (false)
    if (device.is_simulator === true) {
      const { error: updateErr } = await supabase.from('devices').update({ is_simulator: false }).eq('id', device.id);
      if (!updateErr) {
        console.log(`🔄 Đã tự động chuyển đổi thiết bị [${mac}] từ Giả lập -> Phần cứng thật!`);
      }
    }

    // Xử lý lưu cảnh báo nếu có
    await checkAndInsertAlerts(device, { temp: temp === null ? null : state.temp, ph: ph === null ? null : state.ph,
      tds: tds === null ? null : state.tds, water_level_ok: water }, recordedAt);

  } catch (error) {
    // try-catch bọc quanh toàn bộ logic async để tránh Crash server Express
    console.error('❌ Lỗi xử lý MQTT Message (Server an toàn không bị crash):', error.message);
  }
});
