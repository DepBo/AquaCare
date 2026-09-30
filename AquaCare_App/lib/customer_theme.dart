import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Presentation state for the customer area. No account or device data is changed.
class CustomerTheme {
  static const _storageKey = 'customer_theme_mode';
  static final mode = ValueNotifier<ThemeMode>(ThemeMode.dark);

  static ThemeData get data {
    final isDark = mode.value == ThemeMode.dark;
    return ThemeData(
      brightness: isDark ? Brightness.dark : Brightness.light,
      textTheme: GoogleFonts.interTextTheme(
        isDark ? ThemeData.dark().textTheme : ThemeData.light().textTheme,
      ),
      scaffoldBackgroundColor: CustomerColors.background,
      colorScheme: isDark
          ? const ColorScheme.dark(
              primary: Color(0xFF82C4E1),
              secondary: Color(0xFF5BD0B3),
              surface: Color(0xFF1F1F1F),
            )
          : const ColorScheme.light(
              primary: Color(0xFF0369A1),
              secondary: Color(0xFF00796F),
              surface: Color(0xFFF7F9FB),
            ),
    );
  }

  static Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    mode.value = prefs.getString(_storageKey) == 'light'
        ? ThemeMode.light
        : ThemeMode.dark;
  }

  static Future<void> toggle() async {
    mode.value = mode.value == ThemeMode.dark
        ? ThemeMode.light
        : ThemeMode.dark;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      _storageKey,
      mode.value == ThemeMode.dark ? 'dark' : 'light',
    );
  }
}

class CustomerColors {
  static bool get dark => CustomerTheme.mode.value == ThemeMode.dark;

  static Color get background =>
      dark ? const Color(0xFF141414) : const Color(0xFFE9EEF3);
  static Color get backgroundMid =>
      dark ? const Color(0xFF181818) : const Color(0xFFE7EDF2);
  static Color get backgroundEnd =>
      dark ? const Color(0xFF1A1A1A) : const Color(0xFFDFE8EF);
  static Color get card =>
      dark ? const Color(0xFF1F1F1F) : const Color(0xFFF7F9FB);
  static Color get subtle =>
      dark ? const Color(0xFF28282B) : const Color(0xFFE7EDF3);
  static Color get text =>
      dark ? const Color(0xFFF4F4F5) : const Color(0xFF0F172A);
  static Color get secondaryText =>
      dark ? const Color(0xFFA1A1AA) : const Color(0xFF334155);
  static Color get mutedText =>
      dark ? const Color(0xFF71717A) : const Color(0xFF475569);
  static Color get border =>
      dark ? const Color(0xFF333333) : const Color(0xFFC4D0DB);
  static Color get accentText => const Color(0xFF00A896);
  static Color get waterText => const Color(0xFF4DA6FF);

  static Color readableForeground(Color color) {
    if (dark) return color;
    if (color == const Color(0xFF00A896)) return const Color(0xFF078174);
    if (color == const Color(0xFFFF8C42)) return const Color(0xFFA6470A);
    if (color == const Color(0xFFC77DFF)) return const Color(0xFF7738A7);
    if (color == const Color(0xFF4DA6FF)) return const Color(0xFF1877A8);
    if (color == const Color(0xFFFF6B6B)) return const Color(0xFFB42318);
    if (color == const Color(0xFFFFB347)) return const Color(0xFF995300);
    return color;
  }
}

Future<T?> showCustomerDialog<T>({
  required BuildContext context,
  required WidgetBuilder builder,
  Color? barrierColor,
}) {
  return showDialog<T>(
    context: context,
    barrierColor: barrierColor,
    builder: (dialogContext) =>
        Theme(data: CustomerTheme.data, child: builder(dialogContext)),
  );
}
