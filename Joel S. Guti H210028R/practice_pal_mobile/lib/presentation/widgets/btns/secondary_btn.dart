import 'package:flutter/material.dart';

class SecondaryBtn extends StatelessWidget {
  final String label;
  final IconData icon;
  final Function() onPressed;

  const SecondaryBtn(
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
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Card(
            elevation: 0,
            color: Colors.transparent,
            shape: const CircleBorder(
              side: BorderSide(color: Colors.black)
            ),
            child: CircleAvatar(
              backgroundColor: Colors.transparent,
                radius: 35, child: Icon(icon, color: Colors.black, size: 25)),
          ),
          Text(label, textAlign: TextAlign.center, softWrap: true)
        ],
      ),
    );
  }
}
