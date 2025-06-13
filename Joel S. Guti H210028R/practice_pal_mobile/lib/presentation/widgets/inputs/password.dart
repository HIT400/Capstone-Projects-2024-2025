import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import '../../../services/providers/form_field_validator_provider.dart';

class PasswordInput extends StatefulWidget {
  final String label;
  final String hint;
  final IconData icon;
  final TextInputType type;
  final TextEditingController controller;
  final bool strong;

  const PasswordInput(
      {super.key,
      this.label = "Password",
      this.hint = "",
      this.icon = Icons.lock,
      this.type = TextInputType.text,
      required this.controller,
      this.strong = true});

  @override
  State<PasswordInput> createState() => _PasswordInputState();
}

class _PasswordInputState extends State<PasswordInput> {
  bool obscure = true;

  void toggle() {
    setState(() {
      obscure = !obscure;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(10),
      child: TextFormField(
        initialValue: null,
        controller: widget.controller,
        keyboardType: widget.type,
        validator: widget.strong
            ? FormValidatorProvider().validatePassword
            : (value) => FormValidatorProvider()
                .validateField(value, "Password required"),
        obscureText: obscure,
        decoration: InputDecoration(
            label: Text(widget.label),
            hintText: widget.hint,
            prefixIcon: Icon(widget.icon),
            suffixIcon: IconButton(
                onPressed: toggle,
                icon: Icon(
                    obscure ? FontAwesomeIcons.eye : FontAwesomeIcons.eyeSlash,
                    color: Colors.grey[600]))),
      ),
    );
  }
}
