import 'package:flutter/cupertino.dart';
import 'package:practice_pal_mobile/consts/styles.dart';
import 'package:practice_pal_mobile/data/models/test_model.dart';

class ScoreStatusInfo extends StatelessWidget {
  final TestResults result;
  const ScoreStatusInfo(this.result, {super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
          color: result.status.color.withOpacity(0.3),
          borderRadius: BorderRadius.circular(50)
      ),
      padding: EdgeInsets.symmetric(vertical: 5, horizontal: 10),
      child: Text(result.percentage,
          style: Styles.titleMedium
              .copyWith(color: result.status.color)),
    );
  }
}
