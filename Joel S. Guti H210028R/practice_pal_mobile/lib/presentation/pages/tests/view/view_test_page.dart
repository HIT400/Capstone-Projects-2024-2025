import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/consts/styles.dart';
import 'package:practice_pal_mobile/consts/values.dart';
import 'package:practice_pal_mobile/data/exceptions/exception_handler.dart';
import 'package:practice_pal_mobile/data/extensions/test_results_extension.dart';
import 'package:practice_pal_mobile/data/models/test_model.dart';
import 'package:practice_pal_mobile/presentation/pages/tests/take/take_test_controller.dart';
import 'package:practice_pal_mobile/presentation/widgets/containers/colored_text_container.dart';
import 'package:practice_pal_mobile/presentation/widgets/containers/refreshable_body.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/decision_dialog.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/loading_dialog.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/circle_progress_bar_info.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/error_info.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/info_tile.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/list_title.dart';
import 'package:practice_pal_mobile/services/api/test_api_service.dart';

class ViewTestPage extends StatefulWidget {
  final int id;

  const ViewTestPage(this.id, {super.key});

  @override
  State<ViewTestPage> createState() => _ViewTestPageState();
}

class _ViewTestPageState extends State<ViewTestPage> {
  late Future<TestDetails> _future;

  @override
  void initState() {
    _future = TestAPIService.getTestDetails(widget.id)
        .onError(ExceptionHandler.trace);
    super.initState();
  }

  Future<void> _refresh() async {
    setState(() {
      _future = TestAPIService.getTestDetails(widget.id)
          .onError(ExceptionHandler.trace);
    });
  }

  _attempt() async {
    final res = await Get.dialog(DecisionDialog(
      title: "Begin Your Test",
      content: "Ready to start the test?",
      label: "Start Now",
    ));
    if (res) {
      final test = await TestAPIService.getTest(widget.id);
      Get.to(() => TakeTestPage(test), fullscreenDialog: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Test Insights")),
      body: RefreshableBody(
          onRefresh: _refresh,
          child: FutureBuilder(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return Loading();
                } else if (snapshot.hasError) {
                  return ErrorInfo(snapshot.error!);
                } else {
                  final details = snapshot.data!;
                  return CustomScrollView(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    slivers: [
                      SliverAppBar(
                          leading: Text(""),
                          expandedHeight: 200,
                          flexibleSpace: FlexibleSpaceBar(
                            background: Column(
                              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                              children: [
                                CircleProgressBarInfo(
                                  value: details.results.avg / 100,
                                  label: details.results.avgPercentage,
                                  color: details.results.status.color,
                                ),
                                Text.rich(
                                  TextSpan(text: "OVERALL STATUS: ", children: [
                                    TextSpan(
                                        text: details.results.status.label,
                                        style: TextStyle(
                                            color:
                                                details.results.status.color))
                                  ]),
                                  style: Styles.headlineMedium
                                      .copyWith(color: Colors.white70),
                                )
                              ],
                            ),
                          )),
                      SliverToBoxAdapter(
                          child: Padding(
                        padding: const EdgeInsets.all(10),
                        child: Column(
                          children: [
                            InfoTile(
                                icon: FontAwesomeIcons.pencil,
                                title: "Title",
                                value: details.title),
                            InfoRow(children: [
                              InfoTile(
                                  icon: FontAwesomeIcons.hashtag,
                                  title: "No. of Attempts",
                                  value: details.results.length),
                              InfoTile(
                                  icon: FontAwesomeIcons.signal,
                                  title: "Difficulty",
                                  value: details.difficulty.text),
                            ]),
                            InfoTile(
                                icon: FontAwesomeIcons.calendar,
                                title: "Created At",
                                value: details.createdAt),
                            Divider()
                          ],
                        ),
                      )),
                      SliverToBoxAdapter(
                        child: Container(
                          margin: EdgeInsets.only(bottom: 80),
                          child: Column(
                            children: [
                              ListTitle(title: "Test Results", page: null),
                              ListView.builder(
                                  shrinkWrap: true,
                                  itemCount: details.results.length,
                                  physics: NeverScrollableScrollPhysics(),
                                  itemBuilder: (context, index) {
                                    final result = details.results[index];
                                    return ListTile(
                                      title: Text(result.title),
                                      subtitle: Text(result.date),
                                      trailing: ColoredTextContainer(
                                          text: result.percentage,
                                          color: result.status.color),
                                    );
                                  }),
                              
                              if (details.results.isEmpty)
                                Padding(
                                  padding: const EdgeInsets.all(10),
                                  child: Text("No test attempts so far."),
                                )
                            ]),
                        ))
                    ],
                  );
                }
              })),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _attempt,
        shape: AppValues.shape,
        label: Text("Start Test!"),
        icon: Icon(FontAwesomeIcons.play),
      ),
    );
  }
}
