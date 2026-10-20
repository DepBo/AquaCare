import 'package:aquacare_app/screens/admin_screen.dart';
import 'package:aquacare_app/screens/alerts_screen.dart';
import 'package:aquacare_app/screens/control_screen.dart';
import 'package:aquacare_app/screens/dashboard_screen.dart';
import 'package:aquacare_app/widgets/floating_role_nav.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  Size phoneSize = const Size(800, 600);

  setUpAll(() async {
    GoogleFonts.config.allowRuntimeFetching = false;
    SharedPreferences.setMockInitialValues({});
    await Supabase.initialize(
      url: 'https://example.supabase.co',
      publishableKey: 'test-anon-key',
      debug: false,
      httpClient: MockClient((request) async {
        final body = request.url.path.contains('tank_notification_settings')
            ? 'null'
            : '[]';
        return http.Response(
          body,
          200,
          headers: {'content-type': 'application/json'},
          request: request,
        );
      }),
    );
  });

  Future<void> setPhoneSize(WidgetTester tester, Size size) async {
    phoneSize = size;
    await tester.binding.setSurfaceSize(size);
    addTearDown(() => tester.binding.setSurfaceSize(null));
  }

  Widget app(Widget home, {double textScale = 1}) => MaterialApp(
    builder: (context, child) => MediaQuery(
      data: MediaQuery.of(
        context,
      ).copyWith(size: phoneSize, textScaler: TextScaler.linear(textScale)),
      child: child!,
    ),
    home: home,
  );

  for (final size in [
    const Size(280, 640),
    const Size(320, 700),
    const Size(360, 780),
  ]) {
    testWidgets('pond notification settings fit $size with larger text', (
      tester,
    ) async {
      await setPhoneSize(tester, size);
      await tester.pumpWidget(
        app(
          Scaffold(
            body: Builder(
              builder: (context) => TextButton(
                onPressed: () => showDialog<void>(
                  context: context,
                  builder: (_) => PondSettingsDialog(
                    pond: Pond(id: '1', name: 'Bể cá Koi'),
                    fishSpeciesList: const [],
                    onSaved: () {},
                  ),
                ),
                child: const Text('Mở cấu hình'),
              ),
            ),
          ),
          textScale: 1.3,
        ),
      );
      await tester.tap(find.text('Mở cấu hình'));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      await tester.tap(find.text('Cài đặt cảnh báo'));
      await tester.pumpAndSettle();

      expect(find.text('Thông báo qua trình duyệt web'), findsOneWidget);
      expect(
        tester.getRect(find.text('Thông báo qua trình duyệt web')).right,
        lessThanOrEqualTo(size.width),
      );
      expect(tester.takeException(), isNull);
    });
  }

  for (final size in [
    const Size(280, 640),
    const Size(320, 700),
    const Size(360, 780),
    const Size(430, 900),
  ]) {
    testWidgets('all admin tabs fit $size', (tester) async {
      await setPhoneSize(tester, size);
      await tester.pumpWidget(app(const AdminScreen(), textScale: 1.2));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      final tabCount = tester
          .widget<FloatingRoleNav>(find.byType(FloatingRoleNav))
          .items
          .length;
      for (var index = 0; index < tabCount; index++) {
        tester
            .widget<FloatingRoleNav>(find.byType(FloatingRoleNav))
            .items[index]
            .onTap();
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull, reason: 'Admin tab $index');
        final addLabel = switch (index) {
          1 => 'Thêm cá',
          2 => 'Thêm TB',
          3 => 'Thêm NV',
          5 => 'Thêm gói',
          _ => null,
        };
        if (addLabel != null) {
          await tester.tap(find.text(addLabel));
          await tester.pumpAndSettle();
          expect(
            tester.takeException(),
            isNull,
            reason: 'Admin $addLabel dialog',
          );
          tester.state<NavigatorState>(find.byType(Navigator)).pop();
          await tester.pumpAndSettle();
        }
      }
    });

    testWidgets('all staff tabs fit $size', (tester) async {
      SharedPreferences.setMockInitialValues({
        'user_info': 'full_name=Test&role=staff',
      });
      await setPhoneSize(tester, size);
      await tester.pumpWidget(app(const StaffScreen(), textScale: 1.2));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      final tabCount = tester
          .widget<FloatingRoleNav>(find.byType(FloatingRoleNav))
          .items
          .length;
      for (var index = 0; index < tabCount; index++) {
        tester
            .widget<FloatingRoleNav>(find.byType(FloatingRoleNav))
            .items[index]
            .onTap();
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull, reason: 'Staff tab $index');
      }
    });
  }

  testWidgets('customer alert and control screens fit a narrow phone', (
    tester,
  ) async {
    await setPhoneSize(tester, const Size(320, 700));
    for (final screen in <Widget>[
      const AlertsScreen(tankId: ''),
      const ControlScreen(tankId: ''),
    ]) {
      await tester.pumpWidget(app(screen, textScale: 1.2));
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull, reason: '$screen');
    }
  });

  for (final size in [
    const Size(280, 640),
    const Size(320, 700),
    const Size(360, 780),
    const Size(430, 900),
  ]) {
    testWidgets('customer dashboard fits $size', (tester) async {
      SharedPreferences.setMockInitialValues({
        'hide_onboarding_v2': true,
        'user_info': '{"full_name":"Khách hàng"}',
      });
      await setPhoneSize(tester, size);
      await tester.pumpWidget(app(const DashboardScreen(), textScale: 1.2));
      await tester.pump(const Duration(seconds: 3));
      expect(tester.takeException(), isNull);
      for (final label in ['Cảm biến', 'Điều khiển', 'Cảnh báo']) {
        final navItem = find.byWidgetPredicate(
          (widget) => widget is Semantics && widget.properties.label == label,
        );
        tester
            .widget<InkWell>(
              find.descendant(of: navItem, matching: find.byType(InkWell)),
            )
            .onTap!();
        await tester.pump(const Duration(milliseconds: 300));
        expect(tester.takeException(), isNull, reason: 'Customer $label');
      }
    });
  }
}
