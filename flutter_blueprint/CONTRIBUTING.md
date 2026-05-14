# Contributing

Thank you for contributing to the NOX Flutter repository blueprint.

## How to contribute

1. Fork the repository or create a feature branch.
2. Keep changes focused and atomic.
3. Add tests for new behavior and update existing tests as needed.
4. Run `flutter format .`, `flutter analyze`, and `flutter test` before submitting.

## Branch strategy

- `main` for stable blueprint updates
- feature branches for architecture, tooling, and app improvements

## Code style

- Follow Flutter and Dart style conventions.
- Prefer `const` constructors and immutable value objects.
- Keep UI logic in widgets and business rules in separate service or repository layers.
