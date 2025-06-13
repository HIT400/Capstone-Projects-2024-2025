import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pulsepay/JsonModels/json_models.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/authentication/signup.dart';
import 'package:pulsepay/home/home_page.dart';

class Login extends StatefulWidget{
  const Login ({super.key});

  @override
  State<Login> createState() => _LoginState();
}

class _LoginState extends State<Login>{
  final username = TextEditingController();
  final password = TextEditingController();

  bool isVisible = false;
  bool isLoginTrue = false;

  final db = DatabaseHelper();

  login() async{
    var response = await db.login(Users(userName: username.text, userPassword: password.text));
    if(response == true){
      if(!mounted) return;
      Navigator.pushReplacement(context,
      MaterialPageRoute(builder: (context)=>const HomePage()));
    }else{
      Get.snackbar(
        'Login Failed!',
        'Wrong Username Or Password',
        icon: const Icon(Icons.error, color: Colors.white,),
        colorText: Colors.white,
        backgroundColor: Colors.red,
        snackPosition: SnackPosition.TOP,
        );
    }
  }

  final formKey = GlobalKey<FormState>();
  @override
  Widget build(BuildContext context){
    return Scaffold(
      backgroundColor: const Color.fromARGB(255,255,255,255),
      body: Center(
        child: SingleChildScrollView(
          child: Padding(
            padding:  const EdgeInsets.symmetric(horizontal: 24.0),
            child: Form(
              key: formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Image.asset(
                      'assets/login.PNG',
                      height: 200,
                    ),
                  ),
                  const SizedBox(height: 15),
                  const Text(
                    "Welcome Back",
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: 28,
                      fontWeight: FontWeight.bold ,
                    ),
                  ),
                  const SizedBox(height: 8,),
                  Text(
                    "Login Below To Access Your Account",
                    style: TextStyle(
                      color: Colors.grey.shade400,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 24,),
                  //email address field
                  TextFormField(
                    controller: username,
                    decoration: InputDecoration(
                        labelText: 'Username',
                        labelStyle: TextStyle(color:Colors.grey.shade600 ),
                        filled: true,
                        fillColor: Colors.grey.shade300,
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none
                        )
                    ),
                    style: const TextStyle(color: Colors.black),
                    validator: (value){
                      if(value!.isEmpty){
                        return "Username Required";
                      }return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  // Password Field
                  TextFormField(
                    controller: password,
                    obscureText: !isVisible,
                    decoration: InputDecoration(
                      labelText: 'Password',
                      labelStyle:  TextStyle(color: Colors.grey.shade600),
                      filled: true,
                      fillColor: Colors.grey.shade300,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12.0),
                        borderSide: BorderSide.none,
                      ),
                      suffixIcon: IconButton(
                        onPressed: (){
                          setState(() {
                            isVisible = !isVisible;
                          });
                        },
                        icon: Icon( isVisible ? Icons.visibility : Icons.visibility_off) ),
                    ),
                    style: const TextStyle(color: Colors.black),
                    validator: (value){
                      if(value!.isEmpty){
                        return "Password Required";
                      }return null;
                    },
                  ),
                  const SizedBox(height: 8),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: (){},
                      child: const Text(
                        'Forgot Password?',
                        style: TextStyle(color: Colors.blue),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Login Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        if(formKey.currentState!.validate()){
                          login();
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                      ),
                      child: const Text(
                        'Login',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Don't have an account
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "Don't have an account? ",
                        style: TextStyle(color: Colors.grey.shade400),
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => const Signup()));
                        },
                        child: const Text(
                          "Create",
                          style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  isLoginTrue? const Text('Wrong Details' , style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold , fontSize: 18) ,) : 
                  const SizedBox(),
                  // Continue as Guest
                ],
              ),
            ),
          ),
        ),
      ),
    ); 
  }
}