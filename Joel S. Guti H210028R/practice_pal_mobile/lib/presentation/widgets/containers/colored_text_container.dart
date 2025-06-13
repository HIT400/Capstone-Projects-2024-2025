import 'package:flutter/material.dart';
import 'package:practice_pal_mobile/consts/styles.dart';

class ColoredTextContainer extends StatelessWidget {
  final String text;
  final Color color;

  const ColoredTextContainer(
      {super.key, required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
          color: color.withOpacity(0.15),
          borderRadius: BorderRadius.circular(50)),
      padding: EdgeInsets.symmetric(vertical: 5, horizontal: 10),
      child: Text(text, style: Styles.titleMedium.copyWith(color: color)),
    );
  }
}
