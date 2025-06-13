

class AppException implements Exception {
  final String message;
  const AppException(this.message);

  @override
  String toString() {
    return message;
  }
}

class SessionException implements Exception {
  final String message;
  const SessionException([this.message = "Your session has expired"]);

  @override
  String toString() {
    return message;
  }
}

class BadRequestException implements Exception {
  final String message;
  const BadRequestException([this.message = "400 : Bad request"]);

  @override
  String toString() {
    return message;
  }
}

class UnauthorizedException implements Exception {
  final String message;
  const UnauthorizedException([this.message = "You are unauthorised to make this request."]);

  @override
  String toString() {
    return message;
  }
}

class InternalServerException implements Exception {
  final String message;
  const InternalServerException([this.message = "The system is temporarily down."]);

  @override
  String toString() {
    return message;
  }
}

class NoInternetException implements Exception {
  final String message;
  const NoInternetException(
      [this.message = "No internet connection."]);

  @override
  String toString() {
    return message;
  }
}

class UnexpectedException implements Exception {
  final String message;
  const UnexpectedException(
      [this.message = "An unexpected error occurred. Please try again."]);

  @override
  String toString() {
    return message;
  }
}

class TestException implements Exception {
  final String message;
  const TestException(
      [this.message = "Just testing exception handling"]);

  @override
  String toString() {
    return message;
  }
}