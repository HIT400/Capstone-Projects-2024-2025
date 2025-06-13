import 'package:flutter/material.dart';

import '../../../consts/styles.dart';

class LabelListTile extends StatelessWidget {
  final String label, value;
  final bool center;
  const LabelListTile({super.key, required this.label, required this.value, this.center = false});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      tileColor: Colors.transparent,
      title: Text(label, textAlign: center ? TextAlign.center : TextAlign.left),
      titleTextStyle: Styles.bodyMedium.copyWith(color: Colors.grey),
      subtitle: Text(value, textAlign: center ? TextAlign.center : TextAlign.left),
      subtitleTextStyle: Styles.titleMedium,
    );
  }
}
