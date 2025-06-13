import 'package:practice_pal_mobile/data/enums/score_status_enum.dart';
import 'package:practice_pal_mobile/data/models/test_model.dart';

extension TestResultsExtension on List<TestResults> {
  double get avg => fold(0.0, (sum, result) => sum + result.score) / length;
  String get avgPercentage => "${avg.toStringAsFixed(2)}%";
  ScoreStatus get status => ScoreStatus.fromScore(avg);
}