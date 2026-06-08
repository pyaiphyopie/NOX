import 'package:integration_test/integration_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nox_flutter_blueprint/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('full app smoke test', (WidgetTester tester) async {
    app.main();
    await tester.pumpAndSettle();

    expect(find.text('NOX Blueprint Home'), findsOneWidget);

    await tester.tap(find.text('Go to Auth'));
    await tester.pumpAndSettle();

    expect(find.text('Authentication'), findsOneWidget);
  });
}
