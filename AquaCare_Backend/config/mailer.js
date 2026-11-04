const nodemailer = require('nodemailer');

// Khởi tạo transporter với cấu hình Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

if (process.env.RENDER && !process.env.BREVO_API_KEY) {
  console.warn('[Alert Email] Chưa cấu hình BREVO_API_KEY. Nếu dùng Render Free, SMTP bị chặn và email cảnh báo sẽ không gửi được.');
}

// Hàm gửi email cảnh báo
async function sendAlertEmail(toEmail, pondName, alertContent) {
  try {
    const useHttp = Boolean(process.env.BREVO_API_KEY);
    const from = useHttp
      ? (process.env.ALERT_EMAIL_FROM || process.env.EMAIL_USER)
      : '"AquaCare System" <' + process.env.EMAIL_USER + '>';
    if (useHttp && !from) throw new Error('Thiếu ALERT_EMAIL_FROM hoặc EMAIL_USER cho Brevo.');
    if (!useHttp && (!process.env.EMAIL_USER || !process.env.EMAIL_PASS)) {
      throw new Error('Thiếu EMAIL_USER hoặc EMAIL_PASS cho SMTP.');
    }

    const email = {
      from,
      to: toEmail,
      subject: `⚠️ Cảnh báo khẩn cấp từ bể: ${pondName}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #00A896; color: white; padding: 20px; text-align: center;">
            <h2 style="margin: 0; font-size: 24px;">Hệ thống AquaCare</h2>
            <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">Cảnh báo sự cố bể cá</p>
          </div>
          <div style="padding: 30px 20px; background-color: #ffffff;">
            <p style="font-size: 16px; color: #333; margin-top: 0;">Xin chào,</p>
            <p style="font-size: 16px; color: #333;">Hệ thống vừa phát hiện thông số bất thường tại bể: <strong>${pondName}</strong>.</p>
            
            <div style="background-color: #fff3f3; border-left: 4px solid #FF6B6B; padding: 15px; margin: 25px 0; border-radius: 0 8px 8px 0;">
              <h3 style="margin: 0 0 10px; color: #FF6B6B; font-size: 16px;">Chi tiết sự cố:</h3>
              <p style="margin: 0; font-size: 15px; color: #555; line-height: 1.5;">${alertContent}</p>
            </div>
            
            <p style="font-size: 15px; color: #555; margin-bottom: 0;">Vui lòng mở ứng dụng AquaCare để kiểm tra và xử lý kịp thời nhằm bảo vệ sức khỏe cho cá.</p>
          </div>
          <div style="background-color: #f8f9fa; padding: 15px; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #e0e0e0;">
            <p style="margin: 0;">Đây là email tự động từ AquaCare. Vui lòng không trả lời lại.</p>
          </div>
        </div>
      `
    };

    if (useHttp) {
      // Render Free chặn cổng SMTP; HTTPS vẫn gửi được qua API của Brevo.
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: 'AquaCare System', email: from },
          to: [{ email: toEmail }],
          subject: email.subject,
          htmlContent: email.html,
        }),
        signal: AbortSignal.timeout(10000),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(`Brevo HTTP ${response.status}: ${result.message || 'Không rõ lỗi'}`);
      console.log(`📧 [Brevo] Đã nhận email cảnh báo gửi tới ${toEmail} (ID: ${result.messageId})`);
    } else {
      const info = await transporter.sendMail(email);
      console.log(`📧 [Nodemailer] Đã gửi email cảnh báo tới ${toEmail} thành công (MessageId: ${info.messageId})`);
    }
    return true;
  } catch (err) {
    console.error('❌ [Alert Email] Lỗi khi gửi email:', err.message);
    return false;
  }
}

