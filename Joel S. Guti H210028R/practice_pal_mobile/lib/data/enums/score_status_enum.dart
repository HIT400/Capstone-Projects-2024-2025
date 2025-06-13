import 'package:flutter/material.dart';
import 'package:practice_pal_mobile/consts/colors.dart';

enum ScoreStatus {
  excellent("EXCELLENT", Colors.green),
  good("GOOD", AppColors.info),
  passed("PASS", AppColors.success),
  poor("POOR", AppColors.warning),
  failed("FAIL", AppColors.error),
  none("UNGRADED", Colors.black),
  ;

  final String label;
  final Color color;

  const ScoreStatus(this.label, this.color);

  factory ScoreStatus.fromScore(double? score) {
    if (score == null || score.isNaN) {
      return ScoreStatus.none;
    } else if (score >= 90) {
      return ScoreStatus.excellent;
    } else if (score >= 70 && score < 90) {
      return ScoreStatus.good;
    } else if (score >= 50 && score < 70) {
      return ScoreStatus.passed;
    } else if (score >= 40 && score < 50) {
      return ScoreStatus.poor;
    } else {
      return ScoreStatus.failed;
    }
  }
}
