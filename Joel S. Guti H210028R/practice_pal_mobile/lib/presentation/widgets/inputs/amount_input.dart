import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

import '../../../services/providers/form_field_validator_provider.dart';

class AmountInput extends StatefulWidget {
  final String label;
  final String hint;
  final IconData icon;
  final TextEditingController controller;
  final bool validate, increase;
  final Function(String value)? onChange;
  final double? initialBalance;

  const AmountInput(
      {super.key,
      this.label = "Amount (USD)",
      this.hint = "",
      this.icon = FontAwesomeIcons.dollarSign,
      this.validate = true,
      this.increase = false,
      required this.controller,
      this.onChange,
      this.initialBalance});

  @override
  State<AmountInput> createState() => _AmountInputState();
}

class _AmountInputState extends State<AmountInput> {
  late double newBalance;
  final provider = FormValidatorProvider();

  void onChanged(value) {
    if (widget.onChange != null) {
      widget.onChange!(value);
    }

    if (widget.initialBalance != null) {
      setState(() {
        if (widget.increase) {
          newBalance = widget.initialBalance! + (double.tryParse(value) ?? 0);
        } else {
          newBalance = widget.initialBalance! - (double.tryParse(value) ?? 0);
        }
      });
    }
  }

  @override
  void initState() {
    newBalance = widget.initialBalance ?? 0;
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(10),
      child: TextFormField(
          controller: widget.controller,
          keyboardType: TextInputType.number,
          validator: widget.validate
              ? (value) => provider.validateAmount(value, widget.initialBalance)
              : null,
          onChanged: onChanged,
          decoration: InputDecoration(
              label: Text(widget.label),
              hintText: widget.hint,
              prefixIcon: Icon(widget.icon),
              helper: widget.initialBalance != null
                  ? Text.rich(TextSpan(text: "New Balance: ", children: [
                      TextSpan(
                          text: "\$ ${newBalance.toStringAsFixed(2)}",
                          style: const TextStyle(fontWeight: FontWeight.w700))
                    ]))
                  : null)),
    );
  }
}
