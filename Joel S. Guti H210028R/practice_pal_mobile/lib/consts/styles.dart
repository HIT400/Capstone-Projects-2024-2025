import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class Styles {
  static final displayLarge = GoogleFonts.anton(
    textStyle: const TextStyle(color: Colors.black, letterSpacing: 2, fontSize: 48, fontWeight: FontWeight.bold),
  );
  static final displayMedium = GoogleFonts.anton(
    textStyle: const TextStyle(color: Colors.black, letterSpacing: 2, fontSize: 40, fontWeight: FontWeight.bold),
  );
  static final displaySmall = GoogleFonts.anton(
    textStyle: const TextStyle(color: Colors.black, letterSpacing: 2, fontSize: 32, fontWeight: FontWeight.bold),
  );

  static final headlineLarge = GoogleFonts.anton(
    textStyle: const TextStyle(color: Colors.black, letterSpacing: 2, fontSize: 28, fontWeight: FontWeight.w700),
  );
  static final headlineMedium = GoogleFonts.anton(
    textStyle: const TextStyle(color: Colors.black, letterSpacing: 2, fontSize: 24, fontWeight: FontWeight.w600),
  );
  static final headlineSmall = GoogleFonts.anton(
    textStyle: const TextStyle(color: Colors.black, letterSpacing: 2, fontSize: 20, fontWeight: FontWeight.w500),
  );

  static final titleLarge = GoogleFonts.poppins(
    textStyle: const TextStyle(color: Colors.black, fontSize: 18, fontWeight: FontWeight.w600),
  );
  static final titleMedium = GoogleFonts.poppins(
    textStyle: const TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.w500),
  );
  static final titleSmall = GoogleFonts.poppins(
    textStyle: const TextStyle(color: Colors.black, fontSize: 14, fontWeight: FontWeight.w500),
  );

  static final bodyLarge = GoogleFonts.poppins(
    textStyle: const TextStyle(color: Colors.black, fontSize: 16, fontWeight: FontWeight.w400, height: 1.5),
  );
  static final bodyMedium = GoogleFonts.poppins(
    textStyle: const TextStyle(color: Colors.black, fontSize: 14, fontWeight: FontWeight.w400, height: 1.5),
  );
  static final bodySmall = GoogleFonts.poppins(
    textStyle: const TextStyle(color: Colors.black, fontSize: 12, fontWeight: FontWeight.w400, height: 1.5),
  );

  static final labelLarge = GoogleFonts.poppins(
    textStyle: const TextStyle(color: Colors.black, fontSize: 14, fontWeight: FontWeight.w600),
  );
  static final labelMedium = GoogleFonts.poppins(
    textStyle: const TextStyle(color: Colors.black, fontSize: 12, fontWeight: FontWeight.w500),
  );
  static final labelSmall = GoogleFonts.poppins(
    textStyle: const TextStyle(color: Colors.black, fontSize: 10, fontWeight: FontWeight.w400),
  );
}