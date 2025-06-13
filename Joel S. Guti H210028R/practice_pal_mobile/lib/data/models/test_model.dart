import 'package:practice_pal_mobile/data/enums/difficulty_enum.dart';
import 'package:practice_pal_mobile/data/enums/score_status_enum.dart';
import 'package:practice_pal_mobile/data/extensions/date_time_extension.dart';
import 'package:practice_pal_mobile/data/models/answer_model.dart';

class Test {
  final int id;
  final String title;
  final Difficulty difficulty;
  final List<Question> questions;

  const Test({
    required this.id,
    required this.title,
    required this.difficulty,
    required this.questions,
  });

  int get noOfQuestions => questions.length;

  factory Test.fromJson(Map<String, dynamic> json) {
    List<Question> list = [];
    for (var value in json["questions"]) {
      list.add(Question.fromJson(value));
    }
    return Test(
        id: json["id"],
        title: json["title"] ?? "N/A",
        difficulty: Difficulty.fromString(json["difficulty"]),
        questions: list);
  }
}

class Question {
  final int index;
  final String text, answer;
  final List<String> options;

  const Question(
      {required this.index,
      required this.text,
      required this.options,
      required this.answer});

  String get stem => "$index) $text";

  factory Question.fromJson(Map<String, dynamic> json) {
    List<String> list = [];
    for (var value in json["options"]) {
      list.add(value);
    }
    return Question(
        index: json["index"],
        text: json["stem"],
        options: list,
        answer: json["answer"]);
  }
}

class TestResults {
  final int id, testId;
  final String title;
  final int totalQuestions, totalAnswered, totalUnanswered, totalCorrectAnswers;
  final double score;
  final ScoreStatus status;
  final String date;

  TestResults(
      {required this.id,
      required this.testId,
      required this.title,
      required this.totalQuestions,
      required this.totalAnswered,
      required this.totalUnanswered,
      required this.totalCorrectAnswers,
      required this.score,
      required this.status,
      required this.date});

  String get percentage => "$score%";

  factory TestResults.fromJson(Map<String, dynamic> json) {
    return TestResults(
        id: json["id"],
        testId: json["testId"],
        title: json["title"],
        totalQuestions: json["totalQuestions"],
        totalAnswered: json["totalAnswered"],
        totalUnanswered: json["totalUnanswered"],
        totalCorrectAnswers: json["totalCorrectAnswers"],
        score: json["score"],
        status: ScoreStatus.fromScore(json["score"]),
        date: DateTime.parse(json["date"]).humanReadableDate);
  }
}

class Revision {
  final Test test;
  final List<AnswerResponse> responses;
  final int totalCorrectAnswers, totalQuestions;

  const Revision(
      {required this.test,
      required this.responses,
      required this.totalCorrectAnswers,
      required this.totalQuestions});

  String get score => "$totalCorrectAnswers/$totalQuestions";

  factory Revision.fromJson(Map<String, dynamic> json) {
    List<AnswerResponse> list = [];
    for (var value in json["answers"]) {
      list.add(AnswerResponse.fromJson(value));
    }

    return Revision(
        test: Test.fromJson(json["test"]),
        responses: list,
        totalCorrectAnswers: json["totalCorrectAnswers"],
        totalQuestions: json["totalQuestions"]);
  }
}

class TestDetails {
  final int id;
  final String title, createdAt;
  final Difficulty difficulty;
  final List<TestResults> results;

  TestDetails(
      {required this.id,
      required this.title,
      required this.createdAt,
      required this.difficulty,
      required this.results});

  factory TestDetails.fromJson(Map<String, dynamic> json) {
    List<TestResults> list = [];
    for (var value in json["results"]) {
      list.add(TestResults.fromJson(value));
    }

    return TestDetails(
        id: json["id"],
        title: json["title"],
        createdAt: json["createdAt"] != null
            ? DateTime.parse(json["createdAt"]).humanReadableDate
            : "",
        difficulty: Difficulty.fromString(json["difficulty"]),
        results: list.reversed.toList());
  }
}
