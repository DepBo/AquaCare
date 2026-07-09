import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/admin_screen.dart';
import 'screens/staff_screen.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:firebase_core/firebase_core.dart';
import 'services/fcm_service.dart';

// Global key để có thể show SnackBar từ bất kỳ đâu (như từ trong file service)
final GlobalKey<ScaffoldMessengerState> scaffoldMessengerKey = GlobalKey<ScaffoldMessengerState>();

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp();
  FCMService.instance.initPushNotifications();

  await GoogleSignIn.instance.initialize(
    serverClientId:
        '184096169998-40s8fv9eg9jlhuhsqvlspsopai1k1rgn.apps.googleusercontent.com',
  );

  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );

  await Supabase.initialize(
    url: 'https://nwmeysspxfgqxtvxeuil.supabase.co',
    anonKey:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53bWV5c3NweGZncXh0dnhldWlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIwNTM4NSwiZXhwIjoyMDk3NzgxMzg1fQ.mZUzdQH9Hj7faBB9SuOYXYc4YEU5-ttmscbjEH_C5-I',
  );

  final prefs = await SharedPreferences.getInstance();
  final refreshToken = prefs.getString('refresh_token');
  final role = prefs.getString('role');
  Widget initialScreen = const LoginScreen();

  if (refreshToken != null && refreshToken.isNotEmpty) {
    try {
      await Supabase.instance.client.auth.setSession(refreshToken);
      debugPrint(
        '✅ [SUCCESS]: Khôi phục Supabase session từ main.dart thành công.',
      );
      
      // Đồng bộ FCM Token lên database sau khi đã đăng nhập
      await FCMService.instance.syncTokenToSupabase();

      if (role == 'admin') {
        initialScreen = const AdminScreen();
      } else if (role == 'staff') {
        initialScreen = const StaffScreen();
      } else {
        initialScreen = const DashboardScreen();
      }
    } catch (e) {
      debugPrint('❌ [ERROR]: Lỗi khôi phục session: $e');
    }
  }

  debugPrint('📱 App bắt đầu chạy. InitialScreen: $initialScreen');
  runApp(AquaCareApp(initialScreen: initialScreen));
}

class AquaCareApp extends StatelessWidget {
  final Widget initialScreen;
  const AquaCareApp({super.key, required this.initialScreen});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AquaCare',
      scaffoldMessengerKey: scaffoldMessengerKey,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme),
        scaffoldBackgroundColor: const Color(0xFF060E1A),
        colorScheme: ColorScheme.dark(
          primary: const Color(0xFF00A896),
          secondary: const Color(0xFF00E5A0),
          surface: const Color(0xFF0F1A30),
        ),
      ),
      home: initialScreen,
    );
  }
}
