import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/router.dart';
import 'shared/theme/nox_theme.dart';

class NoxApp extends ConsumerWidget {
  const NoxApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    return MaterialApp.router(
      title: 'NOX',
      debugShowCheckedModeBanner: false,
      theme: NoxTheme.dark,
      routerConfig: router,
    );
  }
}
