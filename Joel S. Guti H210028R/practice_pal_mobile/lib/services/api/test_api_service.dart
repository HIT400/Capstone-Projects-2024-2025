import 'dart:convert';

import 'package:practice_pal_mobile/consts/urls.dart';
import 'package:practice_pal_mobile/consts/values.dart';
import 'package:practice_pal_mobile/data/models/test_model.dart';
import 'package:practice_pal_mobile/services/api/api_service.dart';

class TestAPIService {
  static Future<List<Test>> allTests() async {
    try {
      List<Test> list = [];
      final response = await APIService.fetch(url: URLs.tests);
      final body = jsonDecode(response.body);
      final data = body["data"];
      for (var json in data) {
        list.add(Test.fromJson(json));
      }
      list.sort((a, b) => a.title.compareTo(b.title));
      return list;
    } catch (e) {
      rethrow;
    }
  }

  static Future<Test> getTest(int id) async {
    try {
      final response = await APIService.fetch(url: "${URLs.test}/$id");
      final body = jsonDecode(response.body);
      final data = body["data"];
      return Test.fromJson(data);
    } catch (e) {
      rethrow;
    }
  }

  static Future<TestDetails> getTestDetails(int id) async {
    try {
      final response = await APIService.fetch(url: "${URLs.test}/$id/details");
      final body = jsonDecode(response.body);
      final data = body["data"];
      return TestDetails.fromJson(data);
    } catch (e) {
      rethrow;
    }
  }

  static Future<List<TestResults>> allResults() async {
    try {
      List<TestResults> list = [];
      final response = await APIService.fetch(url: URLs.testResults);
      final body = jsonDecode(response.body);
      final data = body["data"];
      for (var json in data) {
        list.add(TestResults.fromJson(json));
      }
      return list.reversed.toList();
    } catch (e) {
      rethrow;
    }
  }

  static Future<Test> getResult(int id) async {
    try {
      final response = await APIService.fetch(url: "${URLs.testResult}/$id");
      final body = jsonDecode(response.body);
      final data = body["data"];
      return Test.fromJson(data);
    } catch (e) {
      rethrow;
    }
  }

  static Future<Test> generate(payload, [bool fromPast = false]) async {
    try {
      final response = await APIService.create(
          url: !fromPast ? URLs.generateTest : URLs.pastPapers,
          payload: payload,
          message: AppValues.mightTakeAWhile);
      final body = jsonDecode(response.body);
      final data = body["data"];
      return Test.fromJson(data);
    } catch (e) {
      rethrow;
    }
  }

  static Future<TestResults> attempt(payload) async {
    try {
      final response =
          await APIService.create(url: URLs.attemptTest, payload: payload);
      final body = jsonDecode(response.body);
      final data = body["data"];
      return TestResults.fromJson(data);
    } catch (e) {
      rethrow;
    }
  }

  static Future<Revision> revise(int id) async {
    try {
      final response = await APIService.fetch(url: "${URLs.reviseTest}/$id");
      final body = jsonDecode(response.body);
      final data = body["data"];
      return Revision.fromJson(data);
    } catch (e) {
      rethrow;
    }
  }
}
