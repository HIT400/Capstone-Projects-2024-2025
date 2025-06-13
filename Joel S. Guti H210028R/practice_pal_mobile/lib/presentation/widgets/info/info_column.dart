import 'package:flutter/material.dart';

import '../../../consts/styles.dart';

class InfoColumn extends StatelessWidget {
  final String label;
  final Object value;
  const InfoColumn({super.key, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text(label,
            style: Styles.bodyLarge
                .copyWith(color: Colors.white70)),
        Text("$value",
            style: Styles.displayMedium
                .copyWith(color: Colors.white))
      ],
    );
  }
}
