import 'package:aquacare_app/screens/login_screen.dart';
import 'package:aquacare_app/screens/signup_screen.dart';
import 'package:aquacare_app/screens/dashboard_screen.dart';
import 'package:aquacare_app/screens/admin_screen.dart';
import 'package:aquacare_app/widgets/floating_role_nav.dart';
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

  testWidgets('USB phone: admin sees the isolated species management screen', (tester) async {
    expect(const bool.fromEnvironment('AQUACARE_TEST_MODE'), isTrue);
    GoogleFonts.config.allowRuntimeFetching = true;
    await tester.pumpWidget(const MaterialApp(home: AdminScreen(isolatedTestPreview: true)));
    await tester.pumpAndSettle();
    expect(find.text('Quản trị AquaCare System'), findsOneWidget);
    expect(find.text('Thêm cá'), findsOneWidget);
    final nav = tester.widget<FloatingRoleNav>(find.byType(FloatingRoleNav));
    expect(nav.items.map((item) => item.label), containsAll(['Loài cá', 'Thiết bị']));
  });

  testWidgets('USB phone: staff sees the isolated work navigation', (tester) async {
    expect(const bool.fromEnvironment('AQUACARE_TEST_MODE'), isTrue);
    GoogleFonts.config.allowRuntimeFetching = true;
    await tester.pumpWidget(const MaterialApp(home: StaffScreen(isolatedTestPreview: true)));
    await tester.pumpAndSettle();
    expect(find.text('Nhân viên Kho'), findsOneWidget);
    expect(find.text('Không có đơn hàng cần đóng gói!'), findsOneWidget);
    final nav = tester.widget<FloatingRoleNav>(find.byType(FloatingRoleNav));
    expect(nav.items.map((item) => item.label), containsAll(['Đóng gói', 'Lịch sử']));
    nav.items.last.onTap();
    await tester.pumpAndSettle();
    expect(find.text('Chưa có lịch sử công việc hoàn thành'), findsOneWidget);
  });

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

  Future<void> openSignup(WidgetTester tester) async {
    expect(const bool.fromEnvironment('AQUACARE_TEST_MODE'), isTrue);
    GoogleFonts.config.allowRuntimeFetching = true;
    await tester.pumpWidget(const MaterialApp(home: SignupScreen()));
    await tester.pumpAndSettle();
  }

  testWidgets('USB phone: signup requires a customer name', (tester) async {
    await openSignup(tester);
    await tester.tap(find.text('TẠO TÀI KHOẢN'));
    await tester.pumpAndSettle();
    expect(find.text('Vui lòng nhập họ tên'), findsOneWidget);
  });

  testWidgets('USB phone: signup rejects an invalid email', (tester) async {
    await openSignup(tester);
    await tester.enterText(find.byType(TextFormField).at(0), 'Khách QA');
    await tester.enterText(find.byType(TextFormField).at(1), 'email-sai');
    await tester.tap(find.text('TẠO TÀI KHOẢN'));
    await tester.pumpAndSettle();
    expect(find.text('Email không hợp lệ'), findsOneWidget);
  });

  testWidgets('USB phone: signup rejects a short password', (tester) async {
    await openSignup(tester);
    await tester.enterText(find.byType(TextFormField).at(3), '123');
    await tester.tap(find.text('TẠO TÀI KHOẢN'));
    await tester.pumpAndSettle();
    expect(find.text('Mật khẩu ít nhất 6 ký tự'), findsOneWidget);
  });

  testWidgets('USB phone: signup rejects mismatched passwords', (tester) async {
    await openSignup(tester);
    await tester.enterText(find.byType(TextFormField).at(3), 'Pass1234');
    await tester.enterText(find.byType(TextFormField).at(4), 'Pass9999');
    await tester.tap(find.text('TẠO TÀI KHOẢN'));
    await tester.pumpAndSettle();
    expect(find.text('Mật khẩu không khớp'), findsOneWidget);
  });

  testWidgets('USB phone: password recovery rejects an invalid email', (tester) async {
    expect(const bool.fromEnvironment('AQUACARE_TEST_MODE'), isTrue);
    GoogleFonts.config.allowRuntimeFetching = true;
    await tester.pumpWidget(const MaterialApp(home: ForgotPasswordScreen()));
    await tester.pumpAndSettle();
    await tester.enterText(find.byType(TextFormField), 'email-sai');
    await tester.tap(find.text('GỬI LINK ĐẶT LẠI'));
    await tester.pumpAndSettle();
    expect(find.text('Email không hợp lệ'), findsOneWidget);
  });

  testWidgets('USB phone: admin opens the add species form', (tester) async {
    expect(const bool.fromEnvironment('AQUACARE_TEST_MODE'), isTrue);
    GoogleFonts.config.allowRuntimeFetching = true;
    await tester.pumpWidget(const MaterialApp(home: AdminScreen(isolatedTestPreview: true)));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Thêm cá'));
    await tester.pumpAndSettle();
    expect(find.text('Thêm loài cá mới'), findsOneWidget);
    expect(find.text('Tên loài cá'), findsOneWidget);
  });
}
