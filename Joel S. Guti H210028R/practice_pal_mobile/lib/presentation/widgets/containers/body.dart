import 'package:flutter/material.dart';
import 'package:get/get.dart';

class Body extends StatelessWidget {
  final List<Widget> children;
  const Body({super.key, required this.children});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: Get.focusScope!.unfocus,
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: CustomScrollView(
          shrinkWrap: true,
          slivers: [
            SliverToBoxAdapter(
                child: Column(
                  mainAxisSize: MainAxisSize.max,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: children,
                ))
          ],
        ),
      ),
    );
  }
}
