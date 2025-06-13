import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../data/exceptions/custom_exceptions.dart';
import '../utils/global_utils.dart';

class APIResponseHandler {
  static dynamic check(http.Response response) {
    printLog("RESPONSE BODY : ${response.body}");
    printLog("RESPONSE STATUS : ${response.statusCode}");
    switch (response.statusCode) {
      case 200:
      case 201:
        return response;
      case 400:
        final body = jsonDecode(response.body);
        throw BadRequestException(body["message"]);
      case 401:
        throw const SessionException();
      case 403:
        throw const UnauthorizedException();
      case 404:
        final body = jsonDecode(response.body);
        throw BadRequestException(body["message"]);
      case 500:
        final body = jsonDecode(response.body);
        throw InternalServerException(body["message"] ?? "The system is temporarily down.");
      default:
        throw UnexpectedException();
    }
  }
}