// Y26 is mounted at the upper water limit. The firmware reports 1 when wet.
const stopping = new Set();
const highWaterCommanded = new Set();

async function isHighWaterNow(supabase, deviceId) {
  const { data, error } = await supabase.from('telemetry_logs')
    .select('water_level_ok').eq('device_id', deviceId)
    .order('recorded_at', { ascending: false }).limit(1);
  if (error) throw error;
  return data?.[0]?.water_level_ok === true;
}

function publishPumpOff(mqttClient, mac) {
  return new Promise((resolve, reject) => {
    // Match the existing web/mobile relay mapping: UI OFF sends MQTT cmd ON.
    mqttClient.publish(`iras-rag/command/${mac}`, JSON.stringify({ pin: 3, cmd: 'ON' }), { qos: 1 },
      error => error ? reject(error) : resolve());
  });
}

async function stopPumpAtHighWater({ supabase, mqttClient, device, water, logger = console }) {
  if (water === false && device?.id) highWaterCommanded.delete(device.id);
  if (water !== true || !device?.tank_id || device.is_simulator === true || !mqttClient.connected) return false;
  if (stopping.has(device.id)) return false;
  stopping.add(device.id);
  try {
    const { data: current, error: readError } = await supabase.from('devices')
      .select('relay_pump_state, is_active').eq('id', device.id).single();
    if (readError) throw readError;
    if (!current?.is_active) return false;
    if (current.relay_pump_state !== true && highWaterCommanded.has(device.id)) return false;

    // Also send once if an earlier attempt marked the database OFF while the
    // pump stayed on. This corrects the already inconsistent state in the field.
    if (!highWaterCommanded.has(device.id)) {
      await publishPumpOff(mqttClient, device.mac_address);
      highWaterCommanded.add(device.id);
    }
    if (current.relay_pump_state !== true) return true;
    const { error: updateError } = await supabase.from('devices')
      .update({ relay_pump_state: false }).eq('id', device.id);
    if (updateError) throw updateError;
    const { error: logError } = await supabase.from('relay_logs').insert({
      device_id: device.id, relay_name: 'Pump', action: 'OFF', triggered_by: 'AUTO',
    });
    if (logError) logger.error(`[Pump high water] Could not save relay log for ${device.id}:`, logError);
    logger.log(`[Pump high water] Y26 wet; sent pump-stop command for ${device.mac_address}`);
    return true;
  } catch (error) {
    logger.error(`[Pump high water] Could not stop pump for ${device.mac_address}:`, error);
    return false;
  } finally {
    stopping.delete(device.id);
  }
}

module.exports = { stopPumpAtHighWater, isHighWaterNow };
