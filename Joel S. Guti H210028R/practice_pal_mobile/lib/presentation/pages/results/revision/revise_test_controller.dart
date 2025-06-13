import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/data/exceptions/exception_handler.dart';
import 'package:practice_pal_mobile/data/models/test_model.dart';
import 'package:practice_pal_mobile/presentation/pages/results/revision/revise_test_view.dart';
import 'package:practice_pal_mobile/presentation/pages/tests/take/take_test_controller.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/decision_dialog.dart';
import 'package:practice_pal_mobile/services/api/test_api_service.dart';

class ReviseTestPage extends StatefulWidget {
  final int id;
  const ReviseTestPage(this.id, {super.key});

  @override
  ReviseTestController createState() => ReviseTestController();
}

class ReviseTestController extends State<ReviseTestPage> {
  late Future<Revision> future;
  late Revision revision;

  @override
  void initState() {
    future = TestAPIService.revise(widget.id).onError(ExceptionHandler.trace);
    super.initState();
  }

  Future<void> refresh() async {
    setState(() {
      future = TestAPIService.revise(widget.id).onError(ExceptionHandler.trace);
    });
  }

  retake() async {
    try {
      final res = await Get.dialog(DecisionDialog(
          title: "New Attempt",
          content: "Want to try the test again?",
          label: "Retake Now"));
      if (res) {
        Get.off(() => TakeTestPage(revision.test), fullscreenDialog: true);
      }
    } on Exception catch (e) {
      ExceptionHandler.show(e);
    }
  }

  @override
  Widget build(BuildContext context) => ReviseTestView(this);
}