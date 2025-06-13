import 'package:intl/intl.dart';

extension DateTimeExtension on DateTime {
  String get formattedDDMMYYYY => DateFormat('dd/MM/yyyy').format(this);
  String get fullDateTime => DateFormat('dd/MM/yyyy HH:mm:ss').format(this);
  String get humanReadableDate => DateFormat('d MMMM yyyy HH:mm:ss').format(this);
  String get uniqueDateCode => DateFormat('ddMMyyyyHHmmss').format(this);
}