import 'package:practice_pal_mobile/data/enums/course_category_enum.dart';
import 'package:practice_pal_mobile/data/enums/level_enum.dart';

class Course {
  final int? id;
  final String title, description;
  final CourseCategory? category;
  final Level level;
  final List<Topic> topics;

  const Course({
    this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.level,
    required this.topics,
  });

  String get levelName => "${level.name} Level";

  List<Map<String, dynamic>> get topicsJson =>
      topics.map((topic) =>
      {
        "index": topic.index,
        "name": topic.name
      }).toList();


  factory Course.fromJson(Map<String, dynamic> json) {
    List<Topic> list = [];
    for (var topic in json["topics"]) {
      list.add(Topic.fromJson(topic));
    }
    return Course(
        id: json["id"],
        title: json["title"] ?? "N/A",
        description: json["description"] ?? "N/A",
        category: CourseCategory.fromString(json["category"]),
        level: Level.fromString(json["level"]),
        topics: list);
  }

  Map<String, dynamic> toJson() {
    return {
      "id": id,
      "title": title,
      "description": description,
      "level": level.type,
      "topics": topicsJson,
    };
  }
}

class Topic {
  final int index;
  final String name;

  const Topic({
    required this.index,
    required this.name,
  });

  factory Topic.fromJson(Map<String, dynamic> json) {
    return Topic(
        index: json["index"],
        name: json["name"] ?? "N/A");
  }
}
