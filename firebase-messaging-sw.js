importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAP52HnVHgKRaTKB9abu-vbe7tmW6FBsSQ",
  authDomain: "aquacare-notification.firebaseapp.com",
  projectId: "aquacare-notification",
  storageBucket: "aquacare-notification.firebasestorage.app",
  messagingSenderId: "381615219662",
  appId: "1:381615219662:web:68849860c5234f2b18819f"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Nhận thông báo chạy nền:', payload);
  // Không cần gọi self.registration.showNotification ở đây 
  // vì thư viện Firebase đã TỰ ĐỘNG hiển thị popup nếu payload chứa "notification".
});
