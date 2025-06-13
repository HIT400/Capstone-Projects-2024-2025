import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pulsepay/common/app_bar.dart';
import 'package:pulsepay/common/constants.dart';
import 'package:pulsepay/common/custom_button.dart';
import 'package:pulsepay/fiscalization/open_day_table.dart';
import 'package:pulsepay/fiscalization/submitted_receipts_table.dart';

class FiscalTables extends StatelessWidget {
  const FiscalTables({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white ,
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(50)
        ,child: AppBar(
          centerTitle: true,
          title: const Text("Fiscal Tables" , style: TextStyle(fontSize: 20, color: Colors.white, fontWeight:  FontWeight.bold),),
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
    body: SafeArea(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 10),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.start,
          crossAxisAlignment: CrossAxisAlignment.start  ,
          children: [
            const SizedBox(height: 20), 
            CustomOutlineBtn(text: "Open Day", 
              color: Colors.blue,
              color2: Colors.blue,
              height: 50,
              onTap: (){
                Get.to(()=> const OpenDayTable());
              },
            ),
            const SizedBox(height: 20), 
            CustomOutlineBtn(text: "Daily Reports", 
              color: Colors.blue,
              color2: Colors.blue,
              height: 50,
              onTap: (){
                
              },
            ),
            const SizedBox(height: 20),
            CustomOutlineBtn(text: "Submitted Receipts", 
              color: Colors.blue,
              color2: Colors.blue,
              height: 50,
              onTap: (){
                Get.to(()=> const SubmittedReceiptsTable());  
              },
            )
          ],
        ),
      )
    ),
    );
  }
}