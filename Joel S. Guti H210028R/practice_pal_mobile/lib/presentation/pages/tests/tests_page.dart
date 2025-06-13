import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/data/exceptions/exception_handler.dart';
import 'package:practice_pal_mobile/data/models/test_model.dart';
import 'package:practice_pal_mobile/presentation/pages/tests/generate/generate_test_controller.dart';
import 'package:practice_pal_mobile/presentation/pages/tests/view/view_test_page.dart';
import 'package:practice_pal_mobile/presentation/widgets/containers/colored_text_container.dart';
import 'package:practice_pal_mobile/presentation/widgets/containers/refreshable_body.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/loading_dialog.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/error_info.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/info_column.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/no_data_info.dart';
import 'package:practice_pal_mobile/services/api/test_api_service.dart';

class TestsPage extends StatefulWidget {
  const TestsPage({super.key});

  @override
  State<TestsPage> createState() => _TestsPageState();
}

class _TestsPageState extends State<TestsPage> {
  late Future<List<Test>> _future;

  @override
  void initState() {
    _future = TestAPIService.allTests().onError(ExceptionHandler.trace);
    super.initState();
  }

  Future<void> _refresh() async {
    setState(() {
      _future = TestAPIService.allTests().onError(ExceptionHandler.trace);
    });
  }

  _generate() async {
    final test = await Get.to(() => GenerateTestPage(), fullscreenDialog: true);
    if (test != null && test is Test) {
      await _refresh();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Tests")),
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
                  final tests = snapshot.data!;
                  if (tests.isNotEmpty) {
                    return CustomScrollView(
                      shrinkWrap: true,
                      physics: NeverScrollableScrollPhysics(),
                      slivers: [
                        SliverAppBar(
                          leading: Text(""),
                          expandedHeight: 100,
                          flexibleSpace: FlexibleSpaceBar(
                            background: InfoColumn(
                                label: "Number of Tests", value: tests.length),
                          ),
                        ),
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.all(10),
                            child: ListView.builder(
                                shrinkWrap: true,
                                itemCount: tests.length,
                                physics: NeverScrollableScrollPhysics(),
                                itemBuilder: (context, index) {
                                  final test = tests[index];
                                  return Card(
                                    child: ListTile(
                                      onTap: () => Get.to(
                                          () => ViewTestPage(test.id),
                                          fullscreenDialog: true),
                                      title: Text(test.title),
                                      subtitle: Text(
                                          "No. of questions: ${test.questions.length}"),
                                      trailing: ColoredTextContainer(
                                          text: test.difficulty.text,
                                          color: test.difficulty.color),
                                    ),
                                  );
                                }),
                          ),
                        )
                      ],
                    );
                  } else {
                    return NoDataInfo("You haven’t created any test(s) yet!");
                  }
                }
              })),
      floatingActionButton: FloatingActionButton(
        onPressed: _generate,
        child: Icon(Icons.add),
      ),
    );
  }
}
