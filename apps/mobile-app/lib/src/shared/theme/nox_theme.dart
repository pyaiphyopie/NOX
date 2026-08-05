import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'nox_colors.dart';

class NoxTheme {
  static ThemeData get dark {
    final base = ThemeData.dark(useMaterial3: true);
    return base.copyWith(
      scaffoldBackgroundColor: NoxColors.noxBlack,
      colorScheme: const ColorScheme.dark(
        primary: NoxColors.electricCyan,
        secondary: NoxColors.neonViolet,
        surface: NoxColors.deepGraphite,
        onPrimary: Colors.black,
        onSurface: NoxColors.iceWhite,
      ),
      textTheme: GoogleFonts.interTextTheme(base.textTheme).apply(
        bodyColor: NoxColors.iceWhite,
        displayColor: NoxColors.iceWhite,
      ),
      appBarTheme: const AppBarTheme(
        backgroundColor: NoxColors.noxBlack,
        elevation: 0,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: NoxColors.electricCyan,
          foregroundColor: Colors.black,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          textStyle: GoogleFonts.inter(fontWeight: FontWeight.w800, fontSize: 15),
        ),
      ),
    );
  }
}
