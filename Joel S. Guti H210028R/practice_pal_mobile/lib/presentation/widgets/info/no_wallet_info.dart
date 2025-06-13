import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import '../../../consts/styles.dart';
import '../../../services/utils/size_util.dart';

class DisplayNoWallet extends StatelessWidget {
  final Function() create;
  const DisplayNoWallet(this.create, {super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.maxFinite,
      height: SizeUtil.height(0.5),
      padding: EdgeInsets.all(10),
      child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            const Icon(FontAwesomeIcons.circleExclamation,
                color: Colors.grey, size: 50),
            Text("No Wallet Found!", style: Styles.displaySmall),
            Text("",
                textAlign: TextAlign.center,
                style: Styles.bodyLarge.copyWith(color: Colors.grey)),
            FilledButton(onPressed: create, child: Text("Create Wallet"))
          ]),
    );
  }
}
