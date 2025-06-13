import 'package:flutter/material.dart';
import 'package:get/get.dart';

import '../../../consts/styles.dart';

class ListTitle extends StatelessWidget {
  final String title;
  final Widget? page;

  const ListTitle({super.key, required this.title, required this.page});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(10),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text("$title:", style: Styles.titleMedium.copyWith(color: Colors.grey)),
        if (page != null)
          TextButton(
              onPressed: () => Get.to(page),
              child: const Text("See More")),
      ]),
    );
  }
}
