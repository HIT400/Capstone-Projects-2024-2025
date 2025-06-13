import 'dart:developer';

import 'package:flutter/foundation.dart';

void printLog(Object? value) {
  if (kDebugMode) {
    log(value.toString());
  }
}