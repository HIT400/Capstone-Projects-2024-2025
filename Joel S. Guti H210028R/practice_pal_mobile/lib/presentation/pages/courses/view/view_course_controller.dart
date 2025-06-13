import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/data/exceptions/exception_handler.dart';
import 'package:practice_pal_mobile/data/models/course_model.dart';
import 'package:practice_pal_mobile/data/models/test_model.dart';
import 'package:practice_pal_mobile/presentation/pages/courses/update/update_course_controller.dart';
import 'package:practice_pal_mobile/presentation/pages/courses/view/view_course_view.dart';
import 'package:practice_pal_mobile/presentation/pages/tests/generate/generate_test_controller.dart';
import 'package:practice_pal_mobile/presentation/pages/tests/take/take_test_controller.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/quit_dialog.dart';
import 'package:practice_pal_mobile/services/api/course_api_service.dart';

class ViewCoursePage extends StatefulWidget {
  final int id;

  const ViewCoursePage(this.id, {super.key});

  @override
  ViewCourseController createState() => ViewCourseController();
}

class ViewCourseController extends State<ViewCoursePage> {
  late Future<Course> future;
  bool reload = false;

  late Course course;

  @override
  void initState() {
    future = CourseAPIService.get(widget.id);
    super.initState();
  }

  Future<void> refresh() async {
    setState(() {
      future = CourseAPIService.get(widget.id);
    });
  }

  update() async {
    final res =
        await Get.to(() => UpdateCoursePage(course), fullscreenDialog: true);
    if (res != null && res) {
      setState(() => reload = true);
      await refresh();
    }
  }

  delete() async {
    final res = await Get.dialog(QuitDialog(
        title: "Erase Course",
        content: "You won’t be able to undo this. Delete anyway?",
        label: "Erase It"));
    if (res) {
      await CourseAPIService.delete(widget.id);
    }
  }

  generate(course) async {
    try {
      final test =
          await Get.to(() => GenerateTestPage(course: course), fullscreenDialog: true);
      if (test != null && test is Test) {
        Get.to(() => TakeTestPage(test), fullscreenDialog: true);
      }
    } on Exception catch (e) {
      ExceptionHandler.show(e);
    }
  }

  onPopInvoked(canPop) {
    if (canPop) return;
    Get.back(result: true);
  }

  @override
  Widget build(BuildContext context) => ViewCourseView(this);
}
