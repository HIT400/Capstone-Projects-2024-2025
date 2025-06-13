import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:shimmer/shimmer.dart';

class LoadingListTile extends StatelessWidget {
  const LoadingListTile({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: Get.width,
      height: 75,
      child: Shimmer.fromColors(
        baseColor: Colors.grey.withOpacity(0.2),
        highlightColor: Colors.white,
        child: const ListTile(
          leading: CircleAvatar(child: Card(shape: CircleBorder(),),),
          title: SizedBox(width: 10, height: 20, child: Card()),
          subtitle: SizedBox(width: 10, height: 15, child: Card()),
          trailing: SizedBox(width: 75, height: 40, child: Card(),),
        ),
      ),
    );
  }
}
