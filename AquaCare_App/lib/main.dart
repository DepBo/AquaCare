import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/login_screen.dart';

import 'package:supabase_flutter/supabase_flutter.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));

  await Supabase.initialize(
    url: 'https://nwmeysspxfgqxtvxeuil.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53bWV5c3NweGZncXh0dnhldWlsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjIwNTM4NSwiZXhwIjoyMDk3NzgxMzg1fQ.mZUzdQH9Hj7faBB9SuOYXYc4YEU5-ttmscbjEH_C5-I',
  );

  runApp(const AquaCareApp());
}

class AquaCareApp extends StatelessWidget {
  const AquaCareApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AquaCare',
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
      home: const LoginScreen(),
    );
  }
}
