

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lottie/lottie.dart';
import 'package:pulsepay/common/app_bar.dart';
import 'package:pulsepay/common/constants.dart';
import 'package:pulsepay/common/custom_button.dart';
import 'package:pulsepay/common/reusable_text.dart';
import 'package:pulsepay/reports/companySales.dart';
import 'package:pulsepay/reports/customerslist.dart';
import 'package:pulsepay/reports/end_of_daySlip.dart';
import 'package:pulsepay/reports/salesForProduct.dart';
import 'package:pulsepay/reports/sales_report.dart';

class Reports extends StatelessWidget {
  const Reports({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(50)
        ,child: AppBar(
          centerTitle: true,
          title: const Text("Reports" , style: TextStyle(fontSize: 18, color: Colors.white, fontWeight:  FontWeight.bold),),
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
        child: SingleChildScrollView(
          scrollDirection: Axis.vertical,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.start,
              children: [
                Center(
                child: Container(
                  height: 200,
                  width: 200,
                  child: Lottie.asset(
                    'assets/taxAnimation.json'
                  ),
                ),
              ),
                const SizedBox(height: 20,),
                const ReusableText(text: "Sales Reports", style: TextStyle(fontWeight: FontWeight.bold , fontSize: 16)),
                Container(
                  height: 5,
                  width: 110,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    color: Colors.orange
                  ),
                ),
                const SizedBox(height: 20,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Sales For Period All Users",
                  color: Colors.blue,
                  color2: Colors.blue,
                  onTap: (){
                    Get.to(()=>const  SalesReportPage());
                  },
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Sales For Product",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){
                    Get.to(()=> const Salesforproduct());
                  },
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Sales For Company",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){
                    Get.to(()=> const Companysales());
                  },
                ),
                
                
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Sales By Payment Method",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){

                  },
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  height: 50,
                  text: "End Of Day Slip",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){
                    Get.to(()=>  EndOfDayslip());
                  },
                ),
                const SizedBox(height: 20,),
                const ReusableText(text: "Stock Reports", style: TextStyle(fontWeight: FontWeight.bold , fontSize: 16)),
                Container(
                  height: 5,
                  width: 110,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    color: Colors.orange
                  ),
                ),
                const SizedBox(height: 20,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Stock Balance For Branch",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){

                  },
                ),
                
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  height: 50,
                  text: "View Stock Purchses",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){

                  },
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Individual Product Movement",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){

                  },
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Highest Movers",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){

                  },
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Stock Expiry",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){

                  },
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Price List",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){

                  },
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Perfomance Report",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){

                  },
                ),
                const SizedBox(height: 20,),
                const ReusableText(text: "Customer Reports", style: TextStyle(fontWeight: FontWeight.bold , fontSize: 16)),
                Container(
                  height: 5,
                  width: 140,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    color: Colors.orange
                  ),
                ),
                const SizedBox(height: 20,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Customer Purchases For Period",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){

                  },
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Customer List For Company",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){
                    Get.to(()=> const Customerslist());
                  },
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Fiscalized Customers",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){

                  },
                ),
                // const SizedBox(height: 20,),
                // const ReusableText(text: "Discounts Reports", style: TextStyle(fontWeight: FontWeight.w500 , fontSize: 16)),
                // Container(
                //   height: 5,
                //   width: 140,
                //   decoration: BoxDecoration(
                //     borderRadius: BorderRadius.circular(20),
                //     color: kDark
                //   ),
                // ),
                // const SizedBox(height: 10,),
                // CustomOutlineBtn(
                //   height: 50,
                //   width: 340,
                //   text: "Discounts Given For Period",
                //   color: kDark ,
                //   color2: kDark,
                //   onTap: (){

                //   },
                // ),
                const SizedBox(height: 20,),
                const ReusableText(text: "Tax", style: TextStyle(fontWeight: FontWeight.w500 , fontSize: 16)),
                Container(
                  height: 5,
                  width: 40,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    color: Colors.orange
                  ),
                ),
                const SizedBox(height: 20,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Tax Returns For Company",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){

                  },
                ),
                const SizedBox(height: 20,),
                const ReusableText(text: "Fiscal Reports", style: TextStyle(fontWeight: FontWeight.w500 , fontSize: 16)),
                Container(
                  height: 5,
                  width: 110,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    color:Colors.orange
                  ),
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Print Z Report",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){

                  },
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Print X Report",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){

                  },
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  height: 50,
                  text: "RePrint Receipt",
                  color: Colors.blue ,
                  color2: Colors.blue,
                  onTap: (){

                  },
                ),
              ],
            ),
          ),
        )
      ),
    );
  }
}