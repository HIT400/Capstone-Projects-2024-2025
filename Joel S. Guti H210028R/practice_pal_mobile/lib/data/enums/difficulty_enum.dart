import 'package:flutter/material.dart';
import 'package:practice_pal_mobile/consts/colors.dart';

enum Difficulty {
  easy("Easy", AppColors.success),
  medium("Medium", AppColors.info),
  hard("Hard", AppColors.warning),
  veryHard("Very Hard", AppColors.error),
  none("Undefined", Colors.black87);

  final String text;
  final Color color;
  const Difficulty(this.text, this.color);

  factory Difficulty.fromString(String? value) {
    switch (value) {
      case "EASY":
        return Difficulty.easy;
      case "MEDIUM":
        return Difficulty.medium;
      case "HARD":
        return Difficulty.hard;
      case "VERY_HARD":
        return Difficulty.veryHard;
      default:
        return Difficulty.none;
    }
  }
}
