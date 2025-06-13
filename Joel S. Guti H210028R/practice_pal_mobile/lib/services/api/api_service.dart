import 'dart:convert';

import 'package:http/http.dart' as http;
import 'package:practice_pal_mobile/consts/values.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../utils/dialog_utils.dart';
import '../utils/global_utils.dart';
import 'api_response_handler.dart';

class APIService {
  static Future<http.Response> fetch({required String url}) async {
    printLog("URL : $url");
    try {
      final prefs = await SharedPreferences.getInstance();
      final response = await http.get(Uri.parse(url), headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${prefs.getString("token")}',
      }).timeout(const Duration(seconds: 25));
      return APIResponseHandler.check(response);
    } catch (e) {
      rethrow;
    }
  }

  static Future<http.Response> create(
      {required String url,
      required dynamic payload,
      String message = AppValues.wait}) async {
    showLoading(message: message);
    printLog("URL : $url");
    printLog("PAYLOAD : $payload");
    try {
      final prefs = await SharedPreferences.getInstance();
      final response =
          await http.post(Uri.parse(url), body: jsonEncode(payload), headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${prefs.getString("token")}',
      }).timeout(const Duration(minutes: 15));
      return APIResponseHandler.check(response);
    } catch (e) {
      rethrow;
    } finally {
      closeLoading();
    }
  }

  static Future<http.Response> update(
      {required String url, required dynamic payload}) async {
    showLoading();
    printLog("URL : $url");
    printLog("PAYLOAD : $payload");
    try {
      final prefs = await SharedPreferences.getInstance();
      final response =
          await http.put(Uri.parse(url), body: jsonEncode(payload), headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${prefs.getString("token")}',
      }).timeout(const Duration(seconds: 25));
      return APIResponseHandler.check(response);
    } catch (e) {
      rethrow;
    } finally {
      closeLoading();
    }
  }

  static Future<http.Response> delete(
      {required String url, required Object id}) async {
    showLoading();
    printLog("URL : $url");
    try {
      final prefs = await SharedPreferences.getInstance();
      final response =
      await http.delete(Uri.parse("$url$id"), headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${prefs.getString("token")}',
      }).timeout(const Duration(seconds: 25));
      return APIResponseHandler.check(response);
    } catch (e) {
      rethrow;
    } finally {
      closeLoading();
    }
  }

  static Future<http.Response> authenticate(
      {required String url, required dynamic payload}) async {
    showLoading();
    printLog("URL : $url");
    printLog("PAYLOAD : $payload");
    try {
      final response =
          await http.post(Uri.parse(url), body: jsonEncode(payload), headers: {
        'Content-Type': 'application/json',
      }).timeout(const Duration(seconds: 25));
      return APIResponseHandler.check(response);
    } catch (e) {
      rethrow;
    } finally {
      closeLoading();
    }
  }
}
