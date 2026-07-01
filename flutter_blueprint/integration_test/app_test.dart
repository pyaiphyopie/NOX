import 'package:integration_test/integration_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:nox_flutter_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('home page displays discover content and nav',
      (WidgetTester tester) async {
    app.main();
    await tester.pumpAndSettle();

    expect(find.text("Tonight's Pulse"), findsOneWidget);
    expect(find.text('Discover'), findsOneWidget);
  });

  testWidgets('app launches and settles without errors',
      (WidgetTester tester) async {
    app.main();
    await tester.pumpAndSettle();
  });
}
