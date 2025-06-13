import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/custom_button.dart';

class ViewStockBalances extends StatefulWidget {
  const ViewStockBalances({super.key});
  @override
  State<ViewStockBalances> createState() => _viewStockBalanceState();
}

class _viewStockBalanceState extends State<ViewStockBalances> {
  final DatabaseHelper dbHelper = DatabaseHelper();
  List<Map<String, dynamic>> products = [];
  List<int> selectedProduct = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchUsers();
  }

  Future<void> fetchUsers() async {
    List<Map<String, dynamic>> data = await dbHelper.getAllProducts();
    setState(() {
      products = data;
      isLoading = false;
    });
  }

  void toggleSelection(int productId) {
    setState(() {
      if (selectedProduct.contains(productId)) {
        selectedProduct.remove(productId);
      } else {
        selectedProduct.add(productId);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.blue,
        leading: IconButton(
          onPressed: (){Get.back();},
          icon: const Icon(Icons.arrow_circle_left_outlined , color: Colors.white ,size: 30,),
        ),
        centerTitle: true,
        title: const Text("Stock Balances" , style: TextStyle(fontWeight: FontWeight.w500 , fontSize: 16 , color: Colors.white),),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(20),
            bottomRight: Radius.circular(20),
          ),
        ),
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
                      columns: const [
                        DataColumn(label: Text("Select")),
                        DataColumn(label: Text('ProductName')),
                        DataColumn(label: Text('BarCode')),
                        DataColumn(label: Text('Stock QTY')),
                      ],
                      rows: products
                          .map(
                            (product) {
                              final productId = product['productid'];
                              return DataRow(
                              cells: [
                                DataCell(
                                  Checkbox(
                                    value: selectedProduct.contains(productId),
                                    onChanged: (_) => toggleSelection(productId),
                                  ),
                                ),
                                DataCell(Text(product['productName'].toString())),
                                DataCell(Text(product['barcode'].toString())),
                                DataCell(Text(product["stockQty"].toString()))
                              ],
                            );
                          })
                          .toList(),
                    ),
                  ),
                ),
                const SizedBox(height: 50,),
                if (selectedProduct.isNotEmpty)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  CustomOutlineBtn(
                    width: 90,
                    height: 50,
                    text: "View Stock Movement",
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
                    text: "Cancel",
                    color:const Color.fromARGB(255, 14, 19, 29),
                    color2: const Color.fromARGB(255, 14, 19, 29) ,
                    onTap: (){
                      //showPasswordPrompt();
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
