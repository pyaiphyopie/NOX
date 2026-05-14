import 'package:flutter_test/flutter_test.dart';
import 'package:nox_flutter_app/app.dart';

void main() {
  testWidgets('home screen renders and navigates to auth',
      (WidgetTester tester) async {
    await tester.pumpWidget(const NoxFlutterApp());
    await tester.pumpAndSettle();

    expect(find.text('NOX Blueprint Home'), findsOneWidget);
    expect(find.text('Go to Auth'), findsOneWidget);

    await tester.tap(find.text('Go to Auth'));
    await tester.pumpAndSettle();

    expect(find.text('Authentication'), findsOneWidget);
  });
}
