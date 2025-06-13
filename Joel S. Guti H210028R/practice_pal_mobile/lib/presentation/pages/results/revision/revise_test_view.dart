import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/consts/colors.dart';
import 'package:practice_pal_mobile/consts/styles.dart';
import 'package:practice_pal_mobile/data/abstract/widget_view.dart';
import 'package:practice_pal_mobile/presentation/pages/results/revision/revise_test_controller.dart';
import 'package:practice_pal_mobile/presentation/pages/results/revision/revise_test_tile.dart';
import 'package:practice_pal_mobile/presentation/widgets/btns/btn.dart';
import 'package:practice_pal_mobile/presentation/widgets/containers/refreshable_body.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/loading_dialog.dart';
import 'package:practice_pal_mobile/presentation/widgets/gap.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/error_info.dart';

class ReviseTestView extends WidgetView<ReviseTestPage, ReviseTestController> {
  const ReviseTestView(super.state, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Revision"),
        actions: [
          IconButton(
              onPressed: state.retake,
              icon: Icon(
                FontAwesomeIcons.repeat,
              ))
        ]),
      body: RefreshableBody(
          onRefresh: state.refresh,
          child: FutureBuilder(
              future: state.future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return Loading();
                } else if (snapshot.hasError) {
                  return ErrorInfo(snapshot.error!);
                } else {
                  final revision = snapshot.data!;
                  state.revision = revision;
                  return CustomScrollView(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    slivers: [
                      SliverAppBar(
                          floating: true,
                          leading: Text(""),
                          expandedHeight: 100,
                          flexibleSpace: FlexibleSpaceBar(
                            background: Column(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceEvenly,
                                children: [
                                  Text(revision.test.title,
                                      style: Styles.headlineMedium
                                          .copyWith(color: Colors.white)),
                                  Text(
                                    "Total Points: ${revision.score}",
                                    style: Styles.titleLarge
                                        .copyWith(color: Colors.white),
                                  ),
                                  Text(
                                      "${revision.test.difficulty.text} Difficulty",
                                      style: Styles.bodyLarge.copyWith(
                                          color: AppColors.secondary)),
                                ]),
                          )),
                      SliverToBoxAdapter(
                        child: Column(
                          children: [
                            ListView.builder(
                                shrinkWrap: true,
                                physics: NeverScrollableScrollPhysics(),
                                itemCount: revision.test.questions.length,
                                itemBuilder: (context, index) {
                                  final question =
                                      revision.test.questions[index];
                                  return ReviseTestTile(
                                      question: question,
                                      response: revision.responses
                                          .firstWhereOrNull((response) =>
                                              response.questionIndex ==
                                              question.index));
                                }),
                            Gap(),
                            Button(label: "Done", onPressed: Get.back)
                          ],
                        ),
                      )
                    ],
                  );
                }
              })),
    );
  }
}
