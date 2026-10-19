# NOX Flutter app blueprint

Single Flutter app under `lib/` — Discover, Tickets, Pulse, Inbox, and Profile with the NOX brand theme.

## Layout

- `lib/` — app source (entry: `main.dart`, shell: `app.dart`)
- `test/` / `integration_test/` — widget and integration coverage
- `.github/workflows/` — CI blueprint

## Getting started

```bash
cd flutter_blueprint
flutter pub get
flutter analyze
flutter test
```

## Project structure

- `lib/main.dart` — app entrypoint
- `lib/app.dart` — router and application shell
- `lib/src/features/` — feature modules and screens
- `lib/src/shared/` — theme and common widgets
