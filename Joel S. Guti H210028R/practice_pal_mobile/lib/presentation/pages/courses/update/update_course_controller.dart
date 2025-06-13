import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/cache.dart';
import 'package:practice_pal_mobile/data/enums/course_category_enum.dart';
import 'package:practice_pal_mobile/data/enums/level_enum.dart';
import 'package:practice_pal_mobile/data/models/course_model.dart';
import 'package:practice_pal_mobile/presentation/pages/courses/update/update_course_view.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/decision_dialog.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/exception_dialog.dart';
import 'package:practice_pal_mobile/services/api/course_api_service.dart';
import 'package:practice_pal_mobile/services/providers/form_field_validator_provider.dart';

class UpdateCoursePage extends StatefulWidget {
  final Course course;

  const UpdateCoursePage(this.course, {super.key});

  @override
  UpdateCourseController createState() => UpdateCourseController();
}

class UpdateCourseController extends State<UpdateCoursePage> {
  late final Course course;
  late Level level;
  late CourseCategory? category;

  final globalKey = GlobalKey<FormState>();
  final provider = FormValidatorProvider();

  final title = TextEditingController();
  final description = TextEditingController();
  final List<TextEditingController> topics = [];

  @override
  void initState() {
    course = widget.course;
    title.text = course.title;
    description.text = course.description;
    level = course.level;
    category = course.category;
    topics.addAll(List.of(
        course.topics.map((topic) => TextEditingController(text: topic.name))));
    super.initState();
  }

  onSelect(value) {
    setState(() {
      level = levels.firstWhere((level) => level.name == value);
    });
  }

  addTopic() {
    setState(() {
      topics.add(TextEditingController());
    });
  }

  update() async {
    topics.removeWhere((controller) => controller.text.isEmpty);
    if (globalKey.currentState!.validate() && topics.length > 3) {
      final res = await Get.dialog(DecisionDialog(
        title: "Confirm Changes",
        content: "Want to apply these changes?",
        label: "Update Now",
      ));
      if (res) {
        final updatedCourse = Course(
            id: course.id,
            title: title.text,
            description: description.text,
            level: level,
            category: category,
            topics: topics
                .map((topic) => Topic(
                index: topics.indexOf(topic) + 1,
                name: topic.text))
                .toList());
        await CourseAPIService.update(updatedCourse.toJson());
      }
    }

    if (topics.length < 3) {
      Get.dialog(ExceptionDialog(
          title: "Not Enough Topics",
          message: "A course needs at least 3 topics to be valid."));
    }
  }

  @override
  Widget build(BuildContext context) => UpdateCourseView(this);
}
