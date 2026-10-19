import 'package:aquacare_app/widgets/tank_overview_hero.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/services.dart';

void main() {
  test('shield uses the same priority as the web overview', () {
    expect(
      tankShieldLevel([
        'Chưa có dữ liệu',
        'Chưa có dữ liệu',
        'Chưa có dữ liệu',
        'Chưa có dữ liệu',
      ]),
      TankShieldLevel.waiting,
    );
    expect(
      tankShieldLevel(['Tốt', 'Tốt', 'Tốt', 'Ổn định']),
      TankShieldLevel.safe,
    );
    expect(
      tankShieldLevel(['Tốt', 'Cảnh báo', 'Tốt', 'Ổn định']),
      TankShieldLevel.warning,
    );
    expect(
      tankShieldLevel(['Tốt', 'Tốt', 'Tốt', 'Chưa có dữ liệu']),
      TankShieldLevel.warning,
    );
    expect(
      tankShieldLevel(['Tốt', 'Nguy hiểm', 'Tốt', 'Ổn định']),
      TankShieldLevel.danger,
    );
    expect(
      tankShieldLevel(['Tốt', 'Tốt', 'Tốt', 'Cạn nước']),
      TankShieldLevel.danger,
    );
  });

  test('shield images are bundled with the mobile app', () async {
    for (final level in ['safe', 'warning', 'danger']) {
      final bytes = await rootBundle.load(
        'assets/images/status-shield-$level.png',
      );
      expect(bytes.lengthInBytes, greaterThan(0));
    }
  });

  test(
    'all nine pond photos are included in the Flutter asset bundle',
    () async {
      for (var index = 1; index <= 9; index++) {
        final bytes = await rootBundle.load(
          'assets/images/pond-fish$index.jpg',
        );
        expect(bytes.lengthInBytes, greaterThan(0));
      }
    },
  );

  Widget app({
    required double textScale,
    required VoidCallback onAdd,
    bool dark = false,
  }) => MaterialApp(
    theme: ThemeData.light(),
    darkTheme: ThemeData.dark(),
    themeMode: dark ? ThemeMode.dark : ThemeMode.light,
    home: Scaffold(
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Builder(
            builder: (context) => MediaQuery(
              data: MediaQuery.of(
                context,
              ).copyWith(textScaler: TextScaler.linear(textScale)),
              child: TankOverviewHero(
                title: 'Hồ cá đang ổn định',
                subtitle: 'Cả 4 chỉ số trong ngưỡng tốt',
                shieldLevel: TankShieldLevel.safe,
                onAddTank: onAdd,
              ),
            ),
          ),
        ),
      ),
    ),
  );

  testWidgets('add tank button follows light and dark theme', (tester) async {
    for (final dark in [false, true]) {
      await tester.pumpWidget(app(textScale: 1, onAdd: () {}, dark: dark));
      await tester.pumpAndSettle();
      final buttonMaterial = tester.widget<Material>(
        find
            .ancestor(of: find.text('Thêm bể'), matching: find.byType(Material))
            .first,
      );
      final label = tester.widget<Text>(find.text('Thêm bể'));
      final avatar = tester.widget<CircleAvatar>(find.byType(CircleAvatar));
      expect(
        buttonMaterial.color,
        dark ? Colors.white : const Color(0xFF111722),
      );
      expect(label.style!.color, dark ? const Color(0xFF111722) : Colors.white);
      expect(
        avatar.backgroundColor,
        dark ? const Color(0xFF111722) : Colors.white,
      );
      expect(tester.takeException(), isNull);
    }
    await tester.pumpWidget(const SizedBox.shrink());
  });

  for (final width in [280.0, 320.0, 360.0, 390.0, 430.0, 600.0]) {
    for (final scale in [1.0, 1.5, 2.0]) {
      testWidgets('hero fits width $width and text scale $scale', (
        tester,
      ) async {
        await tester.binding.setSurfaceSize(Size(width, 850));
        addTearDown(() => tester.binding.setSurfaceSize(null));
        var added = 0;
        await tester.pumpWidget(app(textScale: scale, onAdd: () => added++));
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);

        final hero = tester.getRect(find.byType(TankOverviewHero));
        final button = tester.getRect(
          find.ancestor(
            of: find.text('Thêm bể'),
            matching: find.byType(InkWell),
          ),
        );
        final description = tester.getRect(
          find.text('Cả 4 chỉ số trong ngưỡng tốt'),
        );
        final title = tester.getRect(find.text('Hồ cá đang ổn định'));
        final shield = tester.getRect(
          find.byWidgetPredicate(
            (widget) =>
                widget is Semantics &&
                widget.properties.label == 'Khiên xanh: an toàn',
          ),
        );
        expect(hero.contains(button.topLeft), isTrue);
        expect(hero.contains(button.bottomRight), isTrue);
        expect(title.top, greaterThan(shield.bottom));
        expect(hero.contains(description.bottomRight), isTrue);
        expect(hero.bottom - description.bottom, closeTo(18, 2));
        expect(title.overlaps(button), isFalse);
        expect(description.overlaps(button), isFalse);

        final clip = tester.widget<ClipPath>(
          find
              .descendant(
                of: find.byType(TankOverviewHero),
                matching: find.byType(ClipPath),
              )
              .first,
        );
        final path = clip.clipper!.getClip(hero.size);
        // The photo must be absent beneath the button, including its left end.
        for (final point in [
          button.center,
          button.centerLeft,
          button.topCenter,
          button.bottomCenter,
        ]) {
          expect(path.contains(point - hero.topLeft), isFalse);
        }
        expect(path.contains(const Offset(40, 40)), isTrue);
        await tester.tap(find.text('Thêm bể'));
        expect(added, 1);
        await tester.pumpWidget(const SizedBox.shrink());
      });
    }
  }

  testWidgets('slideshow cycles nine photos and disposes its timer', (
    tester,
  ) async {
    await tester.pumpWidget(app(textScale: 1, onAdd: () {}));
    final context = tester.element(find.byType(TankOverviewHero));
    await tester.runAsync(() async {
      for (var i = 1; i <= 9; i++) {
        await precacheImage(
          AssetImage('assets/images/pond-fish$i.jpg'),
          context,
        );
      }
    });
    await tester.pump();
    for (var index = 1; index <= 9; index++) {
      await tester.pump(const Duration(seconds: 30));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 1400));
      final photo = find.byWidgetPredicate(
        (widget) =>
            widget is Image &&
            widget.image is AssetImage &&
            (widget.image as AssetImage).assetName ==
                'assets/images/pond-fish${index % 9 + 1}.jpg',
      );
      expect(photo, findsOneWidget);
      final rawPhoto = find.descendant(
        of: photo,
        matching: find.byType(RawImage),
      );
      expect(tester.widget<RawImage>(rawPhoto).image, isNotNull);
      expect(
        tester.getSize(rawPhoto),
        tester.getSize(find.byType(TankOverviewHero)),
      );
    }
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pump(const Duration(seconds: 30));
    expect(tester.takeException(), isNull);
  });
}
