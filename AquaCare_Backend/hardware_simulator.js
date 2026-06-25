require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

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
      .select('id, mac_address, tank_id')
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

async function checkAndInsertAlerts(device, state) {
  if (!device.tank_id) return; // Chỉ lưu lịch sử cho máy đã gán vào bể
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
    else console.log(`[!] Đã tự động lưu ${alerts.length} cảnh báo vào Lịch sử.`);
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

    await checkAndInsertAlerts(device, state);

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

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', async (input) => {
  if (activeDevices.length === 0) return console.log('❌ Chưa có thiết bị nào active!');

  // Phân tách nhiều lệnh bằng dấu |
  const commands = input.trim().toLowerCase().split('|').map(c => c.trim());
  const targetUpdates = {}; // Lưu trữ các cập nhật: { ph: 6.0, temp: 23, ... }
  const cmdStrList = [];

  for (const command of commands) {
    const parts = command.split(' ').filter(p => p !== '');
    if (parts.length !== 2) continue;

    const cmd = parts[0];
    const val = Number(parts[1]);
    if (isNaN(val)) {
      console.log(`❌ Giá trị không hợp lệ cho lệnh: ${cmd}`);
      continue;
    }

    switch (cmd) {
      case 'ph': targetUpdates['ph'] = val; cmdStrList.push(`PH=${val}`); break;
      case 'temp': targetUpdates['temp'] = val; cmdStrList.push(`TEMP=${val}`); break;
      case 'tds': targetUpdates['tds'] = val; cmdStrList.push(`TDS=${val}`); break;
      case 'water':
        targetUpdates['water_level_ok'] = (val === 1);
        cmdStrList.push(`WATER=${val}`);
        break;
    }
  }

  if (Object.keys(targetUpdates).length === 0) return;

  const logsToInsert = [];
  const recordedAt = new Date().toISOString();

  // Bơm dữ liệu khẩn cấp cho TẤT CẢ các thiết bị active
  for (const device of activeDevices) {
    initDeviceState(device.id);
    const state = deviceStates[device.id];

    logsToInsert.push({
      device_id: device.id,
      temp: targetUpdates.hasOwnProperty('temp') ? targetUpdates['temp'] : Number(state.temp.toFixed(2)),
      ph: targetUpdates.hasOwnProperty('ph') ? targetUpdates['ph'] : Number(state.ph.toFixed(2)),
      tds: targetUpdates.hasOwnProperty('tds') ? targetUpdates['tds'] : Number(state.tds.toFixed(0)),
      water_level_ok: targetUpdates.hasOwnProperty('water_level_ok') ? targetUpdates['water_level_ok'] : state.water_level_ok,
      recorded_at: recordedAt
    });
  }

  // Insert NGAY LẬP TỨC
  const { error } = await supabase.from('telemetry_logs').insert(logsToInsert);
  if (error) {
    console.log('❌ Lỗi bơm dữ liệu:', error.message);
  } else {
    console.log(`\n🚨 [KHẨN CẤP] ĐÃ BƠM DỮ LIỆU: ${cmdStrList.join(' | ')} vào ${activeDevices.length} thiết bị!`);
  }

  // Chạy check cảnh báo và lưu vào Lịch sử
  for (const device of activeDevices) {
    const state = deviceStates[device.id];
    // Tạo một state tạm thời chứa các giá trị khẩn cấp vừa gõ
    const injectedState = {
      temp: targetUpdates.hasOwnProperty('temp') ? targetUpdates['temp'] : state.temp,
      ph: targetUpdates.hasOwnProperty('ph') ? targetUpdates['ph'] : state.ph,
      tds: targetUpdates.hasOwnProperty('tds') ? targetUpdates['tds'] : state.tds,
      water_level_ok: targetUpdates.hasOwnProperty('water_level_ok') ? targetUpdates['water_level_ok'] : state.water_level_ok
    };
    await checkAndInsertAlerts(device, injectedState);
  }
});

// Hàm main để chạy chương trình
async function main() {
  console.log('🚀 Khởi động Hardware Simulator...');
  console.log('--- HƯỚNG DẪN TEST CẢNH BÁO ---');
  console.log('Gõ lệnh trực tiếp vào Terminal, dùng | để gộp nhiều lệnh.');
  console.log('Cú pháp: <cảm_biến> <giá_trị> | <cảm_biến_2> <giá_trị_2>');
  console.log('VD: ph 6.0 | temp 35 | tds 500 | water 0');
  console.log('-------------------------------');

  // Gọi lần đầu để lấy danh sách
  await fetchActiveDevices();

  // Gửi data lần đầu ngay lập tức
  await pushTelemetryData();

  // Đặt lịch cập nhật danh sách thiết bị mỗi 1 phút (60,000 ms)
  setInterval(fetchActiveDevices, 60000);

  // Đặt lịch gửi dữ liệu telemetry mỗi 10 giây (10,000 ms)
  setInterval(pushTelemetryData, 60000);
}

main();
