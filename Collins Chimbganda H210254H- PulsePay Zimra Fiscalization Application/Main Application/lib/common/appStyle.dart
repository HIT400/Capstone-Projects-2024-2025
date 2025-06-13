import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

TextStyle appStyle(double size, Color color, FontWeight fw){
  return GoogleFonts.poppins(fontSize: size.sp , color: color , fontWeight: fw);
}