import 'package:flutter/material.dart';

const Color noxBlack = Color(0xFF070707);
const Color deepGraphite = Color(0xFF141414);
const Color electricCyan = Color(0xFF00AEEF);
const Color neonViolet = Color(0xFF8B5CF6);
const Color iceWhite = Color(0xFFF5F7FA);
const Color softGray = Color(0xFFA1A1AA);
const Color emeraldPulse = Color(0xFF00D68F);

final ThemeData noxTheme = ThemeData.dark().copyWith(
  scaffoldBackgroundColor: noxBlack,
  primaryColor: electricCyan,
  cardColor: deepGraphite,
  appBarTheme: const AppBarTheme(backgroundColor: noxBlack, elevation: 0, centerTitle: false),
  textTheme: const TextTheme(
    displayLarge: TextStyle(fontFamily: 'Satoshi', fontSize: 48, fontWeight: FontWeight.w900, letterSpacing: -2, color: iceWhite),
    headlineLarge: TextStyle(fontFamily: 'Satoshi', fontSize: 32, fontWeight: FontWeight.w800, color: iceWhite),
    headlineMedium: TextStyle(fontFamily: 'Satoshi', fontSize: 28, fontWeight: FontWeight.w700, color: iceWhite),
    titleLarge: TextStyle(fontFamily: 'Satoshi', fontSize: 22, fontWeight: FontWeight.w600, color: iceWhite),
    titleMedium: TextStyle(fontFamily: 'Satoshi', fontSize: 18, fontWeight: FontWeight.w600, color: iceWhite),
    bodyLarge: TextStyle(fontFamily: 'Satoshi', fontSize: 16, color: iceWhite),
    bodyMedium: TextStyle(fontFamily: 'Satoshi', fontSize: 14, color: softGray),
    labelLarge: TextStyle(fontFamily: 'Satoshi', fontSize: 14, fontWeight: FontWeight.w700, letterSpacing: 1.5),
  ),
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: electricCyan,
      foregroundColor: Colors.black,
      minimumSize: const Size(double.infinity, 56),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    ),
  ),
  outlinedButtonTheme: OutlinedButtonThemeData(
    style: OutlinedButton.styleFrom(
      foregroundColor: iceWhite,
      side: const BorderSide(color: Colors.white24),
      minimumSize: const Size(double.infinity, 56),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
    ),
  ),
  bottomNavigationBarTheme: const BottomNavigationBarThemeData(
    backgroundColor: noxBlack,
    selectedItemColor: electricCyan,
    unselectedItemColor: softGray,
    type: BottomNavigationBarType.fixed,
    elevation: 0,
  ),
);
