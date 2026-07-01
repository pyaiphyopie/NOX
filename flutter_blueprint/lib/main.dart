import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'app.dart';
import 'src/core/logger.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    appLogger.e(
      'Flutter framework error',
      error: details.exception,
      stackTrace: details.stack,
    );
  };

  runZonedGuarded(
    () => runApp(const ProviderScope(child: NoxBlueprintApp())),
    (Object error, StackTrace stack) {
      appLogger.e('Unhandled async error', error: error, stackTrace: stack);
    },
  );
}
