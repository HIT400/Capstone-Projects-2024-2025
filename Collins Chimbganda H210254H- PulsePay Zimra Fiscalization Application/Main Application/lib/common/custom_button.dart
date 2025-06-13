import 'package:flutter/material.dart';
import 'package:pulsepay/common/reusable_text.dart';

class CustomOutlineBtn extends StatelessWidget {
  const CustomOutlineBtn({super.key, this.width, this.height, required this.text, this.onTap, required this.color, this.color2});

  final double? width;
  final double? height;
  final String text;
  final void Function()? onTap;
  final Color color;
  final Color? color2;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: width,
        height: height,
        decoration:  BoxDecoration(
          borderRadius: BorderRadius.circular(10.0),
          color: color2,
          border: Border.all(
            width: 1,
            color: color,
          )
        ),
        child: Center(
          child: ReusableText(text: text,
           style: const TextStyle(fontSize:16 ,color: Colors.white,fontWeight:  FontWeight.w600)),
        ),
      ),
    );
  }
}