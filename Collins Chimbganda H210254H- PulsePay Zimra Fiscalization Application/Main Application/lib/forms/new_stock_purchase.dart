import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pulsepay/JsonModels/json_models.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/constants.dart';
import 'package:pulsepay/common/custom_button.dart';
import 'package:pulsepay/common/custom_field.dart';
import 'package:pulsepay/forms/add_product.dart';

class NewStockPurchase extends StatefulWidget {
  const NewStockPurchase({super.key});

  @override
  State<NewStockPurchase> createState() => _NewStockPurchaseState();
}

class _NewStockPurchaseState extends State<NewStockPurchase> {
  final DatabaseHelper dbHelper  = DatabaseHelper();
  List<Map<String, dynamic>> searchResults = [];
  List<Map<String, dynamic>> selectedItem = [];
  final searchController = TextEditingController();
  final quantityController =TextEditingController();
  final payController = TextEditingController();
  final supplierController = TextEditingController();

  ////////=====FUNCTIONS=====//////////////
  ///
  void savePurchase() async {
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
      int stockPurchased = int.parse(quantityController.text.trim());
      int newStockBalance = currentBalance + stockPurchased;
      dbHelper.updateProductStockQty(productid, newStockBalance);
      dbHelper.addStockPurchase(
        StockPurchase(
          date: date,
          productid: productid,
          quantity: stockPurchased,
          payMethod: payController.text.trim(),
          supplier: supplierController.text.trim()
        )
      );
      Get.snackbar(
        "Success", "Purchase Saved",
        icon:const Icon(Icons.check),
        colorText: Colors.white,
        backgroundColor: Colors.green
      );
      setState(() {
        selectedItem.clear();
        quantityController.clear();
        payController.clear();
        supplierController.clear();
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
        toolbarHeight: 80,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(25),
            bottomRight: Radius.circular(25),
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
                  const SizedBox(height: 15,),
                  const Text("Products" , style: TextStyle(fontWeight: FontWeight.w500),),
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
                            trailing: IconButton(onPressed: ()=>addToSelected(product), icon:const Icon(Icons.add_circle_outline_sharp)),
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
                            child:  Center(child: Text("Empty Cart" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.bold , fontSize: 16))),
              
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
                    labelText: "Quantity Purchased",
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
                  TextFormField(
                    controller: payController,
                    decoration: InputDecoration(
                    labelText: "Payment Method",
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
                  TextFormField(
                    controller: supplierController,
                    decoration: InputDecoration(
                    labelText: "Supplier",
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
                    text: "Save Purchase",
                    onTap: (){
                      if(payController.text.isEmpty || quantityController.text.isEmpty || supplierController.text.isEmpty){
                        Get.snackbar(
                          "Missing Parameters",
                          "No field should be blank",
                          icon:const Icon(Icons.error),
                          colorText: Colors.black,
                          backgroundColor: Colors.amber,
                          snackPosition: SnackPosition.TOP
                        );
                      }else{
                        savePurchase();
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