import 'package:flutter/material.dart';
import 'package:practice_pal_mobile/consts/colors.dart';
import 'package:practice_pal_mobile/consts/styles.dart';
import 'package:practice_pal_mobile/data/abstract/widget_view.dart';
import 'package:practice_pal_mobile/presentation/pages/tests/take/take_test_controller.dart';
import 'package:practice_pal_mobile/presentation/pages/tests/take/take_test_tile.dart';
import 'package:practice_pal_mobile/presentation/widgets/btns/btn.dart';
import 'package:practice_pal_mobile/presentation/widgets/gap.dart';
import 'package:practice_pal_mobile/services/utils/dialog_utils.dart';

class TakeTestView extends WidgetView<TakeTestPage, TakeTestController> {
  const TakeTestView(super.state, {super.key});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: state.answers.isEmpty,
      onPopInvoked: state.onPopInvoked,
      child: Scaffold(
        appBar: AppBar(title: Text("Test Underway"), actions: [
          IconButton(onPressed: showScoresInfo, icon: Icon(Icons.info_outline))
        ]),
        body: CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 100,
              leading: Text(""),
              floating: true,
              flexibleSpace: FlexibleSpaceBar(
                background: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Text(
                      state.test.title,
                      textAlign: TextAlign.center,
                      style:
                          Styles.headlineMedium.copyWith(color: Colors.white),
                    ),
                    Text(
                      "Number of Questions: ${state.answers.length} / ${state.test.noOfQuestions}",
                      style: Styles.titleMedium
                          .copyWith(color: AppColors.secondary),
                    )
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Column(
                children: [
                  ListView.builder(
                      shrinkWrap: true,
                      physics: NeverScrollableScrollPhysics(),
                      itemCount: state.test.questions.length,
                      itemBuilder: (context, index) {
                        final question = state.test.questions[index];
                        return TakeTestTile(
                            question: question, onSelect: state.onSelect);
                      }),
                  Gap(),
                  Button(label: "Submit", onPressed: state.submit)
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
