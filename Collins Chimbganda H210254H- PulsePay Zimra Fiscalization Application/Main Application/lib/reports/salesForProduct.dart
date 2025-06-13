import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pulsepay/JsonModels/json_models.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/custom_button.dart';
import 'package:pulsepay/common/custom_field.dart';

class Salesforproduct extends StatefulWidget {
  const Salesforproduct({super.key});

  @override
  State<Salesforproduct> createState() => _SalesforproductState();
}

class _SalesforproductState extends State<Salesforproduct> {

  final DatabaseHelper dbHelper  = DatabaseHelper();
  List<Map<String, dynamic>> searchResults = [];
  List<Map<String, dynamic>> selectedItem = [];
  List<Map<String, dynamic>> productSales = [];
  final searchController = TextEditingController();
  final quantityController =TextEditingController();
  //final payController = TextEditingController();
  //final supplierController = TextEditingController();

  void searchProducts(String query) async{
    final results = await dbHelper.searchProducts(query);
    setState(() {
      searchResults = results;
    });
  }

  void getSelectedProducts() async {
    int productId = selectedItem[0]['productid'];
    final results = await dbHelper.getProductSales(productId);
    setState(() {
      productSales = results;
    });
  } 

  void addToSelected (Map<String , dynamic> product){
    setState(() {
      selectedItem.add(product);
    });
    getSelectedProducts();
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
                            trailing: IconButton(
                              onPressed: (){
                                if(selectedItem.isEmpty) {
                                  addToSelected(product);
                                } else {
                                  Get.snackbar(
                                    "Selection Warning", 
                                    "A product is already selected. Please remove it before adding a new one.",
                                    snackPosition: SnackPosition.TOP,
                                    backgroundColor: Colors.yellow.shade800,
                                    colorText: Colors.white,
                                    icon: const Icon(Icons.warning, color: Colors.white,));
                                }
                              }, 
                              icon:const Icon(Icons.add_circle_outline_sharp)),
                          ),
                        );
                      }
                      ),
                  ),
                  const SizedBox(height: 10,),
                  CustomOutlineBtn(
                    text: "Refresh",
                    color: Colors.green,
                    color2: Colors.green,
                    height: 50,
                    onTap: (){
                      searchController.clear();
                      setState(() {
                        searchResults = [];
                        selectedItem = [];
                        productSales = [];
                      });
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
                  const Text("Product Sales" , style: TextStyle(fontWeight: FontWeight.w500),),
                  const SizedBox(height: 10,),
                  selectedItem.isEmpty ?
                  const Padding(
                    padding: EdgeInsets.only(top: 40),
                    child: Center(child: Text("Select a product to view sales" , style: TextStyle(color: Colors.black , fontWeight: FontWeight.bold , fontSize: 16))),
                  ) :
                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: DataTable(
                      headingTextStyle: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                      headingRowColor: MaterialStateProperty.all(Colors.blue),
                      columns: const [
                        DataColumn(label: Text('Date')),
                        DataColumn(label: Text('Invoice ID')),
                        DataColumn(label: Text('Quantity Sold')),
                        DataColumn(label: Text('Selling Price')),
                        DataColumn(label: Text('Tax')),
                      ],
                      rows: productSales.map((sale) {
                        return DataRow(
                          cells: [
                            DataCell(Text(sale['date'])),
                            DataCell(Text(sale['invoiceId'].toString())),
                            DataCell(Text(sale['quantity'].toString())),
                            DataCell(Text(sale['sellingPrice'].toString())),
                            DataCell(Text(sale['tax'].toString())),
                          ],
                        );
                      }).toList(),
                    ),
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