import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:nox_flutter_shared/nox_flutter_shared.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('NOX Blueprint Home')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            const Text(
              'A clean architecture foundation for mobile-first Flutter applications.',
              style: TextStyle(fontSize: 16.0),
            ),
            const SizedBox(height: 24.0),
            PrimaryButton(
              label: 'Go to Auth',
              onPressed: () => context.go('/auth'),
            ),
            const SizedBox(height: 12.0),
            PrimaryButton(
              label: 'Settings',
              onPressed: () => context.go('/settings'),
            ),
          ],
        ),
      ),
    );
  }
}
