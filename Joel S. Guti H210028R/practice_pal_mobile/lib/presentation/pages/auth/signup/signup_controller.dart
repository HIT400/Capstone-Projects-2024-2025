import 'package:flutter/material.dart';

import '../../../../services/api/auth_api_service.dart';
import '../../../../services/providers/form_field_validator_provider.dart';
import 'signup_view.dart';

class SignUpPage extends StatefulWidget {
  const SignUpPage({super.key});

  @override
  SignUpController createState() => SignUpController();
}

class SignUpController extends State<SignUpPage> {
  final globalKey = GlobalKey<FormState>();
  final provider = FormValidatorProvider();

  final name = TextEditingController();
  final email = TextEditingController();
  final password = TextEditingController();

  void signUp() async {
    if(globalKey.currentState!.validate()) {
      final payload = {
        "fullName": name.text.trim(),
        "email": email.text.trim(),
        "password": password.text.trim(),
        "role": "STUDENT"
      };
      await AuthenticationAPIService.signUp(payload);
    }
  }

  @override
  Widget build(BuildContext context) => SignUpView(this);}