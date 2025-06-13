import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

enum CourseCategory {
  natural("Natural Sciences", FontAwesomeIcons.flaskVial),
  formal("Formal Sciences", FontAwesomeIcons.squareRootVariable),
  social("Social Sciences", FontAwesomeIcons.peopleGroup),
  applied("Applied Sciences", FontAwesomeIcons.gears),
  humanities("Humanities", FontAwesomeIcons.bookOpenReader),
  arts("Arts", FontAwesomeIcons.palette),
  other("", FontAwesomeIcons.book);

  final String text;
  final IconData icon;
  const CourseCategory(this.text, this.icon);

  @override
  String toString() {
    return text;
  }

  factory CourseCategory.fromString(String? value) {
    switch (value) {
      case "Natural Sciences":
        return CourseCategory.natural;
      case "Formal Sciences":
        return CourseCategory.formal;
      case "Social Sciences":
        return CourseCategory.social;
      case "Applied Sciences":
        return CourseCategory.applied;
      case "Humanities":
        return CourseCategory.humanities;
      case "Arts":
        return CourseCategory.arts;
      default:
        return CourseCategory.other;
    }
  }
}