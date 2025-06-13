import 'dart:convert';

import 'package:get/get.dart';
import 'package:practice_pal_mobile/consts/urls.dart';
import 'package:practice_pal_mobile/data/exceptions/exception_handler.dart';
import 'package:practice_pal_mobile/data/models/course_model.dart';
import 'package:practice_pal_mobile/presentation/pages/courses/view/view_course_controller.dart';
import 'package:practice_pal_mobile/services/api/api_service.dart';

class CourseAPIService {
  static Future<List<Course>> all() async {
    try {
      List<Course> list = [];
      final response = await APIService.fetch(url: URLs.courses);
      final body = jsonDecode(response.body);
      final data = body["data"];
      for (var json in data) {
        list.add(Course.fromJson(json));
      }
      list.sort((a, b) => a.title.compareTo(b.title));
      return list;
    } catch (e) {
      rethrow;
    }
  }

  static Future<Course> get(int id) async {
    try {
      final response = await APIService.fetch(url: "${URLs.course}/$id");
      final body = jsonDecode(response.body);
      final data = body["data"];
      return Course.fromJson(data);
    } catch (e) {
      rethrow;
    }
  }

  static Future<void> create(payload) async {
    try {
      final response = await APIService.create(
          url: URLs.createCourse,
          payload: payload,
          message: "This might take a while");
      final body = jsonDecode(response.body);
      final data = body["data"];
      Get.back(result: true);
      Get.to(() => ViewCoursePage(Course.fromJson(data).id!), fullscreenDialog: true);
    } on Exception catch (e) {
      ExceptionHandler.show(e);
    }
  }

  static Future<void> createCustom(payload) async {
    try {
      await APIService.create(url: URLs.customCourse, payload: payload);
      Get.back(result: true);
    } on Exception catch (e) {
      ExceptionHandler.show(e);
    }
  }

  static Future<void> update(payload) async {
    try {
      await APIService.update(url: URLs.updateCourse, payload: payload);
      Get.back(result: true);
    } on Exception catch (e) {
      ExceptionHandler.show(e);
    }
  }

  static Future<void> delete(int id) async {
    try {
      await APIService.delete(url: URLs.deleteCourse, id: id);
      Get.back(result: true);
    } on Exception catch (e) {
      ExceptionHandler.show(e);
    }
  }
}
