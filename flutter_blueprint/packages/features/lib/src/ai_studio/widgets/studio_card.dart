import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class StudioCard extends StatelessWidget {
  const StudioCard({
    super.key,
    required this.title,
    required this.icon,
    required this.route,
    required this.accentColor,
  });

  final String title;
  final IconData icon;
  final String route;
  final Color accentColor;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(8),
      onTap: () => context.push(route),
      child: Ink(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          color: const Color(0xFF101014),
          border: Border.all(color: accentColor.withOpacity(0.45)),
          boxShadow: <BoxShadow>[
            BoxShadow(
              color: accentColor.withOpacity(0.18),
              blurRadius: 18,
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Icon(icon, size: 36, color: accentColor),
              const SizedBox(height: 12),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
