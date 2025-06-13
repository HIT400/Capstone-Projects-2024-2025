import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/presentation/widgets/logo.dart';

import '../../../services/utils/app_launcher_manager.dart';
import '../../widgets/btns/btn.dart';
import '../../widgets/btns/outline_btn.dart';
import '../auth/signin/signin_controller.dart';
import '../auth/signup/signup_controller.dart';

class WelcomePage extends StatefulWidget {
  const WelcomePage({super.key});

  @override
  State<WelcomePage> createState() => _WelcomePageState();
}

class _WelcomePageState extends State<WelcomePage> {
  String message = "";

  _init() async {
    message = await AppLaunchManager.welcomeMessage();
  }

  @override
  void initState() {
    super.initState();
    _init();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(message)),
      body: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          PracticePal(),
          Column(children: [
            Button(
                label: "Sign In", onPressed: () => Get.to(() => SignInPage())),
            OutlineBtn(
                label: "Sign Up", onPressed: () => Get.to(() => SignUpPage()))
          ]),
        ],
      ),
    );
  }
}
