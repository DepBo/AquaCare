require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Key in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Trạng thái các thiết bị để phục vụ thuật toán Random Walk
const deviceStates = {};

// Hàm sinh số ngẫu nhiên trong khoảng (min, max)
function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Khởi tạo trạng thái gốc cho một thiết bị nếu chưa có
function initDeviceState(deviceId) {
  if (!deviceStates[deviceId]) {
    deviceStates[deviceId] = {
      temp: 26.0,
      ph: 7.0,
      tds: 250,
      water_level_ok: true
    };
  }
}

// Thuật toán Random Walk để lấy giá trị tiếp theo
function getNextValue(currentValue, stepMax, minLimit, maxLimit) {
  // Sinh bước đi ngẫu nhiên từ -stepMax đến +stepMax
  let step = randomRange(-stepMax, stepMax);
  let nextValue = currentValue + step;

  // Giữ giá trị trong giới hạn
  if (nextValue < minLimit) nextValue = minLimit + Math.abs(step);
  if (nextValue > maxLimit) nextValue = maxLimit - Math.abs(step);

  return nextValue;
}

let activeDevices = [];

// Hàm lấy danh sách thiết bị đang hoạt động
async function fetchActiveDevices() {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('id, mac_address')
      .eq('is_active', true);

    if (error) {
      console.error('Lỗi khi lấy danh sách thiết bị:', error.message);
      return;
    }

    activeDevices = data || [];
    console.log(`\n[${new Date().toLocaleTimeString()}] Đã cập nhật danh sách thiết bị. Tổng cộng: ${activeDevices.length} thiết bị active.`);
  } catch (err) {
    console.error('Lỗi ngoại lệ khi fetch thiết bị:', err);
  }
}

// Hàm đẩy dữ liệu telemetry cho tất cả các thiết bị active
async function pushTelemetryData() {
  if (activeDevices.length === 0) {
    console.log(`[${new Date().toLocaleTimeString()}] Không có thiết bị nào đang hoạt động để gửi dữ liệu.`);
    return;
  }

  const logsToInsert = [];
  const reportData = [];

  for (const device of activeDevices) {
    initDeviceState(device.id);
    const state = deviceStates[device.id];

    // Cập nhật trạng thái bằng Random Walk
    state.temp = getNextValue(state.temp, 0.2, 24.0, 28.5);
    state.ph = getNextValue(state.ph, 0.05, 6.5, 7.5);
    state.tds = getNextValue(state.tds, 5, 150, 300);
    
    // Mực nước: 99% true, 1% false
    state.water_level_ok = Math.random() > 0.01;

    const recordedAt = new Date().toISOString();

    logsToInsert.push({
      device_id: device.id,
      temp: Number(state.temp.toFixed(2)),
      ph: Number(state.ph.toFixed(2)),
      tds: Number(state.tds.toFixed(0)),
      water_level_ok: state.water_level_ok,
      recorded_at: recordedAt
    });

    reportData.push({
      'MAC Address': device.mac_address,
      'Temp (°C)': state.temp.toFixed(2),
      'pH': state.ph.toFixed(2),
      'TDS (ppm)': state.tds.toFixed(0),
      'Water Level': state.water_level_ok ? 'OK' : 'LOW',
      'Time': new Date(recordedAt).toLocaleTimeString()
    });
  }

  // Insert vào Supabase
  try {
    const { error } = await supabase
      .from('telemetry_logs')
      .insert(logsToInsert);

    if (error) {
      console.error('Lỗi khi insert dữ liệu telemetry:', error.message);
    } else {
      console.log('\n--- DỮ LIỆU TELEMETRY ĐÃ GỬI LÊN SUPABASE ---');
      console.table(reportData);
    }
  } catch (err) {
    console.error('Lỗi ngoại lệ khi insert telemetry:', err);
  }
}

// Hàm main để chạy chương trình
async function main() {
  console.log('🚀 Khởi động Hardware Simulator...');
  
  // Gọi lần đầu để lấy danh sách
  await fetchActiveDevices();
  
  // Gửi data lần đầu ngay lập tức
  await pushTelemetryData();

  // Đặt lịch cập nhật danh sách thiết bị mỗi 1 phút (60,000 ms)
  setInterval(fetchActiveDevices, 60000);

  // Đặt lịch gửi dữ liệu telemetry mỗi 10 giây (10,000 ms)
  setInterval(pushTelemetryData, 10000);
}

main();