async function sendDemoMacEmail(toEmail, orderId, macs, physical = false, details = []) {
  if (!toEmail || !Array.isArray(macs) || macs.length === 0 || !macs.every(mac => /^[0-9A-F]{2}(?::[0-9A-F]{2}){5}$/i.test(mac))) {
    console.error('[Demo email] Invalid recipient or MAC list');
    return false;
  }
  const from = process.env.EMAIL_USER || process.env.ALERT_EMAIL_FROM;
  if (!from) return false;
  const subject = physical ? 'AquaCare - mã kết nối thiết bị của bạn' : `AquaCare V3 Demo - mã thiết bị cho đơn #${orderId}`;
  const macList = macs.map(mac => `<li><code>${mac}</code></li>`).join('');
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const supportEmail = process.env.EMAIL_USER || from;
  const physicalCards = details.map(device => `<div style="background:#f4faf9;border:1px solid #cde7e3;border-radius:12px;padding:20px 22px;margin:0 0 14px">
    <div style="font-size:12px;color:#607b82;font-weight:700;letter-spacing:1px">THIẾT BỊ CỦA BẠN</div>
    <div style="font-size:17px;font-weight:700;color:#173846;margin:10px 0 3px">${escapeHtml(device.name)}</div>
    <div style="font-size:13px;color:#56767d">Phiên bản ${escapeHtml(device.version)}</div>
    <div style="height:1px;background:#dcebe8;margin:16px 0"></div>
    <div style="font-size:12px;color:#607b82;font-weight:700;letter-spacing:1px">MÃ MAC</div>
    <div style="font-family:monospace;font-size:23px;font-weight:700;letter-spacing:2px;color:#0a555c;margin-top:10px;word-break:break-all">${escapeHtml(device.mac)}</div>
  </div>`).join('');
  const physicalHtml = `<div style="background:#eef4f5;padding:24px 12px;font-family:Arial,sans-serif;color:#173846"><div style="max-width:600px;margin:auto;background:#fff;border:1px solid #dce8e9;border-radius:16px;overflow:hidden">
    <div style="height:5px;background:#0a9e9b"></div><div style="padding:30px 36px">
    <div style="font-size:22px;font-weight:700;color:#123a4a">AquaCare</div>
    <div style="font-size:12px;font-weight:700;letter-spacing:1.8px;color:#0b9691;margin:34px 0 10px">THIẾT BỊ CỦA BẠN ĐÃ SẴN SÀNG</div>
    <h1 style="font-size:27px;line-height:1.2;color:#123a4a;margin:0 0 12px">Mã kết nối bể cá của bạn</h1>
    <p style="font-size:15px;line-height:1.65;color:#526a74">Thiết bị AquaCare của bạn đã được giao thành công. Dùng mã MAC bên dưới để tạo bể và bắt đầu theo dõi.</p>
    ${physicalCards}<div style="border-top:1px solid #e5eeee;padding-top:22px;color:#526a74;font-size:14px;line-height:1.8"><strong style="color:#183d4b">Bắt đầu sử dụng</strong><ol><li>Mở ứng dụng hoặc website AquaCare và đăng nhập.</li><li>Chọn <strong>Thêm bể</strong>, rồi nhập mã MAC ở trên.</li><li>Hoàn tất thông tin bể để bắt đầu theo dõi và điều khiển.</li></ol></div>
    <p style="font-size:13px;color:#526a74;line-height:1.6">Nếu cần hỗ trợ, hãy liên hệ AquaCare qua <a href="mailto:${escapeHtml(supportEmail)}" style="color:#0b9691">${escapeHtml(supportEmail)}</a>.</p>
    </div><div style="background:#f8fbfb;border-top:1px solid #e5eeee;text-align:center;padding:21px 24px;color:#81949a;font-size:12px">Email tự động từ AquaCare · Vui lòng giữ mã MAC cho thiết bị của bạn.</div></div></div>`;
  const html = physical ? physicalHtml : `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#183747">
    <h2>AquaCare${physical ? '' : ' V3 Demo'}</h2>
    <p>Đơn hàng #${orderId} của bạn đã được hệ thống hoàn tất. ${physical ? 'Đơn đã giao thành công. Đây là mã MAC thiết bị của bạn để tạo bể:' : 'Đây là mã MAC simulator riêng để tạo bể:'}</p>
    <ul>${macList}</ul>
    <p>Mở ứng dụng AquaCare, tạo bể và nhập một mã MAC ở trên. ${physical ? 'Bạn cũng có thể tạo bể trên website AquaCare. Mỗi mã tương ứng một thiết bị trong đơn.' : 'Đây là bản dùng thử; không có thiết bị vật lý được giao.'}</p>
    <p>Vui lòng giữ mã trong tài khoản của bạn.</p></div>`;
  try {
    if (process.env.BREVO_API_KEY) {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender: { name: 'AquaCare', email: from }, to: [{ email: toEmail }], subject, htmlContent: html }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error(`Brevo HTTP ${response.status}`);
    } else {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) throw new Error('SMTP is not configured');
      await transporter.sendMail({ from: `"AquaCare" <${process.env.EMAIL_USER}>`, to: toEmail, subject, html });
    }
    console.log(`[Demo email] Accepted for order #${orderId}`);
    return true;
  } catch (error) {
    console.error(`[Demo email] Order #${orderId}:`, error.message);
    return false;
  }
}

module.exports = { sendAlertEmail, sendDemoMacEmail, sendOrderMacEmail: (email, id, macs, details) => sendDemoMacEmail(email, id, macs, true, details) };
