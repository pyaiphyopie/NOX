import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nox_flutter_workspace/app.dart';

void main() {
  testWidgets('home screen renders and navigates to auth', (WidgetTester tester) async {
    await tester.pumpWidget(MaterialApp.router(routerConfig: router));
    await tester.pumpAndSettle();

    expect(find.text("Tonight's Pulse"), findsOneWidget);
    expect(find.text('Discover'), findsOneWidget);

    router.go('/auth');
    await tester.pumpAndSettle();

    expect(find.text('Authentication'), findsOneWidget);
  });
}
