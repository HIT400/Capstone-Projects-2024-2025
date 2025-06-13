import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pulsepay/JsonModels/json_models.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
//import 'package:pulsepay/authentication/login.dart';
import 'package:pulsepay/forms/view_products.dart';
import 'package:pulsepay/home/home_page.dart';

class AddProduct extends StatefulWidget{
  const AddProduct ({super.key});

  @override
  State<AddProduct> createState() => _AddproductState();
}

class _AddproductState extends State<AddProduct>{
  final productname = TextEditingController();
  final barcode = TextEditingController();
  final hsCodeController = TextEditingController();
  final costprice = TextEditingController();
  final sellingprice = TextEditingController();
  final vatBracket  = TextEditingController();
  final initStockController = TextEditingController();

  bool isVisible = false;

  void clearFields(){
    productname.clear();
    barcode.clear();
    hsCodeController.clear();
    costprice.clear();
    sellingprice.clear();
    vatBracket.clear();
    initStockController.clear();
  }

  final db = DatabaseHelper();
  final formKey = GlobalKey<FormState>();
  @override
  Widget build(BuildContext context){
    return Scaffold(
      backgroundColor: const Color.fromARGB(255,255,255,255),
      body: SingleChildScrollView(
        child: SafeArea(
          child: Center(
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
                          height: 50,
                        ),
                      ),
                      const SizedBox(height: 15),
                      const SizedBox(height: 8,),
                      Text(
                        "Enter Details Below To Register Product",
                        style: TextStyle(
                          color: Colors.grey.shade800,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 24,),
                      //email address field
                      TextFormField(
                        controller: productname,
                        decoration: InputDecoration(
                            labelText: 'Product Name',
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
                            return "Product name is required";
                          }return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      // Password Field
                      TextFormField(
                        controller: barcode,
                        decoration: InputDecoration(
                          labelText: 'BarCode',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                        validator: (value){
                          if(value!.isEmpty){
                            return "Barcode Required";
                          }return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: hsCodeController,
                        decoration: InputDecoration(
                          labelText: 'HsCode',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                        validator: (value){
                          if(value!.isEmpty){
                            return "Hs Code Required";
                          }return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: costprice,
                        decoration: InputDecoration(
                          labelText: 'Cost Price',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                        validator: (value){
                          if(value!.isEmpty){
                            return "Cost Price Required";
                          }return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: sellingprice,
                        decoration: InputDecoration(
                          labelText: 'Selling Price',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                        validator: (value){
                          if(value!.isEmpty){
                            return "Selling Price Required";
                          }return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: vatBracket,
                        decoration: InputDecoration(
                          labelText: 'VAT Bracket',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                        validator: (value){
                          if(value!.isEmpty){
                            return "VAT Bracket Required";
                          }return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: initStockController,
                        decoration: InputDecoration(
                          labelText: 'Stock Quantity',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                        validator: (value){
                          if(value!.isEmpty){
                            return "Put Zero dont leave blank";
                          }return null;
                        },
                      ),
                      const SizedBox(height: 20,),
                      // Signup Button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () async {
                            if (formKey.currentState!.validate()) {
                              try {
                                final db = DatabaseHelper();
                                await db.addProduct(Products(
                                  productName: productname.text,
                                  hsCode:int.parse(hsCodeController.text),
                                  barcode: barcode.text,
                                  sellingPrice: double.parse(sellingprice.text),
                                  costPrice: double.parse(costprice.text),
                                  tax: vatBracket.text,
                                  stockQty: int.parse(initStockController.text)
                                ));
                                // Navigate to the HomePage after successful product addition
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (context) => const ViewProducts()),
                                );
                                clearFields();
                                } catch (e) {
                                  Get.snackbar(
                                    "Error",
                                    "Error adding product: $e",
                                    icon:const Icon(Icons.error),
                                    colorText: Colors.white,
                                    backgroundColor: Colors.red,
                                    snackPosition: SnackPosition.TOP
                                  );
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
                            'Add Product',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
      bottomNavigationBar: BottomAppBar(
        color: const Color.fromARGB(255, 14, 19, 29),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            IconButton(
              onPressed: (){
                //Navigator.pushReplacement(
                  //context,
                  //MaterialPageRoute(builder: (context) => MyAccount()),
                //);
              },
              icon: const Column(
                children: [
                  Icon(Icons.list_alt, color: Colors.white),
                  Text(
                    "Products",
                    style: TextStyle(fontSize: 10 , color: Colors.white),
                  )
                ],
              ),
            ),
            FloatingActionButton(
                onPressed: (){
                 Navigator.pushReplacement(
                   context,
                   MaterialPageRoute(builder: (context) => const HomePage()),
                  );
                },
                backgroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                child: const Icon(
                  Icons.home,
                  color: Color.fromARGB(255, 14, 19, 29),
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
                  Icon(Icons.summarize, color: Colors.white),
                  Text(
                    "Stock",
                    style: TextStyle(fontSize: 10, color: Colors.white),
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