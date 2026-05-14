import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'src/features/auth/auth_screen.dart';
import 'src/features/home/home_screen.dart';
import 'src/features/settings/settings_screen.dart';

class NoxBlueprintApp extends StatelessWidget {
  const NoxBlueprintApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'NOX Flutter Blueprint',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}

final GoRouter router = GoRouter(
  initialLocation: '/',
  routes: <GoRoute>[
    GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
    GoRoute(path: '/auth', builder: (context, state) => const AuthScreen()),
    GoRoute(path: '/settings', builder: (context, state) => const SettingsScreen()),
  ],
);
