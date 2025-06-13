import 'package:flutter/material.dart';

class ReadOnlyInput extends StatelessWidget {
  final String label, value;
  const ReadOnlyInput({super.key, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Theme(
      data: ThemeData(
          inputDecorationTheme: const InputDecorationTheme(
            border: InputBorder.none,
          )
      ),
      child: TextField(
        readOnly: true,
        textAlign: TextAlign.center,
        style: const TextStyle(fontSize: 25, fontWeight: FontWeight.w700),
        controller: TextEditingController(text: value),
        decoration: InputDecoration(
          labelText: label,
          floatingLabelAlignment: FloatingLabelAlignment.center,
        ),
      ),
    );
  }
}
