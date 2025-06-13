import 'package:flutter/material.dart';

class RefreshableBody extends StatelessWidget {
  final Future<void> Function() onRefresh;
  final Widget child;
  const RefreshableBody({super.key, required this.onRefresh, required this.child});

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: onRefresh,
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: child,
          )
        ],
      ),
    );
  }
}
