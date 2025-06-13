import 'package:flutter/material.dart';

class AutoCompleteInput extends StatelessWidget {
  final String label;
  final IconData icon;
  final List<String> list;
  final Function(String value) onSelected;
  final FormFieldValidator<String>? validator;

  const AutoCompleteInput(
      {super.key,
      required this.list,
      required this.onSelected,
      required this.label,
      required this.icon,
      this.validator});

  @override
  Widget build(BuildContext context) {
    return Autocomplete<String>(
      optionsBuilder: (value) {
        if (value.text.isEmpty) {
          return [];
        }
        return list.where((item) => item.toLowerCase().contains(value.text.toLowerCase()));
      },
      onSelected: onSelected,
      fieldViewBuilder: (context, controller, focusNode, callback) {
        return Padding(
          padding: const EdgeInsets.all(10),
          child: TextFormField(
            controller: controller,
            focusNode: focusNode,
            validator: validator,
            decoration: InputDecoration(
                labelText: label,
                prefixIcon: Icon(icon)),
          ),
        );
      },
    );
  }
}
