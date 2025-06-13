import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lottie/lottie.dart';
import 'package:pulsepay/common/app_bar.dart';
import 'package:pulsepay/common/custom_button.dart';
import 'package:pulsepay/forms/add_user.dart';
import 'package:pulsepay/forms/manage_users.dart';
import 'package:pulsepay/home/home_page.dart';
import 'package:pulsepay/home/settings.dart';

class UsersPage extends StatelessWidget{
  const UsersPage({super.key});

  @override
  Widget build(BuildContext context){
    return Scaffold(
      backgroundColor: Colors.white ,
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(50)
        ,child: AppBar(
          centerTitle: true,
          title: const Text("User Management" , style: TextStyle(fontSize: 20, color: Colors.white, fontWeight:  FontWeight.bold),),
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
      body:  SafeArea(
        bottom: false,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Lottie.asset('assets/users2.json'),
              const SizedBox(height: 20,),
              CustomOutlineBtn(
                text:"Manage Permissions",
                color: Colors.blue,
                color2:Colors.blue ,
                onTap: (){
          
                },
                height: 50,
              ),
              const SizedBox(height: 20,),
              CustomOutlineBtn(
                text:"Manage Users",
                color: Colors.blue,
                color2:Colors.blue ,
                onTap: (){
                  Get.to(()=> const ManageUsers());
                },
                height: 50,
              ),
              const SizedBox(height: 20,),
              CustomOutlineBtn(
                text:"Add User",
                color: Colors.blue,
                color2:Colors.blue ,
                onTap: (){
                  Get.to(()=> const AddUser());
                },
                height: 50,
              ),
              const SizedBox(height: 20,),
              CustomOutlineBtn(
                text:"Assign Roles",
                color: Colors.blue,
                color2:Colors.blue,
                onTap: (){
          
                },
                height: 50,
              )
            ],
          ),
        )),
        bottomNavigationBar: BottomAppBar(
        color: Colors.white,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            IconButton(
                onPressed: (){

                },
                icon: const Column(
                  children: [
                    Icon(Icons.home, color: Colors.black,),
                    Text(
                        "Home",
                        style: TextStyle(fontSize: 10),
                    )
                  ],
                ),
            ),
            IconButton(
              onPressed: (){
                //Navigator.pushReplacement(
                  //context,
                  //MaterialPageRoute(builder: (context) => MyAccount()),
                //);
              },
              icon: const Column(
                children: [
                  Icon(Icons.list_alt, color: Colors.grey),
                  Text(
                    "Fiscalization",
                    style: TextStyle(fontSize: 10),
                  )
                ],
              ),
            ),
            FloatingActionButton(
                onPressed: (){
                 // Navigator.pushReplacement(
                   // context,
                   // MaterialPageRoute(builder: (context) => const Apply()),
                  //);
                },
                backgroundColor: Colors.blue,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                child: const Icon(
                  Icons.calculate,
                  color: Colors.white,
                ),
            ),
            IconButton(
              onPressed: (){
               // Navigator.pushReplacement(
                 // context,
                 // MaterialPageRoute(builder: (context) => MyLoans()),
                //);
              },
              icon: const Column(
                children: [
                  Icon(Icons.summarize, color: Colors.grey),
                  Text(
                    "Reporting",
                    style: TextStyle(fontSize: 10),
                  )
                ],
              ),
            ),
            IconButton(
              onPressed: (){
               // Navigator.pushReplacement(
                 // context,
                 // MaterialPageRoute(builder: (context) => Profile()),
               // );
               Get.to(()=> const Settings());
              },
              icon: const Column(
                children: [
                  Icon(Icons.settings, color: Colors.grey),
                  Text(
                    "Settings",
                    style: TextStyle(fontSize: 10),
                  )
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
