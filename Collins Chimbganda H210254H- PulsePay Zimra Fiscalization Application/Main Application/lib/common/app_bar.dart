import 'package:flutter/material.dart';
import 'package:pulsepay/common/reusable_text.dart';


class CustomAppBar extends StatelessWidget {
  const CustomAppBar ({super.key, this.text, required this.child, this.actions});

  final String? text;
  final Widget child;
  final List<Widget>? actions;

  @override
  Widget build(BuildContext context){
    return AppBar(
      iconTheme: const IconThemeData(),
      backgroundColor: Colors.white,
      elevation: 0,
      automaticallyImplyLeading: false,
      //leadingWidth: 70.w,
      leading: child,
      actions: actions,
      centerTitle: true,
      title: ReusableText(text: text??"", style: const TextStyle(fontSize:16 , color: Colors.black, fontWeight:  FontWeight.w400)),
    );
  }
}