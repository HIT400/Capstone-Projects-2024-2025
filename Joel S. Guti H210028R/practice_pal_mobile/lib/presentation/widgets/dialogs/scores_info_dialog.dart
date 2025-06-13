import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/consts/colors.dart';
import 'package:practice_pal_mobile/consts/styles.dart';
import 'package:practice_pal_mobile/presentation/widgets/containers/colored_text_container.dart';
import 'package:practice_pal_mobile/presentation/widgets/gap.dart';

class ScoresInfoDialog extends StatelessWidget {
  const ScoresInfoDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return Dialog(
      child: Column(mainAxisSize: MainAxisSize.min, children: [
        Text("Scores: ", style: Styles.headlineMedium),
        Divider(),
        ListTile(
          leading: ColoredTextContainer(text: "Excellent", color: Colors.green),
          trailing: Text("90% and above", style: Styles.titleMedium,),
        ),
        ListTile(
          leading: ColoredTextContainer(text: "Good", color: AppColors.success),
          trailing: Text("between 70% to 89%", style: Styles.titleMedium,),
        ),
        ListTile(
          leading: ColoredTextContainer(text: "Pass", color: AppColors.info),
          trailing: Text("between 50% to 69%", style: Styles.titleMedium,),
        ),
        ListTile(
          leading: ColoredTextContainer(text: "Poor", color: AppColors.warning),
          trailing: Text("between 40% to 50%", style: Styles.titleMedium,),
        ),
        ListTile(
          leading: ColoredTextContainer(text: "Fail", color: AppColors.error),
          trailing: Text("39% and below", style: Styles.titleMedium,),
        ),
        Gap(),
        FilledButton(onPressed: Get.back, child: Text("Close"))
      ]),
    );
  }
}
