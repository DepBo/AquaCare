function createTankNotifier({ supabase, sendAlertEmail, sendWebPush, now = Date.now }) {
  return async function notifyTank(tankId, alerts, { simulator = false } = {}) {
    if (!alerts.length) return;
    const { data: config, error: configError } = await supabase.from('tank_notification_settings')
      .select('*').eq('tank_id', tankId).maybeSingle();
    if (configError) throw configError;
    if (!config || config.alert_severity_preference === 'none') return;
    const filtered = alerts.filter(alert => {
      if (config.alert_severity_preference === 'critical_only') return alert.severity === 'Danger';
      if (config.alert_severity_preference === 'warning_only') return alert.severity === 'Warn';
      return true;
    });
    if (!filtered.length) return;
    const { data: tank, error } = await supabase.from('tanks')
      .select('last_alert_sent_at,tank_name,users(email,web_fcm_token,app_fcm_token)').eq('id', tankId).single();
    if (error) throw error;
    const user = tank.users;
    const channels = [
      [config.notify_via_email && user?.email, sendAlertEmail],
      [config.notify_via_web_push && user?.web_fcm_token, sendWebPush],
      [config.notify_via_app_noti && user?.app_fcm_token, sendWebPush],
    ].filter(([destination]) => destination);
    if (!channels.length) return;
    const time = now();
    const cooldown = Math.max(simulator ? 1 : 0, Number(config.alert_cooldown_minutes) || 0) * 60000;
    if (tank.last_alert_sent_at && time - Date.parse(tank.last_alert_sent_at) < cooldown) return;
    // Compare-and-set also protects against two backend instances reading the same cooldown.
    let claim = supabase.from('tanks').update({ last_alert_sent_at: new Date(time).toISOString() }).eq('id', tankId);
    claim = tank.last_alert_sent_at ? claim.eq('last_alert_sent_at', tank.last_alert_sent_at)
      : claim.is('last_alert_sent_at', null);
    const { data: claimed, error: claimError } = await claim.select('id');
    if (claimError) throw claimError;
    if (!claimed?.length) return;
    const details = filtered.map(alert => alert.label + ' đang ' +
      (alert.severity === 'Danger' ? 'Nguy hiểm' : 'Cảnh báo') + ' (' + alert.msg + ')').join('; ');
    const message = (simulator ? '[Mô phỏng] ' : '') + 'Hồ cá của bạn có cảnh báo: ' + details + '.';
    // A failed delivery keeps cooldown, preventing retries from spamming other channels.
    const results = await Promise.allSettled(channels.map(([destination, send]) => send(destination, tank.tank_name, message)));
    results.forEach((result, index) => {
      if (result.status === 'rejected' || result.value === false) {
        console.error('[Tank notification] Delivery failed', tankId, index, result.reason?.message || 'provider rejected');
      }
    });
  };
}

module.exports = { createTankNotifier };
