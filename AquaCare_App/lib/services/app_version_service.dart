import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:package_info_plus/package_info_plus.dart';

const appDownloadPage = 'https://aqua-care2.vercel.app/';
const _versionManifest =
    '$appDownloadPage'
    'app-version.json';
const _debugManifest = String.fromEnvironment('AQUACARE_VERSION_URL');

class AppVersionResult {
  const AppVersionResult({required this.updateRequired, this.latestVersion});

  final bool updateRequired;
  final String? latestVersion;
}

class AppVersionService {
  static AppVersionResult fromManifest(String body, int installedBuild) {
    final json = jsonDecode(body);
    if (json is! Map<String, dynamic> ||
        json['minimumBuildNumber'] is! int ||
        (json['minimumBuildNumber'] as int) < 1 ||
        json['latestVersion'] is! String ||
        (json['latestVersion'] as String).isEmpty) {
      throw const FormatException('Thông tin phiên bản không hợp lệ');
    }
    return AppVersionResult(
      updateRequired: installedBuild < json['minimumBuildNumber'],
      latestVersion: json['latestVersion'] as String,
    );
  }

  static Future<AppVersionResult> check() async {
    if (kIsWeb || defaultTargetPlatform != TargetPlatform.android) {
      return const AppVersionResult(updateRequired: false);
    }
    // Local development does not depend on whether the next manifest has been deployed.
    if (kDebugMode && _debugManifest.isEmpty) {
      return const AppVersionResult(updateRequired: false);
    }

    final package = await PackageInfo.fromPlatform();
    final installedBuild = int.tryParse(package.buildNumber);
    if (installedBuild == null) {
      throw const FormatException('Không đọc được số bản dựng của ứng dụng');
    }

    final uri = Uri.parse(kDebugMode ? _debugManifest : _versionManifest)
        .replace(
          queryParameters: {
            't': DateTime.now().millisecondsSinceEpoch.toString(),
          },
        );
    final response = await http.get(uri).timeout(const Duration(seconds: 10));
    if (response.statusCode != 200) {
      throw Exception(
        'Không tải được thông tin phiên bản (${response.statusCode})',
      );
    }
    return fromManifest(response.body, installedBuild);
  }
}
