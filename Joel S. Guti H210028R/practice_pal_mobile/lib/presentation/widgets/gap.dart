import 'package:flutter/material.dart';

import '../../services/utils/size_util.dart';

class Gap extends StatelessWidget {
  final double size;
  const Gap({super.key, this.size = 0.03});

  @override
  Widget build(BuildContext context) {
    return Container(height: SizeUtil.height(size));
  }
}
