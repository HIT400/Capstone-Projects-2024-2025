import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:practice_pal_mobile/consts/colors.dart';
import 'package:practice_pal_mobile/consts/styles.dart';
import 'package:practice_pal_mobile/data/exceptions/exception_handler.dart';
import 'package:practice_pal_mobile/data/models/user_model.dart';
import 'package:practice_pal_mobile/presentation/widgets/btns/list_tile_btn.dart';
import 'package:practice_pal_mobile/presentation/widgets/containers/refreshable_body.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/loading_dialog.dart';
import 'package:practice_pal_mobile/presentation/widgets/gap.dart';
import 'package:practice_pal_mobile/presentation/widgets/info/error_info.dart';
import 'package:practice_pal_mobile/services/api/auth_api_service.dart';
import 'package:practice_pal_mobile/services/api/student_api_service.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  late Future<User> _future;

  @override
  void initState() {
    _future = StudentAPIService.student().onError(ExceptionHandler.trace);
    super.initState();
  }

  Future<void> _refresh() async {
    setState(() {
      _future = StudentAPIService.student().onError(ExceptionHandler.trace);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text("Profile"),
        actions: [
          IconButton(
              onPressed: AuthenticationAPIService.signout,
              icon: Icon(Icons.logout))
        ],
      ),
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
                  final user = snapshot.data!;
                  return CustomScrollView(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    slivers: [
                      SliverAppBar(
                        leading: Text(""),
                        expandedHeight: 100,
                        flexibleSpace: FlexibleSpaceBar(
                          background: Column(
                            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                            children: [
                              Text(user.username,
                                  style: Styles.headlineMedium
                                      .copyWith(color: Colors.white)),
                              Text(
                                user.email,
                                style: Styles.titleMedium
                                    .copyWith(color: AppColors.secondary),
                              )
                            ],
                          ),
                        ),
                      ),
                      SliverToBoxAdapter(
                          child: Column(
                        children: [
                          Gap(),
                          ListTileBtn(
                              onTap: null,
                              icon: FontAwesomeIcons.solidCircleUser,
                              label: "Edit Profile"),
                          ListTileBtn(
                              onTap: null,
                              icon: FontAwesomeIcons.lock,
                              label: "Change Password"),
                          Gap(),
                          ListTileBtn(
                              onTap: null,
                              icon: FontAwesomeIcons.trashCan,
                              color: Colors.red,
                              label: "Delete Account")
                        ],
                      ))
                    ],
                  );
                }
              })),
    );
  }
}
