import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:practice_pal_mobile/consts/colors.dart';
import 'package:practice_pal_mobile/consts/styles.dart';
import 'package:practice_pal_mobile/data/abstract/widget_view.dart';
import 'package:practice_pal_mobile/presentation/pages/courses/view/view_course_controller.dart';
import 'package:practice_pal_mobile/presentation/widgets/btns/action_btn.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/loading_dialog.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/error_info.dart';

class ViewCourseView extends WidgetView<ViewCoursePage, ViewCourseController> {
  const ViewCourseView(super.state, {super.key});

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !state.reload,
      onPopInvoked: state.onPopInvoked,
      child: Scaffold(
        appBar: AppBar(
          title: Text("Course Overview"),
          actions: [
            ActionBtn(actions: [
              PopupAction(
                  label: "Update Course", onTap: state.update),
              PopupAction(
                  label: "Delete Course",
                  onTap: state.delete,
                  color: Colors.red),
            ])
          ],
        ),
        body: FutureBuilder(
            future: state.future,
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return Loading();
              } else if (snapshot.hasError) {
                return ErrorInfo(snapshot.error!);
              } else {
                final course = snapshot.data!;
                state.course = course;
                return Scaffold(
                  body: CustomScrollView(
                      shrinkWrap: true,
                      physics: NeverScrollableScrollPhysics(),
                      slivers: [
                        SliverAppBar(
                            expandedHeight: 125,
                            leading: Text(""),
                            flexibleSpace: FlexibleSpaceBar(
                              background: Center(
                                child: Column(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceEvenly,
                                    children: [
                                      Text(course.title,
                                          textAlign: TextAlign.center,
                                          style: Styles.headlineMedium
                                              .copyWith(color: Colors.white)),
                                      Text(
                                        course.levelName,
                                        style: Styles.titleSmall.copyWith(
                                            color: AppColors.secondary),
                                      )
                                    ]),
                              ),
                            )),
                        SliverToBoxAdapter(
                          child: ListView(shrinkWrap: true, children: [
                            Padding(
                              padding: const EdgeInsets.all(10),
                              child: Text(course.description),
                            ),
                            Divider(),
                            ListView.builder(
                                shrinkWrap: true,
                                physics: NeverScrollableScrollPhysics(),
                                itemCount: course.topics.length,
                                itemBuilder: (context, index) {
                                  final topic = course.topics[index];
                                  return ListTile(
                                    leading: Text(
                                      topic.index.toString(),
                                      style: Styles.titleMedium
                                          .copyWith(color: AppColors.tertiary),
                                    ),
                                    title: Text(topic.name),
                                  );
                                })
                          ]),
                        )
                      ]),
                  floatingActionButton: FloatingActionButton.extended(
                    onPressed: () => state.generate(course),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10)),
                    icon: Icon(FontAwesomeIcons.gear),
                    label: Text("Generate Test"),
                  ),
                );
              }
            }),
      ),
    );
  }
}
