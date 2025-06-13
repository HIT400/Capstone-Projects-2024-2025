import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../consts/styles.dart';

class ExceptionDialog extends StatelessWidget {
  final String title;
  final String message;

  const ExceptionDialog(
      {super.key, required this.title, required this.message});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(title, style: Styles.headlineMedium),
      content: Text(message),
      actions: [TextButton(onPressed: Get.back, child: const Text("OK"))],
    );
  }
}
