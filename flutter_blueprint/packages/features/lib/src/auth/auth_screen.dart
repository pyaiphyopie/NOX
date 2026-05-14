import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:nox_flutter_shared/nox_flutter_shared.dart';

class AuthScreen extends StatelessWidget {
  const AuthScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Authentication')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            const Text(
              'Secure authentication flow with validation, state management, and error handling.',
              style: TextStyle(fontSize: 16.0),
            ),
            const SizedBox(height: 24.0),
            PrimaryButton(
              label: 'Sign in',
              onPressed: () => context.go('/'),
            ),
          ],
        ),
      ),
    );
  }
}
