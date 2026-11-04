import 'package:aquacare_app/screens/login_screen.dart';
import 'package:aquacare_app/screens/dashboard_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:integration_test/integration_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  Future<void> openAddTank(WidgetTester tester) async {
    expect(const bool.fromEnvironment('AQUACARE_TEST_MODE'), isTrue);
    GoogleFonts.config.allowRuntimeFetching = true;
    await tester.pumpWidget(
      const MaterialApp(
        home: AddPondScreen(
          userId: 'qa-local',
          fishSpeciesList: [],
          loadOwnedMacs: false,
        ),
      ),
    );
    await tester.pumpAndSettle();
  }

  Future<void> fillTankName(WidgetTester tester) async {
    await tester.enterText(find.byType(TextFormField).first, 'Bể thử QA');
  }

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

  testWidgets('USB phone: password visibility can be toggled', (tester) async {
    expect(const bool.fromEnvironment('AQUACARE_TEST_MODE'), isTrue);
    GoogleFonts.config.allowRuntimeFetching = true;
    SharedPreferences.setMockInitialValues({'remember_login': true});
    await tester.pumpWidget(const MaterialApp(home: LoginScreen()));
    await tester.pumpAndSettle();

    final passwordField = find.byType(TextFormField).last;
    expect(
      tester
          .widget<EditableText>(
            find.descendant(
              of: passwordField,
              matching: find.byType(EditableText),
            ),
          )
          .obscureText,
      isTrue,
    );
    await tester.tap(find.byIcon(Icons.visibility_outlined).first);
    await tester.pumpAndSettle();
    expect(
      tester
          .widget<EditableText>(
            find.descendant(
              of: passwordField,
              matching: find.byType(EditableText),
            ),
          )
          .obscureText,
      isFalse,
    );
  });

  testWidgets(
    'USB phone: add tank validates name and opens fish and device steps',
    (tester) async {
      expect(const bool.fromEnvironment('AQUACARE_TEST_MODE'), isTrue);
      GoogleFonts.config.allowRuntimeFetching = true;
      await tester.pumpWidget(
        const MaterialApp(
          home: AddPondScreen(
            userId: 'qa-local',
            fishSpeciesList: [],
            loadOwnedMacs: false,
          ),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('1. Nhập thông tin bể'), findsOneWidget);
      await tester.tap(find.text('Tiếp tục'));
      await tester.pumpAndSettle();
      expect(find.text('Vui lòng nhập tên bể'), findsOneWidget);

      await tester.enterText(find.byType(TextFormField).at(0), 'Bể thử QA');
      await tester.enterText(find.byType(TextFormField).at(1), '250');
      await tester.tap(find.text('Tiếp tục'));
      await tester.pumpAndSettle();
      expect(find.text('2. Chọn loài cá'), findsOneWidget);

      await tester.tap(find.text('Tiếp tục'));
      await tester.pumpAndSettle();
      expect(find.text('3. Thêm thiết bị'), findsOneWidget);
      expect(find.text('Chưa gắn thiết bị'), findsOneWidget);
      await tester.tap(find.text('Quay lại'));
      await tester.pumpAndSettle();
      expect(find.text('2. Chọn loài cá'), findsOneWidget);
    },
  );

  testWidgets('USB phone: login requires a password', (tester) async {
    expect(const bool.fromEnvironment('AQUACARE_TEST_MODE'), isTrue);
    GoogleFonts.config.allowRuntimeFetching = true;
    SharedPreferences.setMockInitialValues({'remember_login': true});
    await tester.pumpWidget(const MaterialApp(home: LoginScreen()));
    await tester.pumpAndSettle();
    await tester.enterText(
      find.byType(TextFormField).first,
      'qa@aquacare.test',
    );
    await tester.tap(find.text('ĐĂNG NHẬP').last);
    await tester.pumpAndSettle();
    expect(find.text('Vui lòng nhập mật khẩu'), findsOneWidget);
  });

  testWidgets('USB phone: tank volume rejects letters', (tester) async {
    await openAddTank(tester);
    await fillTankName(tester);
    await tester.enterText(find.byType(TextFormField).last, 'abc');
    await tester.tap(find.text('Tiếp tục'));
    await tester.pumpAndSettle();
    expect(find.text('Thể tích phải là số lớn hơn 0'), findsOneWidget);
    expect(find.text('1. Nhập thông tin bể'), findsOneWidget);
  });

  testWidgets('USB phone: tank volume rejects zero', (tester) async {
    await openAddTank(tester);
    await fillTankName(tester);
    await tester.enterText(find.byType(TextFormField).last, '0');
    await tester.tap(find.text('Tiếp tục'));
    await tester.pumpAndSettle();
    expect(find.text('Thể tích phải là số lớn hơn 0'), findsOneWidget);
  });

  testWidgets('USB phone: tank volume can be left blank', (tester) async {
    await openAddTank(tester);
    await fillTankName(tester);
    await tester.tap(find.text('Tiếp tục'));
    await tester.pumpAndSettle();
    expect(find.text('2. Chọn loài cá'), findsOneWidget);
  });

  testWidgets('USB phone: fish species is optional', (tester) async {
    await openAddTank(tester);
    await fillTankName(tester);
    await tester.tap(find.text('Tiếp tục'));
    await tester.pumpAndSettle();
    expect(find.text('Không xác định'), findsOneWidget);
    await tester.tap(find.text('Tiếp tục'));
    await tester.pumpAndSettle();
    expect(find.text('3. Thêm thiết bị'), findsOneWidget);
  });

  testWidgets('USB phone: going back preserves tank name', (tester) async {
    await openAddTank(tester);
    await fillTankName(tester);
    await tester.tap(find.text('Tiếp tục'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Quay lại'));
    await tester.pumpAndSettle();
    expect(find.text('1. Nhập thông tin bể'), findsOneWidget);
    expect(find.text('Bể thử QA'), findsOneWidget);
  });

  testWidgets('USB phone: device step offers no-device choice', (tester) async {
    await openAddTank(tester);
    await fillTankName(tester);
    await tester.tap(find.text('Tiếp tục'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Tiếp tục'));
    await tester.pumpAndSettle();
    expect(find.text('Chưa gắn thiết bị'), findsOneWidget);
    expect(find.text('Tìm tên, phiên bản hoặc mã MAC'), findsOneWidget);
    expect(find.text('Thêm bể'), findsOneWidget);
  });
}
