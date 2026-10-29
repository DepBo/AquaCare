import 'package:aquacare_app/screens/app_version_gate.dart';
import 'package:aquacare_app/services/app_version_service.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('minimum build blocks only older installations', () {
    const manifest = '{"minimumBuildNumber":4,"latestVersion":"1.0.3"}';
    expect(AppVersionService.fromManifest(manifest, 3).updateRequired, isTrue);
    expect(AppVersionService.fromManifest(manifest, 4).updateRequired, isFalse);
    expect(AppVersionService.fromManifest(manifest, 5).updateRequired, isFalse);
    expect(
      () => AppVersionService.fromManifest('<html>error</html>', 3),
      throwsFormatException,
    );
  });

  test('invalid or incomplete version manifests fail closed', () {
    for (final body in [
      '{}',
      '{"minimumBuildNumber":0,"latestVersion":"1.0.7"}',
      '{"minimumBuildNumber":"8","latestVersion":"1.0.7"}',
      '{"minimumBuildNumber":8,"latestVersion":""}',
      'not json',
    ]) {
      expect(
        () => AppVersionService.fromManifest(body, 7),
        throwsFormatException,
        reason: body,
      );
    }
  });

  testWidgets('old build cannot reach app content', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: AppVersionGate(
          checkVersion: () async => const AppVersionResult(
            updateRequired: true,
            latestVersion: '1.0.3',
          ),
          destination: const Text('Private app content'),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Đã có phiên bản AquaCare mới'), findsOneWidget);
    expect(find.text('Cập nhật ngay'), findsOneWidget);
    expect(find.text('Private app content'), findsNothing);
  });

  testWidgets('current build opens app', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: AppVersionGate(
          checkVersion: () async =>
              const AppVersionResult(updateRequired: false),
          destination: const Text('Private app content'),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Private app content'), findsOneWidget);
  });

  testWidgets('returning to app enforces a newly raised minimum build', (
    tester,
  ) async {
    var checks = 0;
    await tester.pumpWidget(
      MaterialApp(
        home: AppVersionGate(
          checkVersion: () async => AppVersionResult(
            updateRequired: ++checks > 1,
            latestVersion: '1.0.3',
          ),
          destination: const Text('Private app content'),
        ),
      ),
    );
    await tester.pumpAndSettle();
    expect(find.text('Private app content'), findsOneWidget);

    tester.binding.handleAppLifecycleStateChanged(AppLifecycleState.resumed);
    await tester.pumpAndSettle();
    expect(find.text('Private app content'), findsNothing);
    expect(find.text('Cập nhật ngay'), findsOneWidget);
  });

  testWidgets('failed check blocks app until retry succeeds', (tester) async {
    var attempts = 0;
    await tester.pumpWidget(
      MaterialApp(
        home: AppVersionGate(
          checkVersion: () async {
            if (++attempts == 1) throw Exception('offline');
            return const AppVersionResult(updateRequired: false);
          },
          destination: const Text('Private app content'),
        ),
      ),
    );
    await tester.pumpAndSettle();

    expect(find.text('Thử lại'), findsOneWidget);
    expect(find.text('Private app content'), findsNothing);
    await tester.tap(find.text('Thử lại'));
    await tester.pumpAndSettle();
    expect(find.text('Private app content'), findsOneWidget);
  });
}
