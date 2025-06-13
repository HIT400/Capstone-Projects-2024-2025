import 'package:flutter/material.dart';
import 'package:get/get.dart';

class QuitDialog extends StatelessWidget {
  final String title, content, label;

  const QuitDialog(
      {super.key,
      required this.title,
      required this.content,
      this.label = "Yes, Quit"});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      child: AlertDialog.adaptive(
        title: Text(title),
        content: Text(content),
        actions: [
          TextButton(
              onPressed: () => Get.back(result: true),
              child: Text(
                label,
                style: const TextStyle(color: Colors.red),
              )),
          TextButton(onPressed: () => Get.back(result: false), child: const Text("Cancel")),
        ],
      ),
    );
  }
}
