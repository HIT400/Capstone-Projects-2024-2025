import 'package:flutter/material.dart';
import 'package:practice_pal_mobile/consts/styles.dart';

class CircleProgressBarInfo extends StatelessWidget {
  final double value;
  final String label;
  final Color color, labelColor;

  const CircleProgressBarInfo(
      {super.key,
      required this.value,
      required this.label,
      this.color = Colors.white,
      this.labelColor = Colors.white});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(10),
      child: Stack(
        alignment: Alignment.center,
        children: [
          SizedBox(
            width: 100,
            height: 100,
            child: CircularProgressIndicator(
              value: !value.isNaN ? value : 0,
              color: color,
              backgroundColor: color.withOpacity(0.3),
              strokeWidth: 25,
            ),
          ),
          Text(
            label,
            style: Styles.titleMedium.copyWith(color: labelColor),
          )
        ],
      ),
    );
  }
}
