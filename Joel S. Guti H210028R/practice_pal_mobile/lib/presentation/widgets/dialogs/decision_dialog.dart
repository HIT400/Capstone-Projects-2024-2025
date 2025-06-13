import 'package:flutter/material.dart';
import 'package:get/get.dart';

class DecisionDialog extends StatelessWidget {
  final String title, content, label;

  const DecisionDialog(
      {super.key,
      required this.title,
      required this.content,
      this.label = "Yes, Proceed"});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: AlertDialog.adaptive(
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(
              onPressed: () => Get.back(result: false),
              child: const Text("Cancel", style: TextStyle(color: Colors.black))),
          TextButton(onPressed: () => Get.back(result: true), child: Text(label)),
        ],
      ),
    );
  }
}
