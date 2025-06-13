import 'package:flutter/material.dart';
import 'package:practice_pal_mobile/consts/colors.dart';
import 'package:practice_pal_mobile/consts/styles.dart';
import 'package:practice_pal_mobile/data/models/answer_model.dart';
import 'package:practice_pal_mobile/data/models/test_model.dart';

class ReviseTestTile extends StatefulWidget {
  final Question question;
  final AnswerResponse? response;

  const ReviseTestTile(
      {super.key, required this.question, required this.response});

  @override
  State<ReviseTestTile> createState() => _ReviseTestTileState();
}

class _ReviseTestTileState extends State<ReviseTestTile> {
  late final Question _question;
  late final AnswerResponse? _response;

  @override
  void initState() {
    _response = widget.response;
    _question = widget.question;
    _question.options.shuffle();
    super.initState();
  }

  bool _correct(option) =>
      option == _question.answer && _response?.answer == _question.answer;

  Color _color(option) => _correct(option)
      ? AppColors.success.withOpacity(.2)
      : AppColors.error.withOpacity(.2);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
      child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(_question.stem,
                  style: Styles.titleMedium.copyWith(
                      color: _question.answer == _response?.answer
                          ? Colors.green
                          : Colors.red)),
              const SizedBox(height: 10),
              ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _question.options.length,
                  itemBuilder: (context, i) {
                    final option = _question.options[i];
                    return RadioListTile<String>(
                      selected: option == _response?.answer,
                      selectedTileColor: _color(option),
                      value: option,
                      groupValue: _response?.answer,
                      onChanged: null,
                      title: Text(option, style: Styles.bodyMedium),
                      subtitle:
                          option == _response?.answer ? Text(_correct(option) ? "Correct" : "Wrong") : null,
                      contentPadding: EdgeInsets.zero,
                    );
                  }),
              if (_question.answer != _response?.answer)
                Column(children: [
                  Divider(),
                  ListTile(
                    title: Text("Correct Answer:",
                        style: Styles.bodyLarge.copyWith(color: Colors.green)),
                    subtitle: Text(_question.answer, style: Styles.titleMedium),
                  ),
                ])
            ],
          )),
    );
  }
}
