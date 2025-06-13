import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/presentation/pages/auth/signup/signup_controller.dart';
import 'package:practice_pal_mobile/presentation/widgets/btns/text_btn.dart';
import 'package:practice_pal_mobile/presentation/widgets/gap.dart';
import 'package:practice_pal_mobile/presentation/widgets/logo.dart';

import '../../../../data/abstract/widget_view.dart';
import '../../../widgets/btns/btn.dart';
import '../../../widgets/containers/body.dart';
import '../../../widgets/inputs/input.dart';
import '../../../widgets/inputs/password.dart';
import 'signin_controller.dart';

class SignInView extends WidgetView<SignInPage, SignInController> {
  const SignInView(super.state, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text("Sign In")),
        body: Body(
          children: [
            Logo(),
            Form(
                key: state.globalKey,
                child: Column(
                  children: [
                    Input(
                        label: "Email Address",
                        validator: state.provider.validateEmail,
                        icon: Icons.email,
                        controller: state.email),
                    PasswordInput(controller: state.password)
                  ],
                )),
            Gap(),
            Button(label: "Sign In", onPressed: state.signIn),
            TextBtn(
                text: "Don't have an account?",
                label: "Sign Up",
                onPressed: () => Get.off(() => SignUpPage()))
          ],
        ));
  }
}
