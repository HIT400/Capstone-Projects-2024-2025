import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:practice_pal_mobile/consts/styles.dart';
import 'package:practice_pal_mobile/data/models/course_model.dart';

class SelectTopicsDialog extends StatefulWidget {
  final List<Topic> topics, selectedTopics;

  const SelectTopicsDialog(
      {super.key, required this.topics, required this.selectedTopics});

  @override
  State<SelectTopicsDialog> createState() => _SelectTopicsDialogState();
}

class _SelectTopicsDialogState extends State<SelectTopicsDialog> {
  late final List<Topic> topics, selectedTopics;

  @override
  void initState() {
    topics = widget.topics;
    selectedTopics = widget.selectedTopics;
    super.initState();
  }

  onSelect(Topic topic) {
    setState(() {
      if (selectedTopics.contains(topic)) {
        selectedTopics.remove(topic);
      } else {
        selectedTopics.add(topic);
      }
    });
  }

  onPopInvoked(canPop) {
    if (canPop) return;
    Get.back(result: selectedTopics);
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvoked: onPopInvoked,
      child: Dialog(
        child: Scaffold(
          appBar: AppBar(title: Text("Select Topics")),
          body: SingleChildScrollView(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: DataTable(
                  columns: [
                    DataColumn(label: Text("")),
                    DataColumn(label: Text("Name")),
                  ],
                  rows: topics
                      .map((topic) => DataRow(cells: [
                            DataCell(Checkbox(
                              value: selectedTopics.contains(topic),
                              onChanged: (value) => onSelect(topic),
                            )),
                            DataCell(
                                Text(topic.name, style: Styles.titleMedium)),
                          ]))
                      .toList()),
            ),
          ),
          bottomNavigationBar: Padding(
            padding: const EdgeInsets.all(8.0),
            child: FilledButton(
                onPressed: () => Get.back(result: selectedTopics),
                child: Text("Done")),
          ),
        ),
      ),
    );
  }
}
