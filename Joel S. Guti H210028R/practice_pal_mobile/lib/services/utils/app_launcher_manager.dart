import 'package:shared_preferences/shared_preferences.dart';

class AppLaunchManager {
  static const String _firstLaunchKey = "isFirstLaunch";

  static Future<bool> isFirstLaunch() async {
    final prefs = await SharedPreferences.getInstance();
    bool firstLaunch = prefs.getBool(_firstLaunchKey) ?? true;

    if (firstLaunch) {
      await prefs.setBool(_firstLaunchKey, false);
    }

    return firstLaunch;
  }

  static Future<String> welcomeMessage() async {
    final launched = await isFirstLaunch();
    if (launched) {
      return "Welcome to";
    } else {
      return "Welcome back to";
    }
  }
}
