import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:practice_pal_mobile/cache.dart';
import 'package:practice_pal_mobile/consts/images.dart';
import 'package:practice_pal_mobile/data/abstract/widget_view.dart';
import 'package:practice_pal_mobile/presentation/pages/courses/create/create_course_controller.dart';
import 'package:practice_pal_mobile/presentation/widgets/btns/btn.dart';
import 'package:practice_pal_mobile/presentation/widgets/containers/body.dart';
import 'package:practice_pal_mobile/presentation/widgets/gap.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/form_page_info.dart';
import 'package:practice_pal_mobile/presentation/widgets/inputs/dropdown_input.dart';
import 'package:practice_pal_mobile/presentation/widgets/inputs/input.dart';

class CreateCourseView
    extends WidgetView<CreateCoursePage, CreateCourseController> {
  const CreateCourseView(super.state, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Create Course")),
      body: Body(children: [
        FormPageInfo(
          image: Images.book,
          title: "Generate a Course",
          content: "Tell the app what your course is about, and it’ll build the rest for you.",
        ),
        Form(
            key: state.globalKey,
            child: Column(children: [
              Input(
                  icon: FontAwesomeIcons.book,
                  label: "Course Name",
                  validator: (value) => state.provider
                      .validateField(value, "Course name required"),
                  controller: state.name),
              DropdownInput(
                  icon: Icons.school,
                  label: "Level",
                  validator: (value) => state.provider
                      .validateField(value, "Course level required"),
                  items: levels.map((level) => level.name).toList(),
                  onChanged: state.onSelect)
            ])),
        Gap(),
        Button(label: "Generate", onPressed: state.create)
      ]),
    );
  }
}
