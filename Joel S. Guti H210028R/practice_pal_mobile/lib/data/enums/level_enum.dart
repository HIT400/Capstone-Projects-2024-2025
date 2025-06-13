import 'package:practice_pal_mobile/data/exceptions/custom_exceptions.dart';

enum Level {
  primary("Primary School", "PRIMARY_SCHOOL"),
  middle("Middle School", "MIDDLE_SCHOOL"),
  secondary("High School", "HIGH_SCHOOL"),
  undergraduate("Undergraduate", "UNDERGRADUATE"),
  postgraduate("Postgraduate", "POSTGRADUATE"),
  technical("Technical Education", "TECHNICAL_EDUCATION");
  // doctorate("Doctorate", "DOCTORATE");

  final String name, type;

  const Level(this.name, this.type);

  factory Level.fromString(String value) {
    switch (value) {
      case "PRIMARY_SCHOOL":
        return Level.primary;
      case "MIDDLE_SCHOOL":
        return Level.middle;
      case "HIGH_SCHOOL":
        return Level.secondary;
      case "UNDERGRADUATE":
        return Level.undergraduate;
      case "POSTGRADUATE":
        return Level.postgraduate;
      // case "DOCTORATE":
      //   return Level.doctorate;
      case "TECHNICAL_EDUCATION":
      default:
        return Level.technical;
    }
  }
}
