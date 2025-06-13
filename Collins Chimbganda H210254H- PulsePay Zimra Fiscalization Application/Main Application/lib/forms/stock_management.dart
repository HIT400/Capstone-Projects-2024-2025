import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pulsepay/common/constants.dart';
import 'package:pulsepay/common/custom_button.dart';
import 'package:pulsepay/forms/edit_stock_purchases.dart';
import 'package:pulsepay/forms/new_stock_purchase.dart';
import 'package:pulsepay/forms/stock_take.dart';
import 'package:pulsepay/forms/view_products.dart';
import 'package:pulsepay/forms/view_stock_balances.dart';

class StockManagement extends StatelessWidget {
  const StockManagement({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.blue,
        leading: IconButton(
          onPressed: (){Get.back();},
          icon: const Icon(Icons.arrow_circle_left_outlined , color: Colors.white ,size: 30,),
        ),
        centerTitle: true,
        title: const Text("Stock Management" , style: TextStyle(fontWeight: FontWeight.w500 , fontSize: 16 , color: Colors.white),),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(20),
            bottomRight: Radius.circular(20),
          ),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          scrollDirection: Axis.vertical,
          child: Padding(
            padding:const EdgeInsets.symmetric(horizontal: 10.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20,),
                CustomOutlineBtn(
                  height: 50,
                  text: "View Stock Balances",
                  color: Colors.blue,
                  color2: Colors.blue,
                  onTap: (){
                    Get.to(()=>const ViewStockBalances());
                  },
                ),
                const SizedBox(height: 15,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Edit Product Details",
                  color: Colors.blue,
                  color2: Colors.blue,
                  onTap: (){
                    Get.to(()=> const ViewProducts());
                  },
                ),
                const SizedBox(height: 15,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Add/Change BarCode",
                  color: Colors.blue,
                  color2: Colors.blue,
                  onTap: (){},
                ),
                const SizedBox(height: 15,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Add/Change HSCode",
                  color: Colors.blue,
                  color2: Colors.blue,
                  onTap: (){},
                ),
                const SizedBox(height: 15,),
                CustomOutlineBtn(
                  height: 50,
                  text: "New Stock Purchase",
                  color: Colors.blue,
                  color2: Colors.blue,
                  onTap: (){
                    Get.to(()=> const NewStockPurchase());
                  },
                ),
                const SizedBox(height: 15,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Edit Stock Purchaes",
                  color: Colors.blue,
                  color2:Colors.blue,
                  onTap: (){
                    Get.to(
                      ()=> const EditStockPurchases()
                    );
                  },
                ),
                const SizedBox(height: 15,),
                CustomOutlineBtn(
                  height: 50,
                  text: "Stock Take",
                  color: Colors.blue,
                  color2: Colors.blue,
                  onTap: (){
                    Get.to(
                      ()=> const StockTake()
                    );
                  },
                )
              ],
            ),
          ),
        )
      ),
    );
  }
}