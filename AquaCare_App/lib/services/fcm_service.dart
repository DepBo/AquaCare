import 'package:flutter/material.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'supabase_service.dart';
import '../main.dart'; // Để dùng scaffoldMessengerKey

// Hàm chạy ngầm khi app ở background hoặc bị tắt
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint("Handling a background message: ${message.messageId}");
  // Firebase đã tự hiển thị thông báo nhờ payload 'notification' từ Backend
}

class FCMService {
  FCMService._privateConstructor();
  static final FCMService instance = FCMService._privateConstructor();

  static VoidCallback? onAlertReceived;

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  /// Xin quyền hiển thị thông báo
  Future<void> requestPermission() async {
    NotificationSettings settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );
    debugPrint('🔔 FCM Permission status: ${settings.authorizationStatus}');
  }

  /// Lấy FCM Token định danh thiết bị
  Future<String?> getFCMToken() async {
    try {
      String? token = await _messaging.getToken();
      debugPrint('🔥 Thiết bị FCM Token: $token');
      return token;
    } catch (e) {
      debugPrint('❌ Lỗi lấy FCM Token: $e');
      return null;
    }
  }

  /// Lấy Token và đồng bộ lên Supabase nếu user đã đăng nhập
  Future<void> syncTokenToSupabase() async {
    final user = Supabase.instance.client.auth.currentUser;
    if (user != null) {
      await requestPermission();
      String? token = await getFCMToken();
      if (token != null) {
        await SupabaseService.instance.updateFcmToken(user.id, token);
      }
    } else {
      debugPrint('⚠️ Không thể đồng bộ Token: User chưa đăng nhập');
    }
  }

  /// Khởi tạo lắng nghe sự kiện push notification
  void initPushNotifications() {
    // Đăng ký hàm chạy ngầm
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

    // Lắng nghe thông báo khi app đang mở (Foreground)
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      debugPrint('🔔 Đã nhận thông báo khi đang mở app: ${message.messageId}');
      
      if (onAlertReceived != null) {
        onAlertReceived!();
      }

      if (message.notification != null) {
        final title = message.notification?.title ?? 'Thông báo';
        final body = message.notification?.body ?? '';

        // Hiển thị SnackBar thông qua GlobalKey
        scaffoldMessengerKey.currentState?.showSnackBar(
          SnackBar(
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                const SizedBox(height: 4),
                Text(body, style: const TextStyle(fontSize: 13)),
              ],
            ),
            backgroundColor: const Color(0xFFB45309), // Màu cam sẫm, bớt chói hơn
            duration: const Duration(seconds: 5),
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    });
  }
}
