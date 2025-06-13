class URLs {
  static const baseUrl = "http://10.0.2.2:8080/api/v1";
  // static const baseUrl = "http://192.168.100.200:8080/api/v1";

  static const signin = "$baseUrl/auth/signin";
  static const signup = "$baseUrl/auth/signup";

  static const student = "$baseUrl/student";
  static const dashboard = "$baseUrl/student/dashboard";

  static const courses = "$baseUrl/course/all";
  static const course = "$baseUrl/course";
  // static const createCourse = "$baseUrl/course/create";
  static const createCourse = "$baseUrl/course/create/deepseek";
  static const updateCourse = "$baseUrl/course/update";
  static const customCourse = "$baseUrl/course/custom";
  static const deleteCourse = "$baseUrl/course/delete?courseId=";

  static const tests = "$baseUrl/test/all";
  static const test = "$baseUrl/test";
  // static const generateTest = "$baseUrl/test/generate";
  static const generateTest = "$baseUrl/test/generate/deepseek";
  static const pastPapers = "$baseUrl/test/past";
  static const attemptTest = "$baseUrl/test/attempt";
  static const testResults = "$baseUrl/test/results";
  static const testResult = "$baseUrl/test/result";
  static const reviseTest = "$baseUrl/test/revision";
}