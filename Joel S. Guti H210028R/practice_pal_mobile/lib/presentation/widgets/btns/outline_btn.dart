import 'package:flutter/material.dart';
import 'package:get/get.dart';

class OutlineBtn extends StatelessWidget {
  final String label;
  final Function() onPressed;
  const OutlineBtn({super.key, required this.label, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Hero(
      tag: label,
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: OutlinedButton(
            onPressed: (){
              Get.focusScope!.unfocus();
              onPressed();
            },
            style: FilledButton.styleFrom(
              fixedSize: const Size(double.maxFinite, 56)
            ),
            child: Text(label)),
      ),
    );
  }
}
