import 'package:flutter/material.dart';
import 'package:practice_pal_mobile/data/exceptions/exception_handler.dart';
import 'package:practice_pal_mobile/data/models/user_model.dart';
import 'package:practice_pal_mobile/services/api/student_api_service.dart';

import 'home_view.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  HomeController createState() => HomeController();
}

class HomeController extends State<HomePage> {
  late Future<StudentDashboard> future;

  @override
  void initState() {
    future = StudentAPIService.dashboard().onError(ExceptionHandler.trace);
    super.initState();
  }

  Future<void> refresh() async {
    setState(() {
      future = StudentAPIService.dashboard().onError(ExceptionHandler.trace);
    });
  }

  @override
  Widget build(BuildContext context) => HomeView(this);
}