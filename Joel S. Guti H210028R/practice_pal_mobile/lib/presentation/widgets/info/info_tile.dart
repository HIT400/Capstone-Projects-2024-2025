import 'package:flutter/material.dart';

import '../../../consts/styles.dart';
import '../../../services/utils/size_util.dart';

class InfoTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final Object value;
  final Widget? trailing;

  const InfoTile(
      {super.key,
      required this.icon,
      required this.title,
      required this.value,
      this.trailing});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title, softWrap: true),
      titleTextStyle: Styles.bodyMedium,
      subtitle: FittedBox(
        fit: BoxFit.scaleDown,
        alignment: Alignment.centerLeft,
        child: Text(
          value.toString().isNotEmpty ? "$value" : "N/A",
          maxLines: 1,
          overflow: TextOverflow.visible,
          textAlign: TextAlign.start,
          style: Styles.titleMedium,
        ),
      ),
      trailing: trailing,
    );
  }
}

class InfoRow extends StatelessWidget {
  final List<Widget> children;

  const InfoRow({super.key, required this.children});

  @override
  Widget build(BuildContext context) {
    if (SizeUtil.width(1) > 400) {
      return Row(
          children: children.map((child) => Expanded(child: child)).toList());
    } else {
      return Column(children: children);
    }
  }
}
