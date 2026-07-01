import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../shared/app_theme.dart';
import '../home/home_screen.dart';
import '../home/event_model.dart';
import '../tickets/ticket_purchase_screen.dart';
import '../auth/auth_screen.dart';
import '../settings/settings_screen.dart';

class NoxBlueprintApp extends StatelessWidget {
  const NoxBlueprintApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'NOX',
      theme: noxTheme,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}

final GoRouter router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (context, state) => const HomeScreen()),
    GoRoute(path: '/auth', builder: (context, state) => const AuthScreen()),
    GoRoute(path: '/settings', builder: (context, state) => const SettingsScreen()),
    GoRoute(
      path: '/ticket/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        final event = mockEvents.cast<Event?>().firstWhere(
              (e) => e!.id == id,
              orElse: () => null,
            );
        if (event == null) {
          return Scaffold(
            backgroundColor: const Color(0xFF070707),
            appBar: AppBar(
              title: const Text('Not Found'),
              backgroundColor: Colors.transparent,
              elevation: 0,
            ),
            body: Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.error_outline, color: Colors.white38, size: 64),
                  const SizedBox(height: 16),
                  const Text('Event not found',
                      style: TextStyle(fontSize: 20, color: Colors.white54)),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => GoRouter.of(context).go('/'),
                    child: const Text('Back to Discover'),
                  ),
                ],
              ),
            ),
          );
        }
        return TicketPurchaseScreen(event: event);
      },
    ),
  ],
);
