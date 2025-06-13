import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/cache.dart';
import 'package:practice_pal_mobile/data/enums/course_category_enum.dart';
import 'package:practice_pal_mobile/data/enums/level_enum.dart';
import 'package:practice_pal_mobile/data/models/course_model.dart';
import 'package:practice_pal_mobile/presentation/pages/courses/custom/custom_course_view.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/decision_dialog.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/exception_dialog.dart';
import 'package:practice_pal_mobile/services/api/course_api_service.dart';
import 'package:practice_pal_mobile/services/providers/form_field_validator_provider.dart';

class CreateCustomCoursePage extends StatefulWidget {
  const CreateCustomCoursePage({super.key});

  @override
  CustomCourseController createState() => CustomCourseController();
}

class CustomCourseController extends State<CreateCustomCoursePage> {
  final globalKey = GlobalKey<FormState>();
  final provider = FormValidatorProvider();

  final title = TextEditingController();
  final description = TextEditingController();
  final levelName = TextEditingController();
  final List<TextEditingController> topics = [];
  Level? level;
  CourseCategory? category;

  onSelect(value) {
    setState(() {
      level = levels.firstWhereOrNull((level) => level.name == value);
    });
  }

  addTopic() {
    setState(() {
      topics.add(TextEditingController());
    });
  }

  create() async {
    topics.removeWhere((controller) => controller.text.isEmpty);
    if (globalKey.currentState!.validate() && topics.length > 3) {
      final res = await Get.dialog(DecisionDialog(
        title: "Design Your Course",
        content: "Want to go ahead and build your own course?",
        label: "Create Now",
      ));
      if (res) {
        final course = Course(
            title: title.text,
            description: description.text,
            category: category,
            level: level!,
            topics: topics
                .map((topic) =>
                    Topic(index: topics.indexOf(topic) + 1, name: topic.text))
                .toList());
        await CourseAPIService.createCustom(course.toJson());
      }
    }

    if (topics.length < 3) {
      Get.dialog(ExceptionDialog(
          title: "Not Enough Topics",
          message: "A course needs at least 3 topics to be valid."));
    }
  }

  @override
  Widget build(BuildContext context) => CustomCourseView(this);
}
