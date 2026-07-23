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

// Route Health Check dành cho UptimeRobot
app.get('/api/health', (req, res) => {
  // In ra màn hình log của Render
  console.log(`[${new Date().toLocaleTimeString()}] UptimeRobot vừa gọi để giữ Server thức!`); 
  
  // Trả về cho UptimeRobot biết là Server vẫn ổn
  res.status(200).send('Server is awake!');
});

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
const { sendAlertEmail } = require('./config/mailer');
const { sendWebPush } = require('./config/fcm');

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

// Hàm kiểm tra và lưu cảnh báo (Tích hợp bộ lọc chống spam & gộp trạng thái)
async function checkAndInsertAlerts(device, state) {
  if (!device.tank_id) return;
  const alerts = [];
  const rawAlerts = [];

  const checkSeverity = (val, good, warn) => {
    if (val < warn[0] || val > warn[1]) return 'Danger';
    if (val < good[0] || val > good[1]) return 'Warn';
    return 'Good';
  };

  const phSev = checkSeverity(state.ph, [6.5, 7.5], [6.0, 8.0]);
  if (phSev !== 'Good') {
    const msg = `pH ở mức ${state.ph.toFixed(2)}`;
    alerts.push({ tank_id: device.tank_id, device_id: device.id, alert_type: 'pH', actual_value: Number(state.ph.toFixed(2)), alert_message: `Cảnh báo: ${msg}` });
    rawAlerts.push({ label: 'pH', severity: phSev, msg });
  }

  const tempSev = checkSeverity(state.temp, [24, 28], [22, 30]);
  if (tempSev !== 'Good') {
    const msg = `Nhiệt độ ở mức ${state.temp.toFixed(2)}°C`;
    alerts.push({ tank_id: device.tank_id, device_id: device.id, alert_type: 'Nhiệt độ', actual_value: Number(state.temp.toFixed(2)), alert_message: `Cảnh báo: ${msg}` });
    rawAlerts.push({ label: 'Nhiệt độ', severity: tempSev, msg });
  }

  const tdsSev = checkSeverity(state.tds, [150, 300], [100, 400]);
  if (tdsSev !== 'Good') {
    const msg = `TDS ở mức ${state.tds.toFixed(0)} ppm`;
    alerts.push({ tank_id: device.tank_id, device_id: device.id, alert_type: 'TDS', actual_value: Number(state.tds.toFixed(0)), alert_message: `Cảnh báo: ${msg}` });
    rawAlerts.push({ label: 'TDS', severity: tdsSev, msg });
  }

  if (!state.water_level_ok) {
    alerts.push({ tank_id: device.tank_id, device_id: device.id, alert_type: 'Mực nước', actual_value: 0, alert_message: `Cảnh báo: Bể cạn nước!` });
    rawAlerts.push({ label: 'Mực nước', severity: 'Danger', msg: 'Bể bị cạn nước' });
  }

  if (alerts.length > 0) {
    // Luôn ghi dữ liệu thô vào lịch sử hiển thị trên Web
    const { error: insertAlertErr } = await supabase.from('alerts_history').insert(alerts);
    if (insertAlertErr) console.error('❌ Lỗi lưu lịch sử cảnh báo:', insertAlertErr.message);
    else console.log(`[!] Đã tự động lưu ${alerts.length} cảnh báo cho thiết bị (MAC: ${device.mac_address}).`);

    // 1. Đọc chính xác dữ liệu cấu hình thông báo và mốc thời gian gửi cũ từ DB
    const { data: config } = await supabase.from('tank_notification_settings').select('*').eq('tank_id', device.tank_id).single();
    const { data: tankData, error: tankErr } = await supabase.from('tanks').select('last_alert_sent_at, tank_name, users(email, web_fcm_token, app_fcm_token)').eq('id', device.tank_id).single();
    if (tankErr) { console.error('❌ Lỗi lấy dữ liệu bể:', tankErr.message); return; }

    if (config && config.alert_severity_preference !== 'none') {
      const hasDanger = rawAlerts.some(a => a.severity === 'Danger');

      // 2. Bộ lọc Mức độ nghiêm trọng (Alert Severity Filter)
      if (config.alert_severity_preference === 'critical_only' && !hasDanger) {
        return; 
      }
      if (config.alert_severity_preference === 'warning_only' && hasDanger) {
        return;
      }

      // 3. Thuật toán kiểm tra Cooldown sử dụng dữ liệu vừa fetch từ tankData
      let canSend = true;
      if (tankData && tankData.last_alert_sent_at && Number(config.alert_cooldown_minutes) > 0) {
        const lastSent = new Date(tankData.last_alert_sent_at).getTime();
        const now = Date.now();
        const diffMinutes = (now - lastSent) / (1000 * 60);
        
        if (diffMinutes < Number(config.alert_cooldown_minutes)) {
          canSend = false;
        }
      }

      // 4. Logic Gộp thông báo và kích hoạt gửi
      if (canSend) {
        const aggregatedDetails = rawAlerts.map(a => `${a.label} đang ${a.severity === 'Danger' ? 'Nguy hiểm' : 'Cảnh báo'} (${a.msg})`).join(' đồng thời ');
        const aggregatedMsg = `Hồ cá của bạn đang có sự cố song song: ${aggregatedDetails}.`;
        
        console.log(`\n========================================`);
        console.log(`🔔 KÍCH HOẠT THÔNG BÁO CHO BỂ [${device.tank_id}]`);
        console.log(`Nội dung: ${aggregatedMsg}`);
        
        if (config.notify_via_email && tankData && tankData.users && tankData.users.email) {
          console.log(`[Email] -> Đang tiến hành gửi email tới ${tankData.users.email}...`);
          await sendAlertEmail(tankData.users.email, tankData.tank_name, aggregatedMsg);
        }
        if (config.notify_via_web_push) {
          if (tankData && tankData.users && tankData.users.web_fcm_token) {
            console.log(`[Web Push] -> Đang tiến hành gửi Push Notification tới Trình duyệt...`);
            await sendWebPush(tankData.users.web_fcm_token, tankData.tank_name, aggregatedMsg);
          } else {
            console.log(`[Web Push] -> Trình duyệt chưa cấp quyền FCM Token.`);
          }
        }
        if (config.notify_via_app_noti) {
          if (tankData && tankData.users && tankData.users.app_fcm_token) {
            console.log(`[App Notification] -> Đang tiến hành gửi Push Notification tới App di động...`);
            await sendWebPush(tankData.users.app_fcm_token, tankData.tank_name, aggregatedMsg);
          } else {
            console.log(`[App Notification] -> App chưa đăng ký FCM Token.`);
          }
        }
        console.log(`========================================\n`);

        // Cập nhật mốc thời gian mới bằng định dạng ISOString chuẩn
        const currentMilli = new Date().toISOString();
        const { error: updateTankErr } = await supabase
          .from('tanks')
          .update({ last_alert_sent_at: currentMilli })
          .eq('id', device.tank_id);
          
        if (updateTankErr) {
          console.error('❌ Lỗi cập nhật mốc thời gian last_alert_sent_at trên bảng tanks:', updateTankErr.message);
        }
      } else {
        console.log(`⏳ Đang trong thời gian Cooldown chặn Spam (${config.alert_cooldown_minutes} phút), hệ thống chỉ lưu DB, KHÔNG bắn thông báo ra ngoài.`);
      }
    }
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

// ==========================================
// TÍCH HỢP ĐIỀU KHIỂN RELAY QUA API (ZERO DELAY)
// ==========================================
app.post('/api/device/relay', async (req, res) => {
  try {
    const { tank_id, pin, state, relay_field } = req.body;
    
    if (pin === undefined || state === undefined || !tank_id || !relay_field) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Lấy MAC Address từ DB
    const { data: device, error: fetchErr } = await supabase.from('devices').select('mac_address').eq('tank_id', tank_id).single();
    if (fetchErr || !device || !device.mac_address) {
      return res.status(404).json({ error: "Device not found" });
    }
    const mac = device.mac_address;

    // 1. Lập tức bắn lệnh MQTT để phần cứng nhận liền (0 delay)
    const command = { pin: pin, cmd: state ? "ON" : "OFF" };
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
