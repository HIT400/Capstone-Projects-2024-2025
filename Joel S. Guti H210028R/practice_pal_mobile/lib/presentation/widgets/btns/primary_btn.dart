import 'package:flutter/material.dart';
import 'package:get/get.dart';

class PrimaryBtn extends StatelessWidget {
  final String label;
  final IconData icon;
  final Function() onPressed;

  const PrimaryBtn(
      {super.key,
      required this.label,
      required this.icon,
      required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onPressed,
      highlightColor: Colors.transparent,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Card(
            elevation: 5,
            shape: const CircleBorder(),
            child: CircleAvatar(
                radius: 35, child: Icon(icon, color: Get.theme.primaryColor)),
          ),
          Text(label, textAlign: TextAlign.center, softWrap: true)
        ],
      ),
    );
  }
}
