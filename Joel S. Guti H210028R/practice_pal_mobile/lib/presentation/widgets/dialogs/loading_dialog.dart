import 'package:flutter/material.dart';
import 'package:practice_pal_mobile/services/utils/size_util.dart';

import '../gap.dart';

class LoadingDialog extends StatelessWidget {
  final String message;

  const LoadingDialog({super.key, this.message = "Please wait"});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: true,
      child: Dialog(
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const CircularProgressIndicator.adaptive(),
              const Gap(),
              Text("$message...")
            ],
          ),
        ),
      ),
    );
  }
}

class Loading extends StatelessWidget {
  const Loading({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.maxFinite,
      height: SizeUtil.height(.3),
      child: Center(
          child: Padding(
        padding: EdgeInsets.all(10),
        child: CircularProgressIndicator.adaptive(),
      )),
    );
  }
}
