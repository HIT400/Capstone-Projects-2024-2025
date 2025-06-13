import 'package:flutter/material.dart';

import '../../consts/images.dart';

class Logo extends StatelessWidget {
  final double radius;

  const Logo({super.key, this.radius = 150});

  @override
  Widget build(BuildContext context) {
    return Hero(
      tag: "logo",
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: 250, maxHeight: 250),
        child: Image.asset(Images.logo),
      ),
    );
  }
}

class PracticePal extends StatelessWidget {
  const PracticePal({super.key});

  @override
  Widget build(BuildContext context) {
    return Hero(
      tag: "practice_pal",
      child: Column(
        children: [
          Image.asset(Images.logo, width: 250),
          Image.asset(Images.text)
        ]),
    );
  }
}
