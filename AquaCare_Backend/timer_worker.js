require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 1. Kết nối Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:5000';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseKey);

// 3. Hàm kiểm tra lịch hẹn giờ
async function checkSchedules() {
  try {
    // 3.1: Lấy thời gian hiện tại định dạng HH:MM
    const now = new Date();
    const currentHours = String(now.getHours()).padStart(2, '0');
    const currentMinutes = String(now.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${currentHours}:${currentMinutes}`;

    // 3.2: Lấy danh sách thiết bị
    const { data: devices, error } = await supabase.from('devices').select('*');
    if (error) {
      console.error('Lỗi khi fetch thiết bị:', error.message);
      return;
    }

    // 3.3: Duyệt qua các thiết bị
    for (const dev of devices) {
      // -- Xử lý Máy bơm --
      if (dev.pump_on_time && dev.pump_on_time === currentTimeStr && !dev.relay_pump_state) {
        await handleToggle(dev.id, 'Pump', 'ON', 'relay_pump_state', true, currentTimeStr);
      } else if (dev.pump_off_time && dev.pump_off_time === currentTimeStr && dev.relay_pump_state) {
        await handleToggle(dev.id, 'Pump', 'OFF', 'relay_pump_state', false, currentTimeStr);
      }

      // -- Xử lý Đèn thủy sinh --
      if (dev.light_on_time && dev.light_on_time === currentTimeStr && !dev.relay_light_state) {
        await handleToggle(dev.id, 'Light', 'ON', 'relay_light_state', true, currentTimeStr);
      } else if (dev.light_off_time && dev.light_off_time === currentTimeStr && dev.relay_light_state) {
        await handleToggle(dev.id, 'Light', 'OFF', 'relay_light_state', false, currentTimeStr);
      }
    }
  } catch (err) {
    console.error('Lỗi checkSchedules:', err);
  }
}

// Hàm hỗ trợ bật/tắt thiết bị và ghi log
async function handleToggle(deviceId, relayName, action, columnToUpdate, newValue, timeStr) {
  // Cập nhật trạng thái thiết bị
  const updateData = {};
  updateData[columnToUpdate] = newValue;

  const { error: updateError } = await supabase.from('devices')
    .update(updateData)
    .eq('id', deviceId);

  if (updateError) {
    console.error(`[${timeStr}] ❌ Lỗi thay đổi trạng thái ${relayName} (Device ${deviceId}):`, updateError.message);
    return;
  }

  // Ghi log vào relay_logs
  const { error: logError } = await supabase.from('relay_logs').insert({
    device_id: deviceId,
    relay_name: relayName,
    action: action,
    triggered_by: 'AUTO'
  });

  if (logError) {
    console.error(`[${timeStr}] ❌ Lỗi ghi log ${relayName} (Device ${deviceId}):`, logError.message);
  } else {
    // 4. Console Log trực quan
    const deviceName = relayName === 'Pump' ? 'Máy bơm' : 'Đèn thủy sinh';
    const actionName = action === 'ON' ? 'BẬT' : 'TẮT';
    console.log(`[${timeStr}] ⏰ [AUTO] Phát hiện lịch hẹn giờ: Đang ${actionName} ${deviceName} cho thiết bị ID ${deviceId}...`);
  }
}

// 2. Vòng lặp tự động (10 giây)
console.log('🚀 Đang khởi động Bộ quét hẹn giờ trung tâm AquaCare...');
setInterval(checkSchedules, 10000);

// Chạy ngay lần đầu tiên khi khởi động
checkSchedules();
