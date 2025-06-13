import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class PhoneInput extends StatelessWidget {
  final String label;
  final String hint;
  final List<TextInputFormatter>? inputFormatters;
  final FormFieldValidator<String>? validator;
  final TextEditingController controller;

  const PhoneInput(
      {super.key,
      this.label = "Phone Number",
      this.hint = "",
      this.validator,
      required this.controller,
      this.inputFormatters,});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(10),
      child: TextFormField(
        initialValue: null,
        controller: controller,
        keyboardType: TextInputType.phone,
        validator: validator,
        inputFormatters: inputFormatters,
        decoration: InputDecoration(
            label: Text(label),
            hintText: hint,
            prefixIcon: const Icon(Icons.phone)
        ),
      ),
    );
  }
}
