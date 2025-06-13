import 'package:flutter/material.dart';

class DropdownInput extends StatefulWidget {
  final String label;
  final String? value;
  final IconData icon;
  final FormFieldValidator<String>? validator;
  final List<String> items;
  final Function(String? value)? onChanged;

  const DropdownInput({
    super.key,
    required this.icon,
    required this.label,
    this.value,
    this.validator,
    required this.items,
    required this.onChanged,
  });

  @override
  State<DropdownInput> createState() => _DropdownInputState();
}

class _DropdownInputState extends State<DropdownInput> {
  List<DropdownMenuItem<String>> getItems() {
    List<DropdownMenuItem<String>> list = [];
    for (var item in widget.items) {
      list.add(DropdownMenuItem(
        value: item,
        child: Text(item),
      ));
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(10),
      child: DropdownButtonFormField<String>(
          isExpanded: true,
          decoration: InputDecoration(
              label: Text(widget.label), prefixIcon: Icon(widget.icon)),
          validator: widget.validator,
          value: widget.items.contains(widget.value) ? widget.value : null,
          items: getItems(),
          onChanged: widget.onChanged),
    );
  }
}
