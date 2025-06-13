import 'package:flutter/material.dart';
import 'package:practice_pal_mobile/consts/styles.dart';
import 'package:practice_pal_mobile/data/models/answer_model.dart';
import 'package:practice_pal_mobile/data/models/test_model.dart';

class TakeTestTile extends StatefulWidget {
  final Question question;
  final Function(Answer answer) onSelect;
  const TakeTestTile({super.key, required this.question, required this.onSelect});

  @override
  State<TakeTestTile> createState() => _TakeTestTileState();
}

class _TakeTestTileState extends State<TakeTestTile> {
  late final Question _question;
  String? _selectedOption;

  @override
  void initState() {
    _question = widget.question;
    _question.options.shuffle();
    super.initState();
  }

  void _selectOption(String option) {
    setState(() {
      _selectedOption = option;
    });
    widget.onSelect(Answer(id: _question.index, answer: _selectedOption));
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(_question.stem, style: Styles.titleMedium),
              const SizedBox(height: 10),
              ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _question.options.length,
                  itemBuilder: (context, i) {
                    final option = _question.options[i];
                    return RadioListTile<String>(
                      value: option,
                      groupValue: _selectedOption,
                      onChanged: (value) {
                        if (value != null) {
                          _selectOption(value);
                        }
                      },
                      title: Text(option, style: Styles.bodyMedium),
                      contentPadding: EdgeInsets.zero,
                    );
                  }),
            ],
          )),
    );
  }
}
