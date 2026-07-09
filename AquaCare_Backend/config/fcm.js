const { initializeApp, cert } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const serviceAccount = require('./firebase-service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

async function sendWebPush(fcmToken, pondName, alertContent) {
  if (!fcmToken) return;

  const message = {
    token: fcmToken,
    notification: {
      title: `⚠️ Cảnh báo khẩn cấp: ${pondName}`,
      body: alertContent
    },
    webpush: {
      notification: {
        icon: '/logo.png', // Thay bằng đường dẫn icon của bạn nếu có
        requireInteraction: true // Thông báo sẽ không tự biến mất cho đến khi user click
      }
    }
  };

  try {
    const response = await getMessaging().send(message);
    console.log(`🚀 [FCM] Gửi thông báo Web Push thành công tới: ${fcmToken.substring(0, 15)}... (MessageID: ${response})`);
  } catch (error) {
    console.error('❌ [FCM] Lỗi gửi thông báo Web Push:', error.message);
  }
}

module.exports = { sendWebPush };
