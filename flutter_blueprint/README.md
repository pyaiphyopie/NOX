# NOX Flutter Repository Blueprint

This folder contains a production-ready Flutter multi-package monorepo blueprint for a mobile-first app with clean architecture, strong developer tooling, and CI-ready automation.

## Workspace layout

- `packages/app/` — main Flutter application package
- `packages/core/` — shared infrastructure and runtime services
- `packages/features/` — feature modules and screens
- `packages/shared/` — reusable UI widgets and design system utilities
- `.github/workflows/` — CI workflows
- `melos.yaml` — monorepo package management

## What is included

- `lib/` app source code with feature-first structure
- `test/` and `integration_test/` folders for unit, widget, and integration coverage
- `pubspec.yaml` with production-grade dependency recommendations
- `analysis_options.yaml` with lint rules and analyzer configuration
- `flutter_launcher_icons.yaml` and `.gitignore` for platform hygiene
- CI blueprint under `.github/workflows/flutter-ci.yml`

## Getting started

```bash
cd flutter_blueprint
melos bootstrap
cd packages/app
flutter pub get
flutter analyze
flutter test
```

## Project structure

- `lib/main.dart` — app entrypoint
- `lib/app.dart` — router and application shell
- `lib/src/core/` — config, logging, infrastructure
- `lib/src/features/` — feature modules and screens
- `lib/src/shared/` — common widgets and shared utilities
- `test/` — unit and widget tests
- `integration_test/` — end-to-end flow tests

## Recommended workflow

- Use `flutter pub run build_runner build --delete-conflicting-outputs` for code-generation tasks
- Run `flutter format .` before commits
- Validate changes with static analysis and tests via CI
