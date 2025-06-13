import 'package:flutter/material.dart';

import '../../../consts/styles.dart';

class Headline extends StatelessWidget {
  final String text;
  const Headline(this.text, {super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(10),
      child: Text("$text:", style: Styles.headlineSmall.copyWith(color: Colors.grey)),
    );
  }
}
