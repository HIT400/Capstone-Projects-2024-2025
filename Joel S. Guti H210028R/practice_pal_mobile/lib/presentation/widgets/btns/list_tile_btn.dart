import 'package:flutter/material.dart';
import 'package:practice_pal_mobile/consts/colors.dart';

class ListTileBtn extends StatelessWidget {
  final Function()? onTap;
  final IconData icon;
  final String label;
  final Color color;

  const ListTileBtn({super.key,
    required this.onTap,
    required this.icon,
    required this.label,
    this.color = AppColors.tertiary});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        onTap: onTap,
        leading: Icon(icon, color: color),
        title: Text(label),
        trailing: Icon(
          Icons.chevron_right,
          size: 30,
        ),
      ),
    );
  }
}
