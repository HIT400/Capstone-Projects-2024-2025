import 'package:practice_pal_mobile/data/enums/score_status_enum.dart';
import 'package:practice_pal_mobile/data/models/test_model.dart';

class User {
  final int id;
  final String username, email;

  const User({
    required this.id,
    required this.username,
    required this.email,
    // required this.phone,
  });

  String get initials => username.substring(0, 1).toUpperCase();

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json["id"],
      username: json["fullName"],
      email: json["email"],
      // phone: json["phone"],
    );
  }
}

class StudentDashboard {
  final String studentName;
  final int noOfTests, noOfCourses;
  final double avgScore;
  final ScoreStatus status;
  final List<TestResults> recentTestResults;
  final List<CourseAverage> courseAverages;

  StudentDashboard({
    required this.studentName,
    required this.noOfTests,
    required this.noOfCourses,
    required this.avgScore,
    required this.status,
    required this.recentTestResults,
    required this.courseAverages,
  });

  String get percentage => "${avgScore.toStringAsFixed(2)}%";

  factory StudentDashboard.fromJson(Map<String, dynamic> json) {
    List<TestResults> results = [];
    List<CourseAverage> averages = [];

    for (var value in json["recentTestResults"]) {
      results.add(TestResults.fromJson(value));
    }

    for (var value in json["courseAverages"]) {
      averages.add(CourseAverage.fromJson(value));
    }

    return StudentDashboard(
        studentName: json["studentName"],
        noOfTests: json["noOfTests"],
        noOfCourses: json["noOfCourses"],
        avgScore: json["avgScore"],
        status: results.isNotEmpty
            ? ScoreStatus.fromScore(json["avgScore"])
            : ScoreStatus.none,
        recentTestResults: results,
        courseAverages: averages);
  }
}

class CourseAverage {
  final String course;
  final double average;
  final ScoreStatus status;

  const CourseAverage({
    required this.course,
    required this.average,
    required this.status,
  });

  String get percentage => !average.isNaN ? "${average.toStringAsFixed(2)}%" : "N/A";

  factory CourseAverage.fromJson(Map<String, dynamic> json) {
    final avg = double.tryParse(json["average"].toString());
    return CourseAverage(
        course: json["course"],
        average: avg ?? double.nan,
        status: ScoreStatus.fromScore(avg));
  }
}
