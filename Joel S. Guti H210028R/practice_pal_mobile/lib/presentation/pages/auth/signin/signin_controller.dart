import 'package:flutter/material.dart';

import '../../../../services/api/auth_api_service.dart';
import '../../../../services/providers/form_field_validator_provider.dart';
import 'signin_view.dart';

class SignInPage extends StatefulWidget {
  const SignInPage({super.key});

  @override
  SignInController createState() => SignInController();
}

class SignInController extends State<SignInPage> {
  final globalKey = GlobalKey<FormState>();
  final provider = FormValidatorProvider();

  final email = TextEditingController(text: "student@example.com");
  final password = TextEditingController(text: "pass123");

  void signIn() async {
    if(globalKey.currentState!.validate()) {
      final payload = {
        "email": email.text.trim(),
        "password": password.text.trim()
      };
      await AuthenticationAPIService.signIn(payload);
    }
  }

  @override
  Widget build(BuildContext context) => SignInView(this);
}