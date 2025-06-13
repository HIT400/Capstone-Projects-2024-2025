// import 'package:flutter/material.dart';
//
// class DateInput extends StatefulWidget {
//   final String label;
//   final Widget? prefix;
//   final IconData icon;
//   final TextEditingController controller;
//
//   const DateInput({
//     super.key,
//     this.label = "Date",
//     this.icon = Icons.calendar_month,
//     required this.controller,
//     this.prefix,
//   });
//
//   @override
//   State<DateInput> createState() => _DateInputState();
// }
//
// class _DateInputState extends State<DateInput> {
//   final provider = FieldValidatorProvider();
//   DateTime? selectedDate;
//
//   void pickDate() async {
//     selectedDate = await showDatePicker(
//         context: context, firstDate: DateTime.now(), lastDate: DateTime(3000));
//
//     if(selectedDate!=null) {
//       setState(() {
//         widget.controller.text = selectedDate!.cardExp;
//       });
//     }
//   }
//
//   @override
//   Widget build(BuildContext context) {
//     return Padding(
//       padding: const EdgeInsets.all(10),
//       child: TextFormField(
//         initialValue: null,
//         onTap: pickDate,
//         controller: widget.controller,
//         validator: provider.validate,
//         readOnly: true,
//         decoration: InputDecoration(
//             label: Text(widget.label),
//             prefixIcon: widget.prefix ?? Icon(widget.icon)),
//       ),
//     );
//   }
// }
