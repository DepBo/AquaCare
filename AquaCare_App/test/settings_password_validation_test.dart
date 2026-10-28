import 'package:aquacare_app/screens/settings_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('mobile settings rejects invalid password changes before network access', (tester) async {
    GoogleFonts.config.allowRuntimeFetching = false;
    SharedPreferences.setMockInitialValues({
      'user_info': '{"email":"qa@example.test","full_name":"QA User"}',
    });
    PackageInfo.setMockInitialValues(
      appName: 'AquaCare', packageName: 'com.example.aquacare',
      version: '1.0.6', buildNumber: '7', buildSignature: '',
    );
    await tester.binding.setSurfaceSize(const Size(393, 852));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(const MaterialApp(home: SettingsScreen()));
    await tester.pumpAndSettle();
    await tester.ensureVisible(find.text('Đổi mật khẩu'));
    await tester.tap(find.text('Đổi mật khẩu'));
    await tester.pumpAndSettle();

    await tester.tap(find.text('Lưu mật khẩu'));
    await tester.pump();
    expect(find.text('Vui lòng nhập đầy đủ các trường.'), findsOneWidget);

    final fields = find.byType(TextField);
    expect(fields, findsNWidgets(3));
    await tester.enterText(fields.at(0), 'current123');
    await tester.enterText(fields.at(1), '123');
    await tester.enterText(fields.at(2), '123');
    await tester.tap(find.text('Lưu mật khẩu'));
    await tester.pump();
    expect(find.text('Mật khẩu mới phải có ít nhất 6 ký tự.'), findsOneWidget);

    await tester.enterText(fields.at(1), 'current123');
    await tester.enterText(fields.at(2), 'current123');
    await tester.tap(find.text('Lưu mật khẩu'));
    await tester.pump();
    expect(find.text('Mật khẩu mới không được trùng với mật khẩu hiện tại.'), findsOneWidget);
  });
}
