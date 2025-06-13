import 'dart:async';

import 'package:get/get.dart';

import '../../presentation/widgets/dialogs/exception_dialog.dart';
import '../../services/utils/global_utils.dart';
import 'custom_exceptions.dart';

class ExceptionHandler {
  static String check(Exception exception) {
    printLog("EXCEPTION : $exception");
    printLog("EXCEPTION TYPE : ${exception.runtimeType}");
    switch (exception.runtimeType) {
      case AppException:
      case BadRequestException:
      case UnauthorizedException:
      case InternalServerException:
      case UnexpectedException:
      case SessionException:
      case TestException:
        return exception.toString();
      case FormatException:
        return "Invalid format sent. Contact support if error persists";
      case TimeoutException:
        return "Failed to establish internet connection.";
      default:
        if(exception.toString().contains("ClientException with SocketException")) {
          return "No internet connection.";
        }

        return "An unexpected error occurred";
    }
  }

  static void show(Exception exception, {String title = "Error Occurred"}) {
    Get.dialog(ExceptionDialog(title: title, message: check(exception)));
  }

  static Exception find(Exception exception) {
    switch (exception.runtimeType) {
      case AppException:
      case BadRequestException:
      case UnauthorizedException:
      case InternalServerException:
      case UnexpectedException:
      case SessionException:
      case TestException:
        return exception;
      case FormatException:
        return AppException("Invalid format sent. Contact support if error persists.");
      case TimeoutException:
        return AppException("Failed to establish internet connection.");
      default:
        if(exception.toString().contains("ClientException with SocketException")) {
          return NoInternetException();
        }
        return UnexpectedException();
    }
  }

  static String error(Object? obj) {
    if (obj is Exception) {
      return check(obj);
    } else {
      return UnexpectedException().message;
    }
  }

  static T trace<T>(Object error, StackTrace stackTrace) {
    printLog("Error: $error");
    printLog("StackTrace: $stackTrace");
    return null as T;
  }
}