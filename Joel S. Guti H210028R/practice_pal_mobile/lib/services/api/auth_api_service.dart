import 'dart:convert';

import 'package:get/get.dart';
import 'package:practice_pal_mobile/cache.dart';
import 'package:practice_pal_mobile/data/models/user_model.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../consts/urls.dart';
import '../../data/exceptions/exception_handler.dart';
import '../../presentation/pages/auth/signin/signin_controller.dart';
import '../../presentation/pages/main/main_page.dart';
import '../../presentation/widgets/dialogs/quit_dialog.dart';
import 'api_service.dart';

class AuthenticationAPIService {
  static Future<void> signIn(payload) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final response =
          await APIService.authenticate(url: URLs.signin, payload: payload);
      final body = jsonDecode(response.body);
      final data = body["data"];
      prefs.setString("token", data["token"]);
      mainUser = User.fromJson(data["user"]);
      Get.offAll(() => const MainPage());
    } on Exception catch (e) {
      ExceptionHandler.show(e, title: "Sign In Failed");
    }
  }

  static Future<void> signUp(payload) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final response =
          await APIService.authenticate(url: URLs.signup, payload: payload);
      final body = jsonDecode(response.body);
      final data = body["data"];
      prefs.setString("token", body["token"]);
      mainUser = User.fromJson(data["user"]);
      Get.offAll(() => const MainPage());
    } on Exception catch (e) {
      ExceptionHandler.show(e, title: "Sign Up Failed");
    }
  }

  static void signout() async {
    final result = await Get.dialog(const QuitDialog(
      title: "Sign Out",
      content: "Are you sure you want to sign out?",
      label: "Sign Out",
    ));
    if (result) {
      Get.offAll(() => const SignInPage());
    }
  }
}
