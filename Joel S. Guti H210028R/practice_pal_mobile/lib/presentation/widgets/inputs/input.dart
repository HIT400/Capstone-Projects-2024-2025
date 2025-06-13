import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class Input extends StatelessWidget {
  final String label;
  final String hint;
  final Widget? prefix;
  final IconData icon;
  final TextInputType type;
  final List<TextInputFormatter>? inputFormatters;
  final FormFieldValidator<String>? validator;
  final TextEditingController controller;

  const Input({
    super.key,
    required this.icon,
    required this.label,
    this.hint = "",
    this.type = TextInputType.text,
    this.validator,
    required this.controller,
    this.prefix,
    this.inputFormatters,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(10),
      child: TextFormField(
        initialValue: null,
        controller: controller,
        keyboardType: type,
        validator: validator,
        textCapitalization: TextCapitalization.sentences,
        inputFormatters: inputFormatters,
        decoration: InputDecoration(
            label: Text(label),
            hintText: hint,
            prefixIcon: prefix ?? Icon(icon)),
      ),
    );
  }
}
