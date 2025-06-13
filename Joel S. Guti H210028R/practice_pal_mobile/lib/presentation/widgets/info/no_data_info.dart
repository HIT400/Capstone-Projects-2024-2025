import 'package:flutter/material.dart';
import 'package:practice_pal_mobile/consts/images.dart';

import '../../../consts/styles.dart';
import '../../../services/utils/size_util.dart';

class NoDataInfo extends StatelessWidget {
  final String message;
  const NoDataInfo(this.message, {super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(10),
      width: double.maxFinite,
      height: SizeUtil.height(0.5),
      child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
                width: 150,
                height: 150,
                child: Image.asset(Images.subtraction)),
            Text("No Data Available!",
                style: Styles.displaySmall),
            Text("$message.",
                textAlign: TextAlign.center,
                style: Styles.bodyLarge.copyWith(color: Colors.grey))
          ]),
    );
  }
}
