import 'package:flutter/material.dart';

/// NOX Design System — Dark Luxury Minimalism
class NoxColors {
  static const Color noxBlack = Color(0xFF070707);
  static const Color deepGraphite = Color(0xFF141414);
  static const Color surface = Color(0xFF1A1A1A);
  static const Color electricCyan = Color(0xFF00AEEF);
  static const Color neonViolet = Color(0xFF8B5CF6);
  static const Color iceWhite = Color(0xFFF5F7FA);
  static const Color emeraldPulse = Color(0xFF00D68F);
  static const Color muted = Color(0xFF8A8A8A);
  static const Color border = Color(0x1AFFFFFF);

  static const LinearGradient heroGradient = LinearGradient(
    colors: [electricCyan, neonViolet],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient cyanPulse = LinearGradient(
    colors: [Color(0xFF00AEEF), Color(0xFF0088CC)],
  );
}
