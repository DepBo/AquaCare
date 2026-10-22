import 'package:aquacare_app/widgets/admin_revenue_panels.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_svg/flutter_svg.dart';

void main() {
  String money(dynamic value) => '${(value as num).round()} đ';
  final months = List.generate(
    12,
    (i) => <String, dynamic>{
      'month': i + 1,
      'revenue': 10000000000 + i * 1000000,
      'movingAverage': i < 2 ? null : 10000000000 + (i - 1) * 1000000,
      'growthPercent': i == 0 ? null : 123.45,
    },
  );

  for (final width in [280.0, 320.0, 390.0, 600.0]) {
    for (final dark in [false, true]) {
      testWidgets('revenue panels fit width $width dark=$dark at large text', (
        tester,
      ) async {
        await tester.binding.setSurfaceSize(Size(width, 900));
        addTearDown(() => tester.binding.setSurfaceSize(null));
        var selectedYear = 2025;
        var selectedMonth = 11;
        await tester.pumpWidget(
          MaterialApp(
            theme: dark ? ThemeData.dark() : ThemeData.light(),
            builder: (context, child) => MediaQuery(
              data: MediaQuery.of(
                context,
              ).copyWith(textScaler: TextScaler.linear(1.5)),
              child: child!,
            ),
            home: Scaffold(
              body: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      RevenueTrendPanel(
                        dark: dark,
                        months: months,
                        year: 2025,
                        years: const [2024, 2025],
                        onYearChanged: (value) => selectedYear = value,
                        money: money,
                      ),
                      VersionRevenuePanel(
                        dark: dark,
                        versions: const {
                          'V1': 1000000000,
                          'V2': 2000000000,
                          'V3': 4000000000,
                          'V4': 3000000000,
                        },
                        month: 11,
                        year: 2025,
                        months: const [0, 11],
                        years: const [2024, 2025],
                        onMonthChanged: (value) => selectedMonth = value,
                        onYearChanged: (value) => selectedYear = value,
                        money: money,
                      ),
                      RevenueHighlightsPanel(
                        dark: dark,
                        year: 2025,
                        highlights: const {
                          'peakMonthlyRevenue': 100000000000,
                          'peakMonth': 12,
                          'maxGrowthPercent': 123.45,
                          'maxDeclinePercent': -99.99,
                        },
                        money: money,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        );
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
        expect(find.byType(SvgPicture), findsWidgets);
        expect(
          tester
              .widgetList<Scrollable>(find.byType(Scrollable))
              .where(
                (s) =>
                    s.axisDirection == AxisDirection.right ||
                    s.axisDirection == AxisDirection.left,
              ),
          isEmpty,
        );

        await tester.tap(find.text('Năm 2025').first);
        await tester.pumpAndSettle();
        await tester.tap(find.text('Năm 2024').last);
        await tester.pumpAndSettle();
        expect(selectedYear, 2024);

        await tester.ensureVisible(find.text('T3'));
        await tester.tap(find.text('T3'));
        await tester.pumpAndSettle();
        expect(find.text('Trung bình động 3 tháng'), findsOneWidget);
        expect(
          find.descendant(
            of: find.byKey(const ValueKey('2025-3')),
            matching: find.text(money(months[2]['movingAverage'])),
          ),
          findsOneWidget,
        );
        expect(tester.takeException(), isNull);

        await tester.ensureVisible(find.text('Tháng 12').first);
        await tester.tap(find.text('Tháng 12').first);
        await tester.pumpAndSettle();
        await tester.tap(find.text('Tháng 1').last);
        await tester.pumpAndSettle();
        expect(selectedMonth, 0);
        await tester.ensureVisible(find.text('Giảm mạnh nhất'));
        await tester.pumpAndSettle();
        expect(tester.takeException(), isNull);
      });
    }
  }

  testWidgets(
    'missing months and empty revenue render without invented values',
    (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: SingleChildScrollView(
              child: Column(
                children: [
                  RevenueTrendPanel(
                    dark: false,
                    months: [
                      for (var i = 1; i <= 12; i++)
                        {
                          'month': i,
                          'revenue': null,
                          'movingAverage': null,
                          'growthPercent': null,
                        },
                    ],
                    year: 2026,
                    years: const [2026],
                    onYearChanged: (_) {},
                    money: money,
                  ),
                  VersionRevenuePanel(
                    dark: false,
                    versions: const {},
                    month: 0,
                    year: 2026,
                    months: const [],
                    years: const [2026],
                    onMonthChanged: (_) {},
                    onYearChanged: (_) {},
                    money: money,
                  ),
                ],
              ),
            ),
          ),
        ),
      );
      await tester.pumpAndSettle();
      expect(tester.takeException(), isNull);
      expect(find.textContaining('Cao nhất'), findsNothing);
      await tester.ensureVisible(find.text('T1'));
      await tester.tap(find.text('T1'));
      await tester.pumpAndSettle();
      expect(find.text('Trung bình động 3 tháng'), findsOneWidget);
      expect(tester.takeException(), isNull);
    },
  );
}
