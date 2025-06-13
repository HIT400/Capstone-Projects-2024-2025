import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import '../../../consts/styles.dart';
import '../../../services/utils/size_util.dart';

class DisplayError extends StatelessWidget {
  final String message;
  const DisplayError(this.message, {super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.maxFinite,
      height: SizeUtil.height(0.8) - kToolbarHeight,
      child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Icon(FontAwesomeIcons.triangleExclamation,
                color: Colors.red, size: 50),
            Text("Unexpected Error!",
                style: Styles.displaySmall),
            Text("$message.",
                textAlign: TextAlign.center,
                style: Styles.bodyLarge.copyWith(color: Colors.grey))
          ]),
    );
  }
}
