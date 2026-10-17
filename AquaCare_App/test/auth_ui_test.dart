import 'package:aquacare_app/screens/login_screen.dart';
import 'package:aquacare_app/screens/signup_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  for (final size in [
    const Size(320, 480),
    const Size(320, 568),
    const Size(360, 640),
    const Size(393, 852),
    const Size(430, 932),
  ]) {
    testWidgets('auth actions are visible without scrolling at $size', (
      tester,
    ) async {
      GoogleFonts.config.allowRuntimeFetching = false;
      SharedPreferences.setMockInitialValues({'remember_login': true});
      await tester.binding.setSurfaceSize(size);
      addTearDown(() => tester.binding.setSurfaceSize(null));

      await tester.pumpWidget(const MaterialApp(home: LoginScreen()));
      await tester.pumpAndSettle();
      final registerLink = find.textContaining(
        'Chưa có tài khoản?',
        findRichText: true,
      );
      expect(
        tester.getRect(registerLink).bottom,
        lessThanOrEqualTo(size.height),
      );
      expect(
        tester
            .state<ScrollableState>(find.byType(Scrollable).first)
            .position
            .maxScrollExtent,
        0,
      );
      expect(tester.takeException(), isNull);

      await tester.tap(registerLink);
      await tester.pumpAndSettle();
      for (final label in ['TẠO TÀI KHOẢN', 'Đăng ký bằng Google']) {
        final button = find.text(label);
        expect(button, findsOneWidget);
        expect(tester.getRect(button).bottom, lessThanOrEqualTo(size.height));
      }
      final loginLink = find.textContaining(
        'Đã có tài khoản?',
        findRichText: true,
      );
      expect(tester.getRect(loginLink).bottom, lessThanOrEqualTo(size.height));
      expect(tester.takeException(), isNull);
    });
  }

  testWidgets('login and register keep their controls on a compact phone', (
    tester,
  ) async {
    GoogleFonts.config.allowRuntimeFetching = false;
    SharedPreferences.setMockInitialValues({'remember_login': true});
    await tester.binding.setSurfaceSize(const Size(320, 640));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(const MaterialApp(home: LoginScreen()));
    await tester.pumpAndSettle();

    expect(find.text('Chào mừng trở lại'), findsOneWidget);
    expect(find.text('Ghi nhớ đăng nhập'), findsOneWidget);
    expect(tester.widget<Checkbox>(find.byType(Checkbox)).value, isTrue);
    await tester.tap(find.text('Ghi nhớ đăng nhập'));
    await tester.pump();
    expect(tester.widget<Checkbox>(find.byType(Checkbox)).value, isFalse);
    expect(
      find.byWidgetPredicate(
        (widget) =>
            widget is CustomPaint && widget.painter is GoogleLogoPainter,
      ),
      findsOneWidget,
    );
    expect(tester.takeException(), isNull);

    final registerLink = find.textContaining(
      'Chưa có tài khoản?',
      findRichText: true,
    );
    expect(tester.getRect(registerLink).bottom, lessThanOrEqualTo(640));
    expect(
      tester
          .state<ScrollableState>(find.byType(Scrollable).first)
          .position
          .maxScrollExtent,
      0,
    );
    await tester.tap(registerLink);
    await tester.pumpAndSettle();

    expect(find.byType(SignupScreen), findsOneWidget);
    expect(find.text('Tạo tài khoản'), findsOneWidget);
    expect(find.text('SỐ ĐIỆN THOẠI'), findsOneWidget);
    expect(tester.takeException(), isNull);

    await tester.binding.handlePopRoute();
    await tester.pumpAndSettle();
    expect(find.text('Chào mừng trở lại'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
