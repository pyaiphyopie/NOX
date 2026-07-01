import 'package:integration_test/integration_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nox_flutter_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  ;

  testWidgets('home page displays title and auth button',
      (WidgetTester tester) async {
    app.main();
    await tester.pumpAndSettle();

    expect(find.text('NOX Blueprint Home'), findsOneWidget);
    expect(find.text('Go to Auth'), findsOneWidget);
  });

  testWidgets('app launches and settles without errors',
      (WidgetTester tester) async {
    app.main();
    await tester.pumpAndSettle();
  });
}
