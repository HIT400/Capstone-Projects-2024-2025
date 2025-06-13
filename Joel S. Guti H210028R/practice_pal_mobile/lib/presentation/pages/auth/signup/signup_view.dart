import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/presentation/widgets/btns/text_btn.dart';
import 'package:practice_pal_mobile/presentation/widgets/gap.dart';
import 'package:practice_pal_mobile/presentation/widgets/logo.dart';

import '../../../../data/abstract/widget_view.dart';
import '../../../widgets/btns/btn.dart';
import '../../../widgets/containers/body.dart';
import '../../../widgets/inputs/input.dart';
import '../../../widgets/inputs/password.dart';
import '../signin/signin_controller.dart';
import 'signup_controller.dart';

class SignUpView extends WidgetView<SignUpPage, SignUpController> {
  const SignUpView(super.state, {super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(title: const Text("Sign Up")),
        body: Body(
          children: [
            Logo(),
            Form(
                key: state.globalKey,
                child: Column(
                  children: [
                    Input(
                        label: "Full Name",
                        icon: Icons.person,
                        validator: state.provider.validateUsername,
                        controller: state.name),
                    Input(
                        label: "Email Address",
                        validator: state.provider.validateEmail,
                        icon: Icons.email,
                        type: TextInputType.emailAddress,
                        controller: state.email),
                    PasswordInput(controller: state.password)
                  ],
                )),
            Gap(),
            Button(label: "Sign Up", onPressed: state.signUp),
            TextBtn(
                text: "Already have an account?",
                label: "Sign In",
                onPressed: () => Get.off(() => SignInPage()))
          ],
        ));
  }
}
