import 'package:flutter/material.dart';
import 'package:get/get.dart';

class Button extends StatelessWidget {
  final String label;
  final Function() onPressed;
  const Button({super.key, required this.label, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return Hero(
      tag: label,
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: ElevatedButton(
            onPressed: (){
              Get.focusScope!.unfocus();
              onPressed();
            },
            style: ElevatedButton.styleFrom(
              fixedSize: const Size(double.maxFinite, 56)
            ),
            child: Text(label)),
      ),
    );
  }
}
