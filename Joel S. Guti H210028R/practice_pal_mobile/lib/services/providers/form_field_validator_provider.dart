import 'package:get/get.dart';

class FormValidatorProvider {
  String? validateField(String? value, String message) {
    if(value==null || value.isEmpty) {
      return "*$message";
    }
    return null;
  }

  String? validate(String? value) {
    if(value==null || value.isEmpty) {
      return "*Required";
    }
    return null;
  }

  String? validateWallet(String? value) {
    if(value==null || value.isEmpty) {
      return "*Wallet account required";
    }
    if (!value.isNum || !value.isPhoneNumber){
      return "Invalid wallet account";
    }
    return null;
  }

  String? validatePassword(String? value) {
    if(value==null || value.isEmpty) {
      return "*Password required";
    }
    if(value.length<6) {
      return "*Password must be at least 6 characters long";
    }
    if(value.isAlphabetOnly || value.isNumericOnly) {
      return "*Password must contain numbers and letters";
    }
    return null;
  }

  String? validateAmount(String? value, [double? initialAmount]) {
    if(value==null || value.isEmpty) {
      return "*Amount required";
    }
    if(!value.isNum) {
      return "*Invalid amount";
    }
    if(double.parse(value).isEqual(0)) {
      return "*Please enter amount";
    }
    if(initialAmount!=null && initialAmount<double.parse(value)) {
      return "Insufficient balance";
    }
    return null;
  }

  String? validateEmail(String? value) {
    if(value==null || value.isEmpty) {
      return "*Email required";
    }
    if(!value.isEmail) {
      return "*Invalid email address";
    }
    return null;
  }

  String? validateFullName(String? value) {
    if(value==null || value.isEmpty) {
      return "*Full name required";
    }
    if(value.isNumericOnly) {
      return "*Invalid name";
    }

    if(value.split(" ").length<2) {
      return "*First name and surname required";
    }
    return null;
  }

  String? validateUsername(String? value) {
    if(value==null || value.isEmpty) {
      return "*Username required";
    }
    if(value.isNumericOnly) {
      return "*Invalid username";
    }
    return null;
  }

  String? validateDate(String? value) {
    if(value==null || value.isEmpty) {
      return "*Date required";
    }
    if(!value.isDateTime) {
      return "*Invalid date";
    }
    return null;
  }

  String? validatePhone(String? value) {
    if(value==null || value.isEmpty) {
      return "*Phone number required";
    }
    if(!value.isPhoneNumber) {
      return "*Invalid phone number";
    }
    return null;
  }

  String? validateCardNo(String? value) {
    if(value==null || value.isEmpty) {
      return "*Card number required";
    }
    if(value.replaceAll(" ", "").length<16) {
      return "*Invalid card number";
    }
    return null;
  }
}