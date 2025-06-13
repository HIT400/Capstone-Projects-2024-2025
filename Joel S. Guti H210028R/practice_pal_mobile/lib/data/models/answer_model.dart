class Answer {
  final int id;
  final String? answer;

  const Answer({required this.id, required this.answer});

  @override
  String toString() {
    return 'Answer{id: $id, answer: $answer}';
  }
}

class AnswerResponse {
  final int questionIndex;
  final String answer;

  const AnswerResponse({
    required this.questionIndex,
    required this.answer,
  });

  factory AnswerResponse.fromJson(Map<String, dynamic> json) {
    return AnswerResponse(
        questionIndex: json["questionIndex"], answer: json["answer"]);
  }
}
