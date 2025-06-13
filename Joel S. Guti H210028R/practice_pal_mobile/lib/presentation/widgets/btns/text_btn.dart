import 'package:flutter/material.dart';
import 'package:practice_pal_mobile/consts/colors.dart';
import 'package:practice_pal_mobile/consts/styles.dart';

class TextBtn extends StatelessWidget {
  final String text, label;
  final Function() onPressed;

  const TextBtn({
    super.key,
    required this.text,
    required this.label,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(text, style: Styles.bodyLarge),
        TextButton(
            onPressed: onPressed,
            child: Text(label,
                style: Styles.titleMedium.copyWith(color: AppColors.secondary)))
      ],
    );
  }
}
