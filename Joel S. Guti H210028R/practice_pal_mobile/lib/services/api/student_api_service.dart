import 'dart:convert';

import 'package:practice_pal_mobile/consts/urls.dart';
import 'package:practice_pal_mobile/data/models/user_model.dart';
import 'package:practice_pal_mobile/services/api/api_service.dart';

class StudentAPIService {
  static Future<User> student() async {
    try {
      final response = await APIService.fetch(url: URLs.student);
      final body = jsonDecode(response.body);
      final data = body["data"];
      return User.fromJson(data);
    } catch (e) {
      rethrow;
    }
  }
  
  static Future<StudentDashboard> dashboard() async {
    try {
      final response = await APIService.fetch(url: URLs.dashboard);
      final body = jsonDecode(response.body);
      final data = body["data"];
      return StudentDashboard.fromJson(data);
    } catch (e) {
      rethrow;
    }
  }
}
