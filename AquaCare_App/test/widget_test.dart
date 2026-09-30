import 'dart:convert';

import 'package:aquacare_app/customer_theme.dart';
import 'package:aquacare_app/screens/dashboard_screen.dart';
import 'package:aquacare_app/services/supabase_service.dart';
import 'package:aquacare_app/widgets/floating_role_nav.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('customer theme is restored after switching to light mode', () async {
    SharedPreferences.setMockInitialValues({});
    await CustomerTheme.load();
    expect(CustomerTheme.mode.value, ThemeMode.dark);
    expect(CustomerColors.background, const Color(0xFF141414));
    expect(CustomerColors.accentText, const Color(0xFF00A896));
    expect(CustomerColors.waterText, const Color(0xFF4DA6FF));

    await CustomerTheme.toggle();
    expect(CustomerTheme.mode.value, ThemeMode.light);
    expect(CustomerColors.background, const Color(0xFFE9EEF3));
    expect(CustomerColors.accentText, const Color(0xFF00A896));
    expect(CustomerColors.waterText, const Color(0xFF4DA6FF));

    CustomerTheme.mode.value = ThemeMode.dark;
    await CustomerTheme.load();
    expect(CustomerTheme.mode.value, ThemeMode.light);
  });

  testWidgets('overview sensor card renders its SVG at phone width', (
    tester,
  ) async {
    GoogleFonts.config.allowRuntimeFetching = false;
    CustomerTheme.mode.value = ThemeMode.dark;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Center(
            child: SizedBox(
              width: 138,
              height: 150,
              child: SensorCard(
                sensor: SensorData(
                  name: 'pH',
                  unit: '',
                  value: 7.2,
                  color: const Color(0xFF00A896),
                  icon: Icons.water_drop,
                  status: 'Tốt',
                  history: const [7.0, 7.1, 7.2],
                ),
              ),
            ),
          ),
        ),
      ),
    );

    expect(find.byType(SvgPicture), findsOneWidget);
    expect(
      find.byWidgetPredicate(
        (widget) =>
            widget is RichText && widget.text.toPlainText().contains('7.20'),
      ),
      findsOneWidget,
    );
    expect(tester.takeException(), isNull);
  });

  test('aquarium hero image is bundled', () async {
    final image = await rootBundle.load('assets/images/overview_aquarium.png');
    expect(image.lengthInBytes, greaterThan(0));
  });

  test(
    'sensor status follows web thresholds and missing data stays unknown',
    () {
      expect(sensorStatus('pH', 7.2), 'Tốt');
      expect(sensorStatus('pH', 7.8), 'Cảnh báo');
      expect(sensorStatus('pH', 8.3), 'Nguy hiểm');
      expect(sensorStatus('Nhiệt độ', 31), 'Nguy hiểm');
      expect(sensorStatus('TDS', 125), 'Cảnh báo');
      expect(sensorStatus('Mực nước', 0), 'Cạn nước');
      final empty = sensorsFromTelemetry([]);
      expect(empty.every((sensor) => !sensor.hasData), isTrue);
      expect(
        empty.every((sensor) => sensor.status == 'Chưa có dữ liệu'),
        isTrue,
      );
      final readings = sensorsFromTelemetry([
        {'ph': 8.3, 'temp': 26, 'tds': 125, 'water_level_ok': false},
      ]);
      expect(readings.map((sensor) => sensor.status), [
        'Nguy hiểm',
        'Tốt',
        'Cảnh báo',
        'Cạn nước',
      ]);
    },
  );

  test(
    'tank creation persists a numeric ID and deletion is owner scoped',
    () async {
      final requests = <http.Request>[];
      final client = SupabaseClient(
        'https://example.supabase.co',
        'test-anon-key',
        httpClient: MockClient((request) async {
          requests.add(request);
          if (request.method == 'POST' && request.url.path.endsWith('/tanks')) {
            return http.Response(
              jsonEncode({'id': 42, 'tank_name': 'Bể Koi'}),
              201,
              headers: {'content-type': 'application/json'},
              request: request,
            );
          }
          if (request.method == 'GET' &&
              request.url.path.endsWith('/devices')) {
            return http.Response(
              '[{"id":3}]',
              200,
              headers: {'content-type': 'application/json'},
              request: request,
            );
          }
          if (request.method == 'PATCH' &&
              request.url.path.endsWith('/devices')) {
            return http.Response('', 204, request: request);
          }
          if (request.method == 'DELETE' &&
              request.url.path.endsWith('/tanks')) {
            return http.Response(
              jsonEncode({'id': 42}),
              200,
              headers: {'content-type': 'application/json'},
              request: request,
            );
          }
          throw StateError(
            'Unexpected request: ${request.method} ${request.url}',
          );
        }),
      );
      addTearDown(client.dispose);
      final service = SupabaseService.forTesting(client);

      final created = await service.createTank(
        userId: 'owner-1',
        name: ' Bể Koi ',
      );
      expect(created['id'], 42);
      expect(jsonDecode(requests.first.body)['tank_name'], 'Bể Koi');
      expect(await service.deleteTank(userId: 'owner-1', tankId: '42'), isTrue);
      final deletion = requests.firstWhere(
        (request) => request.method == 'DELETE',
      );
      expect(deletion.url.queryParameters['id'], 'eq.42');
      expect(deletion.url.queryParameters['user_id'], 'eq.owner-1');
      final cleanup = requests.last;
      expect(jsonDecode(cleanup.body)['is_active'], isFalse);
      expect(cleanup.url.queryParameters['tank_id'], 'is.null');
    },
  );

  testWidgets('floating role navigation fits a narrow phone and keeps badges', (
    tester,
  ) async {
    tester.view.physicalSize = const Size(320, 640);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    var selected = -1;

    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Align(
            alignment: Alignment.bottomCenter,
            child: FloatingRoleNav(
              isDark: true,
              selectedIndex: 0,
              items: List.generate(
                5,
                (index) => FloatingRoleNavItem(
                  label: 'Tab $index',
                  symbol: const [
                    'fish',
                    'device',
                    'staff',
                    'cart',
                    'layers',
                  ][index],
                  badgeCount: index == 4 ? 12 : 0,
                  onTap: () => selected = index,
                ),
              ),
            ),
          ),
        ),
      ),
    );

    expect(find.byType(SvgPicture), findsNWidgets(5));
    expect(find.text('12'), findsOneWidget);
    await tester.tap(find.byType(InkWell).last);
    expect(selected, 4);
    expect(tester.takeException(), isNull);
  });
}
