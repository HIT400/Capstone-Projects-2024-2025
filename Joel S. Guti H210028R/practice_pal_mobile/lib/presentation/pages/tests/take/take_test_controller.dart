import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/data/exceptions/exception_handler.dart';
import 'package:practice_pal_mobile/data/models/answer_model.dart';
import 'package:practice_pal_mobile/data/models/test_model.dart';
import 'package:practice_pal_mobile/presentation/pages/results/view/view_test_results_page.dart';
import 'package:practice_pal_mobile/presentation/pages/tests/take/take_test_view.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/decision_dialog.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/quit_dialog.dart';
import 'package:practice_pal_mobile/services/api/test_api_service.dart';
import 'package:practice_pal_mobile/services/utils/global_utils.dart';

class TakeTestPage extends StatefulWidget {
  final Test test;

  const TakeTestPage(this.test, {super.key});

  @override
  TakeTestController createState() => TakeTestController();
}

class TakeTestController extends State<TakeTestPage> {
  late final Test test;
  List<Answer> answers = [];

  @override
  void initState() {
    test = widget.test;
    super.initState();
  }

  onSelect(Answer answer) {
    setState(() {
      if (answers.firstWhereOrNull((ans) => ans.id == answer.id) != null) {
        answers.removeWhere((ans) => ans.id == answer.id);
      }
      answers.add(answer);
    });
    printLog(answers);
  }

  submit() async {
    try {
      final res = await Get.dialog(DecisionDialog(
        title: "Finish Test",
        content: answers.length == test.questions.length
            ? "Ready to turn in your answers?"
            : "Looks like you missed a few. Submit anyway?",
        label: "Turn In",
      ));
      if (res) {
        final payload = {
          "testId": test.id,
          "responses": answers
              .map((ans) => {
                    "id": ans.id,
                    "answer": ans.answer,
                  })
              .toList()
        };
        final results = await TestAPIService.attempt(payload);
        Get.off(() => ViewTestResultsPage(results), fullscreenDialog: true);
      }
    } on Exception catch (e) {
      ExceptionHandler.show(e);
    }
  }

  onPopInvoked(canPop) async {
    if (canPop) return;
    final res = await Get.dialog(
        QuitDialog(title: "Quit Test", content: "Are you sure?"));
    if (res) {
      Get.back();
    }
  }

  @override
  Widget build(BuildContext context) => TakeTestView(this);
}
