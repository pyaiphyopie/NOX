import 'package:flutter/material.dart';
import 'package:nox_flutter_shared/nox_flutter_shared.dart';

class SettingsScreen extends StatelessWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            const Text(
              'Centralize shared preferences, feature toggles, and app configuration here.',
              style: TextStyle(fontSize: 16.0),
            ),
            const SizedBox(height: 24.0),
            PrimaryButton(
              label: 'Back to Home',
              onPressed: () => Navigator.of(context).pop(),
            ),
          ],
        ),
      ),
    );
  }
}
