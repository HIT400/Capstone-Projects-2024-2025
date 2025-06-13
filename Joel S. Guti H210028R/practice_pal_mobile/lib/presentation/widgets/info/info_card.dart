import 'package:flutter/material.dart';
import 'package:practice_pal_mobile/consts/colors.dart';
import 'package:practice_pal_mobile/consts/styles.dart';

class InfoCard extends StatelessWidget {
  final String label;
  final Object value;
  const InfoCard({super.key, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Card(
        child: Column(
          mainAxisAlignment:
          MainAxisAlignment.spaceEvenly,
          children: [
            Text(label),
            FittedBox(
                child: Text(
                  value.toString(),
                  style: Styles.displayMedium.copyWith(color: AppColors.tertiary),
                ))
          ],
        ),
      ),
    );
  }
}
