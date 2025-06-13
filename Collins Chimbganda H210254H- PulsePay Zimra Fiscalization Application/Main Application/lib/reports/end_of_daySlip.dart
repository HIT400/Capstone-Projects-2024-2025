import 'dart:ui';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:pulsepay/common/app_bar.dart';
import 'package:pulsepay/common/constants.dart';
import 'package:pulsepay/common/custom_button.dart';
import 'package:pulsepay/common/reusable_text.dart';

class EndOfDayslip extends StatefulWidget {
  const EndOfDayslip({super.key});

  @override
  State<EndOfDayslip> createState() => _EndOfDayslipState();
}

class _EndOfDayslipState extends State<EndOfDayslip> {

  String todayDate = "" ;
  

  void getDate(){
    DateTime now  = DateTime.now();
    String formattedDate = DateFormat("yyyy-MM-dd").format(now);
    todayDate = formattedDate ;
  }

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    getDate();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(50)
        ,child: AppBar(
          centerTitle: true,
          title: const Text("End Of Day Slip" , style: TextStyle(fontSize: 18, color: Colors.white, fontWeight:  FontWeight.bold),),
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
      body: Padding(
        padding:const EdgeInsets.symmetric(horizontal: 10),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.start,
          children: [
            const SizedBox(height: 50,),
            const Center(child: ReusableText(text: "Print Options", style: TextStyle(fontSize: 16 , fontWeight: FontWeight.w500))),
            const SizedBox(height: 20,),
            
            Container(
              height: 100,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10.0),
                color: Colors.green
              ),
              child: Center(
                child: Text(
                  todayDate, style: TextStyle(color: Colors.white),
                ),
              ),
            ),
            const SizedBox(height:20,),
            CustomOutlineBtn(
              text: "Print For All",
              color: kDark,
              color2: kDark,
              height: 50,
              onTap: (){

              },
            ),
            const SizedBox(height: 20,),
            const Center(child: ReusableText(text: "Print For User", style: TextStyle(fontSize: 16 , fontWeight: FontWeight.w500))),
            const SizedBox(height: 10,),
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  width: 2,
                  color: const Color(0xffC5C5C5),
                )
              ),
            ),
            CustomOutlineBtn(
              text: "Print For User",
              color: kDark,
              color2: kDark,
              height: 50,
            ),
          ],
        ),
      ),
    );
  }
}