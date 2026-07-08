const nodemailer = require('nodemailer');

// Khởi tạo transporter với cấu hình Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

// Hàm gửi email cảnh báo
async function sendAlertEmail(toEmail, pondName, alertContent) {
  try {
    const info = await transporter.sendMail({
      from: '"AquaCare System" <' + process.env.EMAIL_USER + '>',
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
    });
    console.log(`📧 [Nodemailer] Đã gửi email cảnh báo tới ${toEmail} thành công (MessageId: ${info.messageId})`);
  } catch (err) {
    console.error('❌ [Nodemailer] Lỗi khi gửi email:', err.message);
  }
}

module.exports = { sendAlertEmail };
