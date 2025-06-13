import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pulsepay/JsonModels/json_models.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/constants.dart';
import 'package:pulsepay/common/custom_button.dart';
import 'package:pulsepay/common/custom_field.dart';
import 'package:pulsepay/forms/add_product.dart';

class StockTake extends StatefulWidget {
  const StockTake({super.key});

  @override
  State<StockTake> createState() => _StockTakeState();
}

class _StockTakeState extends State<StockTake> {
  final DatabaseHelper dbHelper  = DatabaseHelper();
  List<Map<String, dynamic>> searchResults = [];
  List<Map<String, dynamic>> selectedItem = [];
  final searchController = TextEditingController();
  final quantityController =TextEditingController();

  ////////=====FUNCTIONS=====//////////////
  ///
  void saveStockdate() async {
    final String date = DateTime.now().toIso8601String();
    try {
      if(selectedItem.isEmpty || quantityController.text.isEmpty){
      Get.snackbar(
        "No Product",
        "No producted was selected",
        icon:const Icon(Icons.error),
        colorText: Colors.black,
        backgroundColor: Colors.amber
      );
    }
    else{
      int productid = selectedItem[0]['productid'];
      int currentBalance = selectedItem[0]['stockQty'];
      int stockCounted = int.parse(quantityController.text.trim());
      int newStockBalance = currentBalance + stockCounted;
      dbHelper.updateProductStockQty(productid, stockCounted);
      Get.snackbar(
        "Success", "Stock Change Saved",
        icon:const Icon(Icons.check),
        colorText: Colors.white,
        backgroundColor: Colors.green
      );
      setState(() {
        selectedItem.clear();
        quantityController.clear();
      });
      
      
    }
    } catch (e) {
      Get.snackbar(
        "Error Saving","$e",
        icon:const Icon(Icons.error),
        colorText: Colors.white,
        backgroundColor: Colors.red
      );
    }
  }

  void searchProducts(String query) async{
    final results = await dbHelper.searchProducts(query);
    setState(() {
      searchResults = results;
    });
  }

  void addToSelected (Map<String , dynamic> product){
    setState(() {
      selectedItem.add(product);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.blue,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(25),
            bottomRight: Radius.circular(25)
          )
        ),
        toolbarHeight: 80,
        automaticallyImplyLeading: false,
        elevation: 0,
        title:  ClipRRect(
          borderRadius: BorderRadius.circular(25.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              GestureDetector(
                onTap: (){
                  Navigator.pop(context);
                },
                child: const Padding(
                  padding: EdgeInsets.all(8.0),
                    child: Icon(
                      CupertinoIcons.arrow_left_circle,
                      size: 30,
                      color: Colors.white,
                    ),
                  ),
              ),
              CustomField(
                controller: searchController,
                onChanged: searchProducts ,
              ),
              GestureDetector(
                onTap: ()=> searchProducts(searchController.text),
                child: const Icon(
                  CupertinoIcons.search_circle,
                  size: 30,
                  color: Colors.white,
                ),
              )
            ],
          ),
        ),
      ),
      body: SingleChildScrollView(
        scrollDirection: Axis.vertical,
        child: SafeArea(
          child: Padding(
            padding:const EdgeInsets.symmetric(horizontal: 5.0 , vertical: 10.0),
            child: Form(
              child: Column(
                children: [
                  const SizedBox(height: 10,),
                  const Text("Products" , style: TextStyle(fontWeight: FontWeight.w500),),
                  const SizedBox(height: 10,),
                  Container(
                    height: 150,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10.0),
                      border: Border.all(width: 1 , color: Colors.grey.shade400),
                      color: Colors.grey.shade400,
                    ),
                    child: ListView.builder(
                      itemCount: searchResults.length,
                      itemBuilder: (context , index){
                        final product = searchResults[index];
                        return Container(
                          margin: const EdgeInsets.symmetric(vertical: 5.0, horizontal: 10.0),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey, width: 1.0),
                            borderRadius: BorderRadius.circular(10.0), 
                            color: Colors.white, 
                          ),
                          child: ListTile(
                            title: Text(product['productName']),
                            subtitle: Text("Price: \$${product['sellingPrice']}"),
                            trailing: IconButton(onPressed: (){
                              if (selectedItem.isEmpty){
                                addToSelected(product);
                              }else{
                                setState(() {
                                  selectedItem.clear();
                                });
                                if(selectedItem.isEmpty){
                                  addToSelected(product);
                                }
                              }
                              
                            }   , 
                            icon:const Icon(Icons.add_circle_outline_sharp)),
                          ),
                        );
                      }
                      ),
                  ),
                  const SizedBox(height: 10,),
                  CustomOutlineBtn(
                    color: Colors.green,
                    color2: Colors.green,
                    height: 40,
                    text: "Click If New Product",
                    onTap: (){
                      Get.to(()=> const AddProduct());
                    },
                  ),
                  const SizedBox(height: 10,),
                  const Text("Selected Product" , style: TextStyle(fontWeight: FontWeight.w500),),
                  const SizedBox(height: 10,),
                  Container(
                    height: 100,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10.0),
                      color: Colors.blue,
                    ),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 10.0),
                      child: ListView(
                        scrollDirection: Axis.vertical,
                        children: [
                          selectedItem.isEmpty ?
                          const Padding(
                            padding: EdgeInsets.only(top: 40),
                            child:  Center(child: Text("No product Selected" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.bold , fontSize: 16))),
              
                          ) :
                          Column(
                            children: [
                              const SizedBox(height: 10,),
                              Text("BarCode : ${selectedItem[0]['barcode']}" , style: const TextStyle(color: Colors.white , fontWeight: FontWeight.bold , fontSize: 16),),
                              Text("Product : ${selectedItem[0]['productName']}" , style: const TextStyle(color: Colors.white , fontWeight: FontWeight.bold , fontSize: 16)),
                              Text("Stock Balance : ${selectedItem[0]['stockQty']}" , style:const TextStyle(color: Colors.white , fontWeight: FontWeight.bold , fontSize: 16))
                          ],)
                          
                          //
                          //
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 10,),
                  const Text("Enter Stock" , style: TextStyle(fontWeight: FontWeight.w500),),
                  const SizedBox(height: 10,),
                 
                  const SizedBox(height: 10,),
                  TextFormField(
                    controller: quantityController,
                    decoration: InputDecoration(
                    labelText: "New Stock Quantity",
                    labelStyle: TextStyle(color: Colors.grey.shade600),
                    filled: true,
                    fillColor: Colors.grey.shade300,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12.0),
                      borderSide: BorderSide.none
                    )
                    ),
                    style: const TextStyle(color: Colors.black),
                  ),
                  const SizedBox(height: 10,),
                  CustomOutlineBtn(
                    color: Colors.green,
                    color2: Colors.green,
                    height: 50,
                    text: "Save Stocky Quantity",
                    onTap: (){
                      if(quantityController.text.isEmpty){
                        Get.snackbar(
                          "Missing Parameters",
                          "No field should be blank",
                          icon:const Icon(Icons.error),
                          colorText: Colors.black,
                          backgroundColor: Colors.amber,
                          snackPosition: SnackPosition.TOP
                        );
                      }else{
                        saveStockdate();
                      }
                      
                    },
                  ),
                ],
              ),
            ),
          )
        ),
      ),
    );
  }
}