import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/consts/colors.dart';
import 'package:practice_pal_mobile/consts/styles.dart';
import 'package:practice_pal_mobile/data/exceptions/exception_handler.dart';
import 'package:practice_pal_mobile/data/models/course_model.dart';
import 'package:practice_pal_mobile/presentation/pages/courses/create/create_course_controller.dart';
import 'package:practice_pal_mobile/presentation/pages/courses/custom/custom_course_controller.dart';
import 'package:practice_pal_mobile/presentation/pages/courses/view/view_course_controller.dart';
import 'package:practice_pal_mobile/presentation/widgets/btns/action_btn.dart';
import 'package:practice_pal_mobile/presentation/widgets/containers/colored_text_container.dart';
import 'package:practice_pal_mobile/presentation/widgets/containers/refreshable_body.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/loading_dialog.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/error_info.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/info_column.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/no_data_info.dart';
import 'package:practice_pal_mobile/services/api/course_api_service.dart';

class CoursesPage extends StatefulWidget {
  const CoursesPage({super.key});

  @override
  State<CoursesPage> createState() => _CoursesPageState();
}

class _CoursesPageState extends State<CoursesPage> {
  late Future<List<Course>> _future;

  @override
  void initState() {
    _future = CourseAPIService.all().onError(ExceptionHandler.trace);
    super.initState();
  }

  Future<void> _refresh() async {
    setState(() {
      _future = CourseAPIService.all().onError(ExceptionHandler.trace);
    });
  }

  _get(id) async {
    final res = await Get.to(() => ViewCoursePage(id), fullscreenDialog: true);
    if (res != null && res) {
      await _refresh();
    }
  }

  _create() async {
    final res = await Get.to(() => CreateCoursePage(), fullscreenDialog: true);
    if (res != null && res) {
      await _refresh();
    }
  }

  _createCustom() async {
    final res =
        await Get.to(() => CreateCustomCoursePage(), fullscreenDialog: true);
    if (res != null && res) {
      await _refresh();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Courses"), actions: [
        ActionBtn(actions: [
          PopupAction(label: "Create Course (AI)", onTap: _create),
          PopupAction(label: "Create Custom Course", onTap: _createCustom),
        ])
      ]),
      body: RefreshableBody(
          onRefresh: _refresh,
          child: FutureBuilder(
              future: _future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return Loading();
                } else if (snapshot.hasError) {
                  return ErrorInfo(snapshot.error!);
                } else {
                  final courses = snapshot.data;
                  if (courses != null && courses.isNotEmpty) {
                    return CustomScrollView(
                      shrinkWrap: true,
                      physics: NeverScrollableScrollPhysics(),
                      slivers: [
                        SliverAppBar(
                          leading: Text(""),
                          expandedHeight: 100,
                          flexibleSpace: FlexibleSpaceBar(
                            background: InfoColumn(
                                label: "Number of Courses",
                                value: courses.length),
                          ),
                        ),
                        SliverToBoxAdapter(
                          child: Padding(
                            padding: const EdgeInsets.all(8.0),
                            child: ListView.builder(
                                shrinkWrap: true,
                                itemCount: courses.length,
                                physics: NeverScrollableScrollPhysics(),
                                itemBuilder: (context, index) {
                                  final course = courses[index];
                                  return Card(
                                    child: ListTile(
                                      onTap: () => _get(course.id),
                                      title: Text(course.title),
                                      titleTextStyle: Styles.titleLarge,
                                      subtitle: Text(course.description,
                                          maxLines: 2,
                                          overflow: TextOverflow.ellipsis),
                                      trailing: ColoredTextContainer(
                                          text:
                                              "${course.topics.length} Topics",
                                          color: AppColors.tertiary),
                                    ),
                                  );
                                }),
                          ),
                        )
                      ],
                    );
                  } else {
                    return NoDataInfo("You haven’t added any courses yet!");
                  }
                }
              })),
      floatingActionButton: FloatingActionButton(
        onPressed: _create,
        child: Icon(Icons.add),
      ),
    );
  }
}
