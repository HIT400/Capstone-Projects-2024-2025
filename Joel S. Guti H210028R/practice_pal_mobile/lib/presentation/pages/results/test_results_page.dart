import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/consts/styles.dart';
import 'package:practice_pal_mobile/data/extensions/test_results_extension.dart';
import 'package:practice_pal_mobile/data/models/test_model.dart';
import 'package:practice_pal_mobile/presentation/pages/results/view/view_test_results_page.dart';
import 'package:practice_pal_mobile/presentation/widgets/containers/refreshable_body.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/loading_dialog.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/circle_progress_bar_info.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/error_info.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/no_data_info.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/score_status_info.dart';
import 'package:practice_pal_mobile/services/api/test_api_service.dart';
import 'package:practice_pal_mobile/services/utils/dialog_utils.dart';

class TestResultsPage extends StatefulWidget {
  const TestResultsPage({super.key});

  @override
  State<TestResultsPage> createState() => _TestResultsPageState();
}

class _TestResultsPageState extends State<TestResultsPage> {
  late Future<List<TestResults>> _future;

  @override
  void initState() {
    _future = TestAPIService.allResults();
    super.initState();
  }

  Future<void> _refresh() async {
    setState(() {
      _future = TestAPIService.allResults();
    });
  }

  _open(result) async {
    final res =
        await Get.to(() => ViewTestResultsPage(result), fullscreenDialog: true);
    if (res != null && res) {
      await _refresh();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Test Results"), actions: [
        IconButton(onPressed: showScoresInfo, icon: Icon(Icons.info_outline))
      ]),
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
                  final results = snapshot.data!;
                  if (results.isNotEmpty) {
                    return CustomScrollView(
                        shrinkWrap: true,
                        physics: NeverScrollableScrollPhysics(),
                        slivers: [
                          SliverAppBar(
                              leading: Text(""),
                              expandedHeight: 200,
                              flexibleSpace: FlexibleSpaceBar(
                                background: Column(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceEvenly,
                                    children: [
                                      CircleProgressBarInfo(
                                        value: results.avg / 100,
                                        label: results.avgPercentage,
                                        color: results.status.color,
                                      ),
                                      Text.rich(TextSpan(
                                          text: "Overall Status: ",
                                          children: [
                                            TextSpan(
                                                text: results.status.label,
                                                style: TextStyle(
                                                    color:
                                                        results.status.color))
                                          ],
                                          style: Styles.headlineSmall
                                              .copyWith(color: Colors.white70)))
                                    ]),
                              )),
                          SliverToBoxAdapter(
                              child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: ListView.builder(
                                shrinkWrap: true,
                                itemCount: results.length,
                                physics: NeverScrollableScrollPhysics(),
                                itemBuilder: (context, index) {
                                  final result = results[index];
                                  return Card(
                                    child: ListTile(
                                      onTap: () => _open(result),
                                      title: Text(result.title),
                                      subtitle: Text(result.date),
                                      trailing: ScoreStatusInfo(result),
                                    ),
                                  );
                                }),
                          ))
                        ]);
                  } else {
                    return NoDataInfo("You haven’t taken any tests yet!");
                  }
                }
              })),
    );
  }
}
