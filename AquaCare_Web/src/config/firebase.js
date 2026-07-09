import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAP52HnVHgKRaTKB9abu-vbe7tmW6FBsSQ",
  authDomain: "aquacare-notification.firebaseapp.com",
  projectId: "aquacare-notification",
  storageBucket: "aquacare-notification.firebasestorage.app",
  messagingSenderId: "381615219662",
  appId: "1:381615219662:web:68849860c5234f2b18819f"
};

const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app);

// Hàm xin quyền và lấy FCM Token từ trình duyệt
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey: "BILeCNaJiIwxD3bfPKRkLzIPEcGyYfU8Y5KLxn2PLaAQjCOLm_XwJBRigeCki3jmK0-q7GIk7TluQLIksfbQfHg" });
      if (token) {
        console.log("🔥 FCM Token của trình duyệt:", token);
        return token;
      }
    } else {
      console.warn("❌ Người dùng từ chối cấp quyền thông báo.");
    }
  } catch (error) {
    console.error("❌ Lỗi lấy FCM Token:", error);
  }
  return null;
};
