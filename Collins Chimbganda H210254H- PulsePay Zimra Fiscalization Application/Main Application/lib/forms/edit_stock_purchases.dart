import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/custom_button.dart';

class EditStockPurchases extends StatefulWidget {
  const EditStockPurchases({super.key});
  @override
  State<EditStockPurchases> createState() => _editStockPurchasesState();
}

class _editStockPurchasesState extends State<EditStockPurchases> {
  final DatabaseHelper dbHelper = DatabaseHelper();
  List<Map<String, dynamic>> purchases = [];
  List<int> selectedPurchase = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchPurchases();
  }

  Future<void> fetchPurchases() async {
    List<Map<String, dynamic>> data = await dbHelper.getAllStockPurchases();
    setState(() {
      purchases = data;
      isLoading = false;
    });
  }

  void toggleSelection(int purchaseId) {
    setState(() {
      if (selectedPurchase.contains(purchaseId)) {
        selectedPurchase.remove(purchaseId);
      } else {
        selectedPurchase.add(purchaseId);
      }
    });
  }

  void showPasswordPrompt() {
    final TextEditingController passwordController = TextEditingController();
    final TextEditingController stockController = TextEditingController();

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context){
        return AlertDialog(
          title:  const Text("Enter Password"),
          content:Column(
            mainAxisSize: MainAxisSize.min ,
            children: [
              const Text("Please enter admin password and reason to cancel the invoice"),
              const SizedBox(height: 10,),
              TextField(
                controller: passwordController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Password',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 10,),
              TextField(  
                controller: stockController,
                obscureText: false,
                decoration: const InputDecoration(
                  labelText: 'Quantity Returned',
                  border: OutlineInputBorder(),
                ),
              )
            ],
          ),
          actions: [
            TextButton(
            onPressed: () {
              Navigator.of(context).pop(); // Close the dialog
            },
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final enteredPassword = passwordController.text.trim();
              final stockQty = int.tryParse(stockController.text.trim()) ?? 0;
              validatePassword(enteredPassword , stockQty);
            },
            child: const Text('Submit'),
          ),
          ],
        );
      }
    );
  }

  void validatePassword(String enteredPassword , int stockQty) async {
  const String correctPassword = 'admin123'; // Replace with your password logic

  if (enteredPassword == correctPassword && stockQty > 0) {
    // Password is correct, proceed to cancel the invoice
    returnStock(stockQty);
    Navigator.of(context).pop(); // Close the dialog
    
  } else {
    Navigator.of(context).pop();
    Get.snackbar(
      'Denied!',
      'Wrong password/Reason not found',
      icon: const Icon(Icons.error, color: Colors.white,),
      colorText: Colors.white,
      backgroundColor: Colors.red,
      snackPosition: SnackPosition.TOP,
      );
    }
  }

  void returnStock(int stockQty) async{
    int purchaseId = selectedPurchase[0];
    List<Map<String , dynamic>> stockPurchase = await dbHelper.getStockPurchaseById(purchaseId);
    int productId  = stockPurchase[0]['productid'];
    int quantity = stockPurchase[0]['quantity'];
    int NewStockPurchaseQty = quantity - stockQty;
    dbHelper.updateStockPurchaseQty(purchaseId, NewStockPurchaseQty);
    List<Map<String , dynamic>> product = await dbHelper.getProductById(productId);
    if (product.isNotEmpty){
      int productQTy = product[0]['stockQty'];
      int newProductQty = productQTy - stockQty;
      dbHelper.updateProductStockQty(productId, newProductQty);
      fetchPurchases();
      Get.snackbar("Success", "Stock Returned",
      icon: const Icon(Icons.message, color: Colors.white,)
      , colorText: Colors.white,
      backgroundColor: Colors.green,
      snackPosition: SnackPosition.TOP,
      );
      setState(() {
        fetchPurchases();
        selectedPurchase.clear();
      });
    }
    else{
      Get.snackbar("Not Found", "Product Not Found",
      icon: const Icon(Icons.error, color: Colors.white,)
      , colorText: Colors.white,
      backgroundColor: Colors.red,
      snackPosition: SnackPosition.TOP,
      );
      
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(50)
        ,child: AppBar(
          centerTitle: true,
          title: const Text("Stock Purchases" , style: TextStyle(fontSize: 20, color: Colors.white, fontWeight:  FontWeight.bold),),
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
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20,),
              SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: SingleChildScrollView(
                    child: DataTable(
                      headingTextStyle: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                      headingRowColor: MaterialStateProperty.all(Colors.blue),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10)
                      ),
                      columns: const [
                        DataColumn(label: Text("Select")),
                        DataColumn(label: Text('Date')),
                        DataColumn(label: Text('Product')),
                        DataColumn(label: Text('Quantity')),
                        DataColumn(label: Text('Pay Method')),
                        DataColumn(label: Text("Supplier")),
                      ],
                      rows: purchases
                          .map(
                            (purchase) {
                              final purchaseId = purchase['purchaseId'];
                              return DataRow(
                              cells: [
                                DataCell(
                                  Checkbox(
                                    value: selectedPurchase.contains(purchaseId),
                                    onChanged: (_) => toggleSelection(purchaseId),
                                  ),
                                ),
                                DataCell(Text(purchase['date'].toString())),
                                DataCell(Text(purchase['productid'].toString())),
                                DataCell(Text(purchase['quantity'].toString())),
                                DataCell(Text(purchase['payMethod'].toString())),
                                DataCell(Text(purchase['supplier'].toString())),
                              ],
                            );
                          })
                          .toList(),
                    ),
                  ),
                ),
                const SizedBox(height: 50,),
                if (selectedPurchase.isNotEmpty)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  CustomOutlineBtn(
                    width: 90,
                    height: 50,
                    text: "View",
                    color:const Color.fromARGB(255, 14, 19, 29),
                    color2: const Color.fromARGB(255, 14, 19, 29),
                    onTap: (){
                      //final i = selectedUsers.first;
                      //fetchSalesForInvoice(invoiceId);
                    },
                  ),
                  CustomOutlineBtn(
                    width: 90,
                    height: 50,
                    text: "Return",
                    color:const Color.fromARGB(255, 14, 19, 29),
                    color2: const Color.fromARGB(255, 14, 19, 29) ,
                    onTap: (){
                      showPasswordPrompt();
                    },
                  ),
                  CustomOutlineBtn(
                    width: 90,
                    height: 50,
                    text: "Edit",
                    color:const Color.fromARGB(255, 14, 19, 29),
                    color2: const Color.fromARGB(255, 14, 19, 29),
                    onTap: (){
                    },
                  ),
                ],
              ),
            ],
          ),

    );
  }
}
