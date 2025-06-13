class DateTimeUtils {
  static String greetings() {
    final today = DateTime.now();
    final hour = today.hour;
    if(hour<12){
      return "Good Morning, ";
    } else if (hour>=12 && hour<=18) {
      return "Good Afternoon, ";
    } else {
      return "Good Evening, ";
    }
  }
}