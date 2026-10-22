import 'package:flutter/foundation.dart';

class ApiConfig {
  static const _production = 'https://aquacare-p78r.onrender.com';
  static const _debugOverride = String.fromEnvironment('AQUACARE_API_URL');

  static String get baseUrl {
    if (!kDebugMode) return _production;
    if (_debugOverride.isNotEmpty) return _debugOverride.replaceAll(RegExp(r'/$'), '');
    if (kIsWeb) return 'http://localhost:5000';
    if (defaultTargetPlatform == TargetPlatform.android) return 'http://10.0.2.2:5000';
    return 'http://localhost:5000';
  }
}
