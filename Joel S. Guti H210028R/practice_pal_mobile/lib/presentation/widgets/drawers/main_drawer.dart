import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/consts/colors.dart';
import 'package:practice_pal_mobile/presentation/pages/courses/courses_page.dart';
import 'package:practice_pal_mobile/presentation/pages/home/home_controller.dart';
import 'package:practice_pal_mobile/presentation/pages/results/test_results_page.dart';
import 'package:practice_pal_mobile/presentation/pages/tests/tests_page.dart';

import '../../../consts/styles.dart';
import '../../../cache.dart';
import '../../../services/api/auth_api_service.dart';
import '../../pages/profile/profile_page.dart';

class MainDrawer extends StatelessWidget {
  const MainDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Column(
        children: [
          UserAccountsDrawerHeader(
              currentAccountPicture: CircleAvatar(
                backgroundColor: AppColors.secondary,
                child: Text(
                  mainUser.initials,
                  style: TextStyle(color: Colors.white),
                ),
              ),
              accountName: Text(mainUser.username,
                  style: Styles.titleLarge.copyWith(color: Colors.white)),
              accountEmail: Text(
                mainUser.email,
                style: TextStyle(color: Colors.grey[200]),
              )),
          ListTile(
            onTap: () => Get.offAll(() => HomePage()),
            leading:
                const Icon(FontAwesomeIcons.house, color: AppColors.tertiary),
            tileColor: Colors.transparent,
            title: const Text("Home"),
          ),
          ListTile(
            onTap: () => Get.to(() => CoursesPage()),
            leading:
                const Icon(FontAwesomeIcons.book, color: AppColors.tertiary),
            tileColor: Colors.transparent,
            title: const Text("Courses"),
          ),
          ListTile(
            onTap: () => Get.to(() => TestsPage()),
            leading:
                const Icon(FontAwesomeIcons.pencil, color: AppColors.tertiary),
            tileColor: Colors.transparent,
            title: const Text("Tests"),
          ),
          ListTile(
            onTap: () => Get.to(() => TestResultsPage()),
            leading:
                const Icon(FontAwesomeIcons.percent, color: AppColors.tertiary),
            tileColor: Colors.transparent,
            title: const Text("Results"),
          ),
          const Divider(),
          ListTile(
            onTap: () => Get.to(() => const ProfilePage()),
            leading: const Icon(FontAwesomeIcons.solidCircleUser,
                color: AppColors.tertiary),
            tileColor: Colors.transparent,
            title: const Text("Profile"),
          ),
          ListTile(
            onTap: AuthenticationAPIService.signout,
            leading: const Icon(Icons.logout, color: Colors.red),
            tileColor: Colors.transparent,
            title: const Text("Sign Out"),
            titleTextStyle: Styles.bodyLarge.copyWith(color: Colors.red),
          ),
        ],
      ),
    );
  }
}
