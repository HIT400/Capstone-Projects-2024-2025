import 'package:practice_pal_mobile/data/models/course_model.dart';

extension CoursesExtension on List<Course> {
  List<String> get items => map((course) => course.title).toList();

  Course fromValue(String title) => firstWhere((course) => course.title == title);
}