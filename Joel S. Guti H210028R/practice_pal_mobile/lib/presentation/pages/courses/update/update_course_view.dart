import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:practice_pal_mobile/cache.dart';
import 'package:practice_pal_mobile/consts/images.dart';
import 'package:practice_pal_mobile/data/abstract/widget_view.dart';
import 'package:practice_pal_mobile/presentation/pages/courses/update/update_course_controller.dart';
import 'package:practice_pal_mobile/presentation/widgets/btns/btn.dart';
import 'package:practice_pal_mobile/presentation/widgets/containers/body.dart';
import 'package:practice_pal_mobile/presentation/widgets/gap.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/form_page_info.dart';
import 'package:practice_pal_mobile/presentation/widgets/inputs/dropdown_input.dart';
import 'package:practice_pal_mobile/presentation/widgets/inputs/input.dart';
import 'package:practice_pal_mobile/presentation/widgets/inputs/multi_input.dart';

class UpdateCourseView
    extends WidgetView<UpdateCoursePage, UpdateCourseController> {
  const UpdateCourseView(super.state, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Update Course ${state.course.id}")),
      body: Body(children: [
        FormPageInfo(
            image: Images.editBook,
            title: "Revise Course Info",
            content: "Make updates to your course and save the changes with ease."),
        Form(
            key: state.globalKey,
            child: Column(
              children: [
                Input(
                    icon: FontAwesomeIcons.book,
                    label: "Title",
                    validator: (value) => state.provider
                        .validateField(value, "Course title required"),
                    controller: state.title),
                MultiInput(label: "Description", controller: state.description),
                DropdownInput(
                    icon: Icons.school,
                    label: "Level",
                    validator: (value) => state.provider
                        .validateField(value, "Course level required"),
                    items: levels.map((level) => level.name).toList(),
                    value: state.level.name,
                    onChanged: state.onSelect),
                Divider(),
                Text("Topics:"),
                ListView.builder(
                    shrinkWrap: true,
                    itemCount: state.topics.length,
                    physics: NeverScrollableScrollPhysics(),
                    itemBuilder: (context, index) {
                      final controller = state.topics[index];
                      return Input(
                          icon: FontAwesomeIcons.fileLines,
                          label: "Topic ${index + 1}",
                          validator: state.provider.validate,
                          controller: controller);
                    }),
                OutlinedButton(
                    onPressed: state.addTopic, child: Icon(Icons.add))
              ],
            )),
        Gap(),
        Button(label: "Update", onPressed: state.update)
      ]),
    );
  }
}
