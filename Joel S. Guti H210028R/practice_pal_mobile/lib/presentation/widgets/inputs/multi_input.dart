import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class MultiInput extends StatelessWidget {
  final String label;
  final String hint;
  final Widget? prefix;
  final TextInputType type;
  final List<TextInputFormatter>? inputFormatters;
  final FormFieldValidator<String>? validator;
  final TextEditingController controller;
  const MultiInput({
    super.key,
    required this.label,
    this.hint = "",
    this.type = TextInputType.text,
    this.validator,
    required this.controller,
    this.prefix, this.inputFormatters
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(10),
      child: Theme(
        data: ThemeData(
          inputDecorationTheme: InputDecorationTheme(
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10)
            )
          )
        ),
        child: TextField(
          controller: controller,
          keyboardType: type,
          inputFormatters: inputFormatters,
          textCapitalization: TextCapitalization.sentences,
          maxLines: 3,
          decoration: InputDecoration(
              label: Text(label),
              helperText: "(Optional)",
          ),
        ),
      ),
    );
  }
}