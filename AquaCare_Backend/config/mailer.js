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

async function sendDemoMacEmail(toEmail, orderId, macs) {
  if (!toEmail || !Array.isArray(macs) || macs.length === 0 || !macs.every(mac => /^[0-9A-F]{2}(?::[0-9A-F]{2}){5}$/i.test(mac))) {
    console.error('[Demo email] Invalid recipient or MAC list');
    return false;
  }
  const from = process.env.EMAIL_USER || process.env.ALERT_EMAIL_FROM;
  if (!from) return false;
  const subject = `AquaCare V3 Demo - mã thiết bị cho đơn #${orderId}`;
  const macList = macs.map(mac => `<li><code>${mac}</code></li>`).join('');
  const html = `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#183747">
    <h2>AquaCare V3 Demo</h2>
    <p>Đơn hàng #${orderId} của bạn đã được hệ thống hoàn tất. Đây là mã MAC simulator riêng để tạo bể:</p>
    <ul>${macList}</ul>
    <p>Mở ứng dụng AquaCare, tạo bể và nhập một mã MAC ở trên. Đây là bản dùng thử; không có thiết bị vật lý được giao.</p>
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

module.exports = { sendAlertEmail, sendDemoMacEmail };
