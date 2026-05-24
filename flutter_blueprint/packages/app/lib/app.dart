import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:nox_flutter_features/nox_flutter_features.dart';
import 'package:nox_flutter_shared/nox_flutter_shared.dart';

class NoxFlutterApp extends StatelessWidget {
  const NoxFlutterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'NOX Flutter Blueprint',
      theme: AppTheme.theme,
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
    GoRoute(
      path: '/settings',
      builder: (context, state) => const SettingsScreen(),
    ),
    GoRoute(
      path: '/studio',
      builder: (context, state) => const StudioHomeScreen(),
    ),
    GoRoute(
      path: '/studio/music',
      builder: (context, state) => const MusicGeneratorScreen(),
    ),
    GoRoute(
      path: '/studio/voice',
      builder: (context, state) => const VoiceoverGeneratorScreen(),
    ),
    GoRoute(
      path: '/studio/poster',
      builder: (context, state) => const PosterGeneratorScreen(),
    ),
    GoRoute(
      path: '/studio/copy',
      builder: (context, state) => const CopyGeneratorScreen(),
    ),
    GoRoute(
      path: '/studio/assets',
      builder: (context, state) => const AssetLibraryScreen(),
    ),
  ],
);
