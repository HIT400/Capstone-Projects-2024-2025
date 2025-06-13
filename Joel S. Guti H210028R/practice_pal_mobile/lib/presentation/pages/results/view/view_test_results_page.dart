import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/consts/styles.dart';
import 'package:practice_pal_mobile/consts/values.dart';
import 'package:practice_pal_mobile/data/exceptions/exception_handler.dart';
import 'package:practice_pal_mobile/data/models/test_model.dart';
import 'package:practice_pal_mobile/presentation/pages/results/revision/revise_test_controller.dart';
import 'package:practice_pal_mobile/presentation/pages/tests/take/take_test_controller.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/decision_dialog.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/circle_progress_bar_info.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/info_tile.dart';
import 'package:practice_pal_mobile/services/api/test_api_service.dart';

class ViewTestResultsPage extends StatelessWidget {
  final TestResults results;

  const ViewTestResultsPage(this.results, {super.key});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: (canPop) {
        if (canPop) return;
        Get.back(result: true);
      },
      child: Scaffold(
        appBar: AppBar(title: Text("Test Performance"), actions: [
          IconButton(
              onPressed: () async {
                try {
                  final res = await Get.dialog(DecisionDialog(
                      title: "New Attempt",
                      content: "Want to try the test again?",
                      label: "Retake Now"));
                  if (res) {
                    final test = await TestAPIService.getTest(results.testId);
                    Get.off(() => TakeTestPage(test), fullscreenDialog: true);
                  }
                } on Exception catch (e) {
                  ExceptionHandler.show(e);
                }
              },
              icon: Icon(FontAwesomeIcons.repeat))
        ]),
        body: CustomScrollView(
          slivers: [
            SliverAppBar(
              expandedHeight: 200,
              leading: Text(""),
              flexibleSpace: FlexibleSpaceBar(
                background: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    CircleProgressBarInfo(
                      value: results.score / 100,
                      label: results.percentage,
                      color: results.status.color,
                    ),
                    Text.rich(
                      TextSpan(text: "STATUS: ", children: [
                        TextSpan(
                            text: results.status.label,
                            style: TextStyle(color: results.status.color))
                      ]),
                      style:
                          Styles.headlineLarge.copyWith(color: Colors.white70),
                    )
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Column(children: [
                InfoTile(
                    icon: FontAwesomeIcons.pencil,
                    title: "Title",
                    value: results.title),
                InfoTile(
                    icon: FontAwesomeIcons.calendar,
                    title: "Date Taken",
                    value: results.date),
                Divider(),
                InfoRow(children: [
                  InfoTile(
                      icon: FontAwesomeIcons.hashtag,
                      title: "Total Questions",
                      value: results.totalQuestions),
                  InfoTile(
                      icon: Icons.add,
                      title: "Total Answered",
                      value: results.totalAnswered),
                ]),
                InfoRow(children: [
                  InfoTile(
                      icon: Icons.add,
                      title: "Total Correct Answers",
                      value: results.totalCorrectAnswers),
                  InfoTile(
                      icon: Icons.add,
                      title: "Total Unanswered Questions",
                      value: results.totalUnanswered),
                ])
              ]),
            )
          ],
        ),
        floatingActionButton: FloatingActionButton.extended(
          onPressed: () =>
              Get.to(() => ReviseTestPage(results.id), fullscreenDialog: true),
          shape: AppValues.shape,
          label: Text("Revise Test"),
          icon: Icon(FontAwesomeIcons.filePen),
        ),
      ),
    );
  }
}
