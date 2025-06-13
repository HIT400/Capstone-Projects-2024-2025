import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/data/exceptions/exception_handler.dart';
import 'package:practice_pal_mobile/data/extensions/courses_extension.dart';
import 'package:practice_pal_mobile/data/extensions/date_time_extension.dart';
import 'package:practice_pal_mobile/data/models/course_model.dart';
import 'package:practice_pal_mobile/presentation/pages/tests/generate/generate_test_view.dart';
import 'package:practice_pal_mobile/presentation/pages/tests/generate/select/select_topics_dialog.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/decision_dialog.dart';
import 'package:practice_pal_mobile/services/api/course_api_service.dart';
import 'package:practice_pal_mobile/services/api/test_api_service.dart';
import 'package:practice_pal_mobile/services/providers/form_field_validator_provider.dart';

class GenerateTestPage extends StatefulWidget {
  final Course? course;

  const GenerateTestPage({super.key, this.course});

  @override
  GenerateTestController createState() => GenerateTestController();
}

class GenerateTestController extends State<GenerateTestPage> {
  late Future<List<Course>> future;

  final globalKey = GlobalKey<FormState>();
  final provider = FormValidatorProvider();

  final testName = TextEditingController();
  String? count, difficulty;
  Course? selectedCourse;
  List<Topic> selectedTopics = [];
  bool isPastPapers = false;

  @override
  void initState() {
    selectedCourse = widget.course;
    if (selectedCourse != null) selectedTopics = selectedCourse!.topics;
    future = CourseAPIService.all();
    super.initState();
  }

  Future<void> refresh() async {
    setState(() {
      future = CourseAPIService.all();
    });
  }

  onSelectCourse(value, List<Course> list) {
    setState(() {
      selectedCourse = list.fromValue(value);
      selectedTopics = selectedCourse!.topics;
    });
  }

  onSelectCount(value) {
    setState(() {
      count = value;
    });
  }

  onSelectDifficulty(value) {
    setState(() {
      difficulty = value;
    });
  }

  onSelectTopics() async {
    final selected = await Get.dialog(SelectTopicsDialog(
        topics: selectedCourse!.topics, selectedTopics: selectedTopics));
    setState(() {
      selectedTopics = selected;
    });
  }

  toggle(value) {
    setState(() => isPastPapers = value);
  }

  generate() async {
    try {
      if (globalKey.currentState!.validate()) {
        if (testName.text.trim().isEmpty) {
          testName.text = "Test_${DateTime.now().uniqueDateCode}";
        }

        final res = await Get.dialog(DecisionDialog(
          title: "Generate Test",
          content: "Ready to generate your test now?",
          label: "Generate Now",
        ));
        if (res) {
          final payload = {
            "courseId": selectedCourse!.id,
            "testName": testName.text.trim(),
            "noOfQuestions": count,
            "difficulty": difficulty?.replaceAll(" ", "_"),
            "topics": selectedCourse!.topicsJson
          };
          final test = await TestAPIService.generate(payload, isPastPapers);
          Get.back(result: test);
        }
      }
    } on Exception catch (e) {
      ExceptionHandler.show(e);
    }
  }

  @override
  Widget build(BuildContext context) => GenerateTestView(this);
}
