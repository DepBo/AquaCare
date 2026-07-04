require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares – CORS phải được khai báo ĐẦU TIÊN, trước mọi route
const allowedOrigins = [
  'http://localhost:5173',          // Dev local (Vite default)
  'http://localhost:3000',          // Dev local (alt port)
  'https://aquacare-p78r.onrender.com', // Backend Render (self)
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

// Bắt các route không tồn tại
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Khởi chạy Bộ quét hẹn giờ ngầm cùng lúc với Server
try {
  require('./timer_worker.js');
  console.log('✅ Đã tích hợp Timer Worker chạy nền thành công!');
} catch (err) {
  console.error('❌ Lỗi khi khởi chạy Timer Worker:', err);
}

// ==========================================
// TÍCH HỢP MQTT SUBSCRIBER (HIVEMQ TLS)
// ==========================================
const mqtt = require('mqtt');
const supabase = require('./config/supabase'); // Sử dụng chung supabase instance có sẵn

const MQTT_HOST = '8263ee975ee9413ca344b39c068b3dbc.s1.eu.hivemq.cloud';
const MQTT_PORT = 8883;
const MQTT_USER = 'amazing_iot';
const MQTT_PASS = 'Amazing_iot2025';
const TOPIC_DATA = 'iras-rag/telemetry/+';

const connectUrl = `mqtts://${MQTT_HOST}:${MQTT_PORT}`;
const mqttClient = mqtt.connect(connectUrl, {
  clientId: 'AquaCare_Backend_' + Math.random().toString(16).slice(2, 8),
  username: MQTT_USER,
  password: MQTT_PASS,
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
});

// Hàm kiểm tra và lưu cảnh báo (chung logic với simulator)
async function checkAndInsertAlerts(device, state) {
  if (!device.tank_id) return;
  const alerts = [];

  if (state.ph < 6.5 || state.ph > 7.5) {
    alerts.push({ tank_id: device.tank_id, device_id: device.id, alert_type: 'pH', actual_value: Number(state.ph.toFixed(2)), alert_message: `Cảnh báo pH: Đang ở mức ${state.ph.toFixed(2)}` });
  }
  if (state.temp < 24.0 || state.temp > 28.0) {
    alerts.push({ tank_id: device.tank_id, device_id: device.id, alert_type: 'Nhiệt độ', actual_value: Number(state.temp.toFixed(2)), alert_message: `Cảnh báo Nhiệt độ: Đang ở mức ${state.temp.toFixed(2)}°C` });
  }
  if (state.tds < 150 || state.tds > 300) {
    alerts.push({ tank_id: device.tank_id, device_id: device.id, alert_type: 'TDS', actual_value: Number(state.tds.toFixed(0)), alert_message: `Cảnh báo TDS: Đang ở mức ${state.tds.toFixed(0)} ppm` });
  }
  if (!state.water_level_ok) {
    alerts.push({ tank_id: device.tank_id, device_id: device.id, alert_type: 'Mực nước', actual_value: 0, alert_message: `Cảnh báo: Bể cạn nước!` });
  }

  if (alerts.length > 0) {
    const { error } = await supabase.from('alerts_history').insert(alerts);
    if (error) console.error('❌ Lỗi lưu lịch sử cảnh báo:', error.message);
    else console.log(`[!] Đã tự động lưu ${alerts.length} cảnh báo cho thiết bị (MAC: ${device.mac_address}).`);
  }
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

    // TỰ ĐỘNG HÓA: Nếu thiết bị đang ở mode simulator, chuyển nó thành mode phần cứng (false)
    if (device.is_simulator === true) {
      const { error: updateErr } = await supabase.from('devices').update({ is_simulator: false }).eq('id', device.id);
      if (!updateErr) {
        console.log(`🔄 Đã tự động chuyển đổi thiết bị [${mac}] từ Giả lập -> Phần cứng thật!`);
      }
    }

    // Xử lý lưu cảnh báo nếu có
    await checkAndInsertAlerts(device, state);

  } catch (error) {
    // try-catch bọc quanh toàn bộ logic async để tránh Crash server Express
    console.error('❌ Lỗi xử lý MQTT Message (Server an toàn không bị crash):', error.message);
  }
});
