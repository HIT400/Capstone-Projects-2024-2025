import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:practice_pal_mobile/consts/images.dart';
import 'package:practice_pal_mobile/data/abstract/widget_view.dart';
import 'package:practice_pal_mobile/data/extensions/courses_extension.dart';
import 'package:practice_pal_mobile/presentation/pages/tests/generate/generate_test_controller.dart';
import 'package:practice_pal_mobile/presentation/widgets/btns/btn.dart';
import 'package:practice_pal_mobile/presentation/widgets/containers/body.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/loading_dialog.dart';
import 'package:practice_pal_mobile/presentation/widgets/gap.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/error_info.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/form_page_info.dart';
import 'package:practice_pal_mobile/presentation/widgets/inputs/dropdown_input.dart';
import 'package:practice_pal_mobile/presentation/widgets/inputs/input.dart';

class GenerateTestView
    extends WidgetView<GenerateTestPage, GenerateTestController> {
  const GenerateTestView(super.state, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Generate Test")),
      body: FutureBuilder(
          future: state.future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return Loading();
            } else if (snapshot.hasError) {
              return ErrorInfo(snapshot.error!);
            } else {
              final courses = snapshot.data!;
              return RefreshIndicator(
                onRefresh: state.refresh,
                child: Body(
                  children: [
                    FormPageInfo(
                      image: Images.createFile,
                      title: "Generate New Test",
                      content:
                          "Enter your info below and let the app generate a test just for you.",
                    ),
                    Form(
                        key: state.globalKey,
                        child: Column(children: [
                          DropdownInput(
                              icon: FontAwesomeIcons.book,
                              label: "Select Course",
                              validator: (value) => state.provider
                                  .validateField(value, "Course required"),
                              value: state.selectedCourse?.title,
                              items: courses.items,
                              onChanged: state.widget.course == null
                                  ? (value) =>
                                      state.onSelectCourse(value, courses)
                                  : null),
                          Input(
                              icon: FontAwesomeIcons.pencil,
                              label: "Test Name",
                              controller: state.testName),
                          Row(children: [
                            Expanded(
                              child: DropdownInput(
                                icon: FontAwesomeIcons.hashtag,
                                label: "No. of Questions",
                                validator: state.provider.validate,
                                items: ["5", "10", "15", "20", "25"],
                                onChanged: state.onSelectCount,
                              ),
                            ),
                            Expanded(
                                child: DropdownInput(
                                    icon: FontAwesomeIcons.signal,
                                    label: "Difficulty",
                                    validator: !state.isPastPapers
                                        ? state.provider.validate
                                        : null,
                                    items: !state.isPastPapers
                                        ? [
                                            "EASY",
                                            "MEDIUM",
                                            "HARD",
                                            "VERY HARD"
                                          ]
                                        : [],
                                    onChanged: state.onSelectDifficulty))
                          ]),
                          OutlinedButton.icon(
                              onPressed: state.selectedCourse != null &&
                                      !state.isPastPapers
                                  ? state.onSelectTopics
                                  : null,
                              icon: Icon(FontAwesomeIcons.fileLines),
                              label: Text(state.selectedTopics.isEmpty
                                  ? "Select Topics"
                                  : "${state.selectedTopics.length} Selected Topics"))
                        ])),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Checkbox(
                            value: state.isPastPapers, onChanged: state.toggle),
                        Text("Use past test questions?")
                      ],
                    ),
                    Gap(),
                    Button(label: "Generate", onPressed: state.generate)
                  ],
                ),
              );
            }
          }),
    );
  }
}
