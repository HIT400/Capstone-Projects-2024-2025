import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pulsepay/JsonModels/json_models.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/app_bar.dart';
import 'package:pulsepay/forms/users.dart';

class AddUser extends StatefulWidget{
  const AddUser ({super.key});

  @override
  State<AddUser> createState() => _AddUserState();
}

class _AddUserState extends State<AddUser>{
  final username = TextEditingController();
  final password = TextEditingController();
  final realname = TextEditingController();
  final confirmPassword = TextEditingController();

  bool isVisible = false;
  bool isAdmin = false;
  bool isCashier = false;

  final db = DatabaseHelper();
  final formKey = GlobalKey<FormState>();

  Future<void> saveUser() async {
    final usernameEntered = username.text.trim();
    final passwordEntered = password.text.trim();
    final realnameEntered = realname.text;
    final String date = DateTime.now().toIso8601String();

    if (usernameEntered.isEmpty || passwordEntered.isEmpty || (!isAdmin && !isCashier)){
      Get.snackbar(
        'Failed',
        'Please fill all the fiels and select a role.',
        backgroundColor: Colors.red,
        icon:const Icon(Icons.error),
        colorText: Colors.white,
        snackPosition: SnackPosition.TOP
      );
      return;
    }

    final user ={
      'realName': realnameEntered,
      'userName':usernameEntered,
      'userPassword': passwordEntered,
      'isAdmin': isAdmin ? 1 : 0,
      'isCashier': isCashier ? 1 : 0,
      'dateCreated': date,
    };

    final db = await DatabaseHelper().initDB();
    await db.insert('users', user);
    Get.snackbar(
        'Success',
        'User Saved;',
        backgroundColor: Colors.green,
        icon:const Icon(Icons.error),
        colorText: Colors.white,
        snackPosition: SnackPosition.TOP
      );
    
    setState(() {
      username.clear();
      realname.clear();
      password.clear();
      confirmPassword.clear();
      isAdmin =false;
      isCashier =false;
    });

  }

  @override
  Widget build(BuildContext context){
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(50)
        ,child: AppBar(
          centerTitle: true,
          title: const Text("Add User" , style: TextStyle(fontSize: 20, color: Colors.white, fontWeight:  FontWeight.bold),),
          iconTheme: const IconThemeData(color: Colors.white),
          backgroundColor: Colors.blue,
          shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(25),
                  bottomRight: Radius.circular(25)
                )
              ),
        )
      ),
      backgroundColor: const Color.fromARGB(255,255,255,255),
      body: SingleChildScrollView(
        scrollDirection: Axis.vertical,
          child: Padding(
            padding:  const EdgeInsets.symmetric(horizontal: 10.0),
            child: Form(
              key: formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 30,),
                  Text(
                    "Enter Details Below To Register Account",
                    style: TextStyle(
                      color: Colors.black,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 24,),
                  TextFormField(
                    controller: realname,
                    decoration: InputDecoration(
                        labelText: 'Real Name',
                        labelStyle: TextStyle(color:Colors.grey.shade600 ),
                        filled: true,
                        fillColor: Colors.grey.shade300,
                        border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none
                        )
                    ),
                  ),
                  SizedBox(height: 16,),
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
                  const SizedBox(height: 16),
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
                  SizedBox(height: 16,),
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

                  // Signup Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        if(formKey.currentState!.validate()){
                          saveUser();
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
                        'Register User',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Don't have an account
                  
                  const SizedBox(height: 16),
                  // Continue as Guest
                ],
              ),
            ),
          ),
        ),
    
    ); 
  }
}