import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'screens/login_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
  ));
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
