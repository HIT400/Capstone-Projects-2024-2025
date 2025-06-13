import 'package:flutter/material.dart';

import 'presentation/pages/main/welcome_page.dart';
import 'presentation/widgets/app_theme.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return AppTheme(const WelcomePage());
  }
}
