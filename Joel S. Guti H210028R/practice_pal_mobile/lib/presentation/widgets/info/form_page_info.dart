import 'package:flutter/material.dart';
import 'package:practice_pal_mobile/consts/colors.dart';

import '../../../consts/styles.dart';
import '../gap.dart';

class FormPageInfo extends StatelessWidget {
  final String image, title, content;

  const FormPageInfo(
      {super.key,
      required this.image,
      required this.title,
      required this.content});

  @override
  Widget build(BuildContext context) {
    return Column(children: [
      SizedBox(
          width: 150,
          height: 150,
          child: Image.asset(image)),
      Text(
        title,
        style: Styles.headlineLarge.copyWith(color: AppColors.secondary),
      ),
      Text(content, textAlign: TextAlign.center),
      Gap(size: .02),
    ]);
  }
}
