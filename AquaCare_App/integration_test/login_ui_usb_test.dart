import 'package:aquacare_app/screens/login_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('USB phone: login screen displays and validates locally', (
    tester,
  ) async {
    const isolated = bool.fromEnvironment('AQUACARE_TEST_MODE');
    expect(isolated, isTrue, reason: 'Run only with the isolated test script.');

    GoogleFonts.config.allowRuntimeFetching = true;
    SharedPreferences.setMockInitialValues({'remember_login': true});
    await tester.pumpWidget(const MaterialApp(home: LoginScreen()));
    await tester.pumpAndSettle();

    expect(find.text('ĐĂNG NHẬP'), findsWidgets);
    expect(find.text('Ghi nhớ đăng nhập'), findsOneWidget);
    expect(find.byType(TextFormField), findsNWidgets(2));

    await tester.tap(find.text('ĐĂNG NHẬP').last);
    await tester.pumpAndSettle();
    expect(find.text('Vui lòng nhập email'), findsOneWidget);
  });
}
