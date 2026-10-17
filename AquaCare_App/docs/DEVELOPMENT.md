# Development Guide

## Prerequisites

- Flutter with a Dart SDK compatible with `pubspec.yaml`
- A configured Android emulator, iOS simulator, or physical device
- Local environment values in `.env`

## Common Commands

Run these commands from the `AquaCare_App` directory:

```sh
flutter pub get
flutter analyze
flutter test
```

Use `dart format lib test` after editing Dart source files. If the `test`
directory is not present, format `lib` on its own.

## Project Layout

- `lib/models` contains application data models.
- `lib/screens` contains the main user-facing screens.
- `lib/services` contains integrations and service-layer code.
- `lib/widgets` contains reusable interface components.
- `assets/images` contains image assets bundled with the application.

Generated files, local environment files, and build output should remain out of
version control.
