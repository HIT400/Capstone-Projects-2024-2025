import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pulsepay/JsonModels/json_models.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/authentication/login.dart';

class Signup extends StatefulWidget{
  const Signup ({super.key});

  @override
  State<Signup> createState() => _SignupState();
}

class _SignupState extends State<Signup>{
  final username = TextEditingController();
  final password = TextEditingController();
  final confirmPassword = TextEditingController();
  final realname = TextEditingController();
  final String date = DateTime.now().toIso8601String();

  bool isVisible = false;
  bool isAdmin = false;
  bool isCashier = false;

  final db = DatabaseHelper();
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
                      'assets/Pay.png',
                      height: 120,
                    ),
                  ),
                  const SizedBox(height: 15),
                  const Text(
                    "Welcome To PuslePay!!",
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: 28,
                      fontWeight: FontWeight.bold ,
                    ),
                  ),
                  const SizedBox(height: 8,),
                  Text(
                    "Enter Details Below To Register Account",
                    style: TextStyle(
                      color: Colors.grey.shade800,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 24,),
                  TextFormField(
                    controller: realname  ,
                    decoration: InputDecoration(
                        labelText: 'Real name',
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
                        return "Realname is Required";
                      }return null;
                    },
                  ),
                  const SizedBox(height: 16,),
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
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: confirmPassword,
                    obscureText: !isVisible,
                    decoration: InputDecoration(
                      labelText: 'Confirm Password',
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
                      }else if(password.text != confirmPassword.text){
                        return "Passwords Don't Match";
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16,),
                  CheckboxListTile(
                        title: const Text("Admin"),
                        value: isAdmin,
                        onChanged:(bool? value){
                          setState(() {
                            isAdmin = value!;
                            if(isAdmin) isCashier = false;
                          });
                        },
                      ),
                  const SizedBox(height: 16,),
                  CheckboxListTile(
                        title: const Text("Cashier"),
                        value: isCashier,
                        onChanged:(bool? value){
                          setState(() {
                            isCashier = value!;
                            if(isCashier) isAdmin = false;
                          });
                        },
                      ),
                  const SizedBox(height: 16),
                  // Signup Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        if(formKey.currentState!.validate()){
                          final db = DatabaseHelper();
                          final enteredRealname = realname.text;
                          final enteredUsername = username.text.trim();
                          final enteredPassword = password.text.trim();
                          if(enteredRealname.isEmpty || enteredUsername.isEmpty || enteredPassword.isEmpty || (!isAdmin && !isCashier) ){
                            Get.snackbar(
                              'Failed',
                              'Please fill all the fiels and select a role.',
                              backgroundColor: Colors.red,
                              icon:const Icon(Icons.error),
                              colorText: Colors.white,
                              snackPosition: SnackPosition.TOP
                            );
                          }else{
                            db.signup(Users(
                            realName: realname.text ,
                            userName: username.text,
                            userPassword: password.text,
                            DateCreated: date,
                            isAdmin: isAdmin? 1 : 0,
                            isCashier: isCashier? 1 :0,
                            )
                            )
                            .whenComplete((){
                              Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const Login()));
                            });
                          }
                          
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        padding:const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12.0),
                        ),
                      ),
                      child: const Text(
                        'Signup',
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
                        "Already have an account? ",
                        style: TextStyle(color: Colors.grey.shade400),
                      ),
                      GestureDetector(
                        onTap: () {
                          Navigator.push(context,
                           MaterialPageRoute(builder: (context) =>const Login()));
                        },
                        child: const Text(
                          "LogIn",
                          style: TextStyle(color: Colors.blue, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
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