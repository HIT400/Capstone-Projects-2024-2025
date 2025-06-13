import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/cache.dart';
import 'package:practice_pal_mobile/consts/colors.dart';
import 'package:practice_pal_mobile/consts/styles.dart';
import 'package:practice_pal_mobile/presentation/pages/profile/profile_page.dart';
import 'package:practice_pal_mobile/presentation/pages/results/test_results_page.dart';
import 'package:practice_pal_mobile/presentation/widgets/btns/action_btn.dart';
import 'package:practice_pal_mobile/presentation/widgets/containers/refreshable_body.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/loading_dialog.dart';
import 'package:practice_pal_mobile/presentation/widgets/drawers/main_drawer.dart';
import 'package:practice_pal_mobile/presentation/widgets/gap.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/circle_progress_bar_info.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/error_info.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/info_card.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/list_title.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/score_status_info.dart';
import 'package:practice_pal_mobile/services/api/auth_api_service.dart';
import 'package:practice_pal_mobile/services/utils/date_time_utils.dart';
import 'package:practice_pal_mobile/services/utils/dialog_utils.dart';

import '../../../data/abstract/widget_view.dart';
import 'home_controller.dart';

class HomeView extends WidgetView<HomePage, HomeController> {
  const HomeView(super.state, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Home"),
        actions: [
          ActionBtn(
              actions: [
                PopupAction(
                    label: "Profile", onTap: () => Get.to(() => ProfilePage())),
                PopupAction(
                    label: "Sign Out",
                    onTap: AuthenticationAPIService.signout,
                    color: Colors.red),
              ],
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: CircleAvatar(
                    backgroundColor: AppColors.secondary,
                    child: Text(
                      mainUser.initials,
                      style: TextStyle(color: Colors.white),
                    )),
              ))
        ],
      ),
      drawer: MainDrawer(),
      body: RefreshableBody(
          onRefresh: state.refresh,
          child: FutureBuilder(
              future: state.future,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return Loading();
                } else if (snapshot.hasError) {
                  return ErrorInfo(snapshot.error!, onRetry: state.refresh);
                } else {
                  final dashboard = snapshot.data!;
                  return CustomScrollView(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    slivers: [
                      SliverAppBar(
                          expandedHeight: 150,
                          leading: Text(""),
                          flexibleSpace: FlexibleSpaceBar(
                            background: Column(
                                mainAxisAlignment:
                                    MainAxisAlignment.spaceEvenly,
                                children: [
                                  Text(DateTimeUtils.greetings(),
                                      style: Styles.titleLarge.copyWith(
                                          color: AppColors.secondary)),
                                  Text(dashboard.studentName,
                                      style: Styles.displayMedium
                                          .copyWith(color: Colors.white)),
                                ]),
                          )),
                      SliverToBoxAdapter(
                          child: Column(
                        children: [
                          Gap(),
                          Stack(alignment: Alignment.topRight, children: [
                            Card(child: Padding(
                              padding: const EdgeInsets.all(8.0),
                              child: Column(children: [
                                CircleProgressBarInfo(
                                  value: dashboard.avgScore / 100,
                                  label: dashboard.percentage,
                                  color: dashboard.status.color,
                                  labelColor: Colors.black,
                                ),
                                Gap(),
                                Text("Average Test Score"),
                                Text.rich(
                                  TextSpan(text: "OVERALL STATUS: ", children: [
                                    TextSpan(
                                        text: dashboard.status.label,
                                        style: TextStyle(
                                            color: dashboard.status.color))
                                  ]),
                                  style: Styles.headlineSmall,
                                )
                              ]),
                            )),
                            IconButton(
                                onPressed: showScoresInfo,
                                icon: Icon(Icons.info_outline))
                          ]),
                          GridView(
                              shrinkWrap: true,
                              physics: NeverScrollableScrollPhysics(),
                              gridDelegate:
                                  SliverGridDelegateWithFixedCrossAxisCount(
                                      crossAxisCount: 2),
                              children: [
                                InfoCard(
                                    label: "No. of Courses",
                                    value: dashboard.noOfCourses),
                                InfoCard(
                                    label: "No. of Tests",
                                    value: dashboard.noOfTests),
                              ]),
                          Divider(),
                        ],
                      )),
                      SliverToBoxAdapter(
                        child: Column(
                          children: [
                            Gap(),
                            ListTitle(
                                title: "Average Scores per Course",
                                page: null),
                            GridView.builder(
                                shrinkWrap: true,
                                physics: NeverScrollableScrollPhysics(),
                                itemCount: dashboard.courseAverages.length,
                                gridDelegate:
                                    SliverGridDelegateWithFixedCrossAxisCount(
                                        crossAxisCount: 3),
                                itemBuilder: (context, index) {
                                  final courseAverage =
                                      dashboard.courseAverages[index];
                                  return Card(
                                    child: Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.spaceEvenly,
                                      children: [
                                        Text(
                                          courseAverage.percentage,
                                          style: Styles.headlineMedium.copyWith(
                                              color: courseAverage.status.color),
                                        ),
                                        Padding(
                                          padding: const EdgeInsets.all(5),
                                          child: Text(
                                            courseAverage.course,
                                            textAlign: TextAlign.center,
                                            maxLines: 2,
                                          ),
                                        )
                                      ],
                                    ),
                                  );
                                }),

                            if (dashboard.courseAverages.isEmpty)
                              Padding(
                                padding: const EdgeInsets.all(10),
                                child: Text("No course where found!"),
                              ),
                            Gap(),
                            Divider()
                          ],
                        )),
                      SliverToBoxAdapter(
                        child: Column(
                          children: [
                            ListTitle(
                                title: "Recent Test Results",
                                page: TestResultsPage()),
                            Card(
                              child: ListView.builder(
                                  shrinkWrap: true,
                                  physics: NeverScrollableScrollPhysics(),
                                  itemCount:
                                      dashboard.recentTestResults.length,
                                  itemBuilder: (context, index) {
                                    final result =
                                        dashboard.recentTestResults[index];
                                    return ListTile(
                                      title: Text(result.title),
                                      subtitle: Text(result.date),
                                      trailing: ScoreStatusInfo(result),
                                    );
                                  }),
                            ),

                            if (dashboard.recentTestResults.isEmpty)
                              Padding(
                                padding: const EdgeInsets.all(10),
                                child: Text("You haven’t taken any tests yet."),
                              ),
                            Gap(size: .1)
                          ],
                        ),
                      )
                    ],
                  );
                }
              })),
    );
  }
}
