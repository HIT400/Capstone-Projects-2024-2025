import 'package:flutter/material.dart';
import 'package:practice_pal_mobile/consts/images.dart';

import '../../../consts/styles.dart';
import '../../../data/exceptions/exception_handler.dart';
import '../../../services/utils/size_util.dart';

class ErrorInfo extends StatelessWidget {
  final Object error;
  final Function()? onRetry;

  const ErrorInfo(this.error, {super.key, this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.maxFinite,
      height: SizeUtil.height(0.5),
      padding: EdgeInsets.all(10),
      child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(
              width: 150,
                height: 150,
                child: Image.asset(Images.caution)),
            Text("Unexpected Error!", style: Styles.displayMedium),
            Text(ExceptionHandler.error(error),
                textAlign: TextAlign.center,
                style: Styles.bodyLarge.copyWith(color: Colors.grey)),

            if(onRetry!=null)
              FilledButton.icon(
                  onPressed: onRetry,
                  icon: Icon(Icons.refresh),
                  label: Text("Retry"))
          ]),
    );
  }
}
