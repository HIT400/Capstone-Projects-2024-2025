import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/cache.dart';
import 'package:practice_pal_mobile/data/enums/level_enum.dart';
import 'package:practice_pal_mobile/presentation/pages/courses/create/create_course_view.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/decision_dialog.dart';
import 'package:practice_pal_mobile/services/api/course_api_service.dart';
import 'package:practice_pal_mobile/services/providers/form_field_validator_provider.dart';

class CreateCoursePage extends StatefulWidget {
  const CreateCoursePage({super.key});

  @override
  CreateCourseController createState() => CreateCourseController();
}

class CreateCourseController extends State<CreateCoursePage> {
  final globalKey = GlobalKey<FormState>();
  final provider = FormValidatorProvider();

  final name = TextEditingController();
  final levelName = TextEditingController();
  Level? level;

  onSelect(value) {
    setState(() {
      level = levels.firstWhereOrNull((level) => level.name == value);
    });
  }

  create() async {
    if (globalKey.currentState!.validate()) {
      final res = await Get.dialog(DecisionDialog(
        title: "Build This Course",
        content: "Ready to build your course now?",
        label: "Start Building",
      ));

      if (res) {
        final payload = {
          "courseName": name.text.trim(),
          "level": level!.type
        };
        await CourseAPIService.create(payload);
      }
    }
  }

  @override
  Widget build(BuildContext context) => CreateCourseView(this);
}
