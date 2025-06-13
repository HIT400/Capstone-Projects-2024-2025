import 'package:flutter/material.dart';

class PopupAction {
  final String label;
  final Function()? onTap;
  final Color? color;

  const PopupAction({
    required this.label,
    required this.onTap,
    this.color,
  });

  PopupMenuItem get item => PopupMenuItem(
      onTap: onTap,
      child: Text(
        label,
        style: TextStyle(color: onTap != null ? color : Colors.grey),
      ));
}

class ActionBtn extends StatelessWidget {
  final List<PopupAction> actions;
  final Widget? child;

  const ActionBtn({super.key, required this.actions, this.child});

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton(
      child: child,
      itemBuilder: (BuildContext context) {
        return actions.map((action) => action.item).toList();
      },
    );
  }
}
