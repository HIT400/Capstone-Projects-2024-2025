import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/authentication/login.dart';
import 'package:pulsepay/forms/add_product.dart';
import 'package:pulsepay/forms/cancelledInvoices.dart';
import 'package:pulsepay/forms/flagged_receipts.dart';
import 'package:pulsepay/forms/my_taxes.dart';
//import 'package:pulsepay/forms/barcode_Tester.dart';
//import 'package:pulsepay/forms/change_barcodes.dart';
import 'package:pulsepay/forms/reports.dart';
import 'package:pulsepay/forms/sales.dart';
import 'package:pulsepay/forms/sales_invoices.dart';
import 'package:pulsepay/forms/stock_management.dart';
import 'package:pulsepay/forms/users.dart';
import 'package:pulsepay/forms/view_invoices.dart';
import 'package:pulsepay/home/fiscal_page.dart';
import 'package:pulsepay/home/settings.dart';
import 'package:pulsepay/pointOfSale/pos.dart';
import 'package:http/http.dart' as http;
//import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:get/get.dart';
import 'package:sqflite/sqflite.dart';

class HomePage extends StatefulWidget{
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage>{
  DatabaseHelper dbHelper = DatabaseHelper();
  Timer? _timer;
  @override
  void initState() {
    super.initState();
    // Run immediately on open
    // syncReceiptAnomalies();
    // // Schedule every 2 hours thereafter
    // _timer = Timer.periodic(
    //   Duration(hours: 2),
    //   (_) => syncReceiptAnomalies(),
    // );
  }
  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  Future<void> syncReceiptAnomalies() async{
    final receipts = await dbHelper.getReceiptsADetection();

    for (final row in receipts) {
    final int globalNo = row['receiptGlobalNo'] as int;
    final String jsonBody = row['receiptJsonbody'] as String;

    Map<String, dynamic> receiptMap;
    try {
      receiptMap = jsonDecode(jsonBody) as Map<String, dynamic>;
    } catch (e) {
      print('JSON decode error for receipt $globalNo: $e');
      continue;
    }

    final receipt = receiptMap['receipt'] as Map<String, dynamic>?;
    if (receipt == null) continue;

    // Extract common fields
    final dynamic totalRaw = receipt['receiptTotal'];
    final double receiptTotal = totalRaw is String
        ? double.tryParse(totalRaw) ?? 0.0
        : (totalRaw as num).toDouble();

    // Loop through each tax entry
    final taxes = receipt['receiptTaxes'] as List<dynamic>?;
    if (taxes == null) continue;

    for (final taxEntry in taxes) {
      final tax = taxEntry as Map<String, dynamic>;
      final double taxAmount = tax['taxAmount'] is String
          ? double.tryParse(tax['taxAmount']) ?? 0.0
          : (tax['taxAmount'] as num).toDouble();
      final double salesAmountWithTax = tax['salesAmountWithTax'] is String
          ? double.tryParse(tax['salesAmountWithTax']) ?? 0.0
          : (tax['salesAmountWithTax'] as num).toDouble();
      // final double taxPercent = tax['taxPercent'] is String
      //     ? double.tryParse(tax['taxPercent']) ?? 0.0
      //     : (tax['taxPercent'] as num).toDouble();
      final double taxPercent = double.tryParse(
        tax['taxPercent']?.toString() ?? '0'
      ) ?? 0.0;

      // Prepare payload
      final payload = jsonEncode({
        'receiptGlobalNo': globalNo,
        'receiptTotal': receiptTotal,
        'taxAmount': taxAmount,
        'salesAmountWithTax': salesAmountWithTax,
        'taxPercent': taxPercent,
      });

      // Send to Flask API
      try {
        final response = await http.post(
          Uri.parse('http://10.0.3.2:5000/analyze'),
          headers: {'Content-Type': 'application/json'},
          body: payload,
        );

        if (response.statusCode == 200) {
          final Map<String, dynamic> result =
              jsonDecode(response.body) as Map<String, dynamic>;
          final int isAnomaly = result['is_anomaly'] == true ? 1 : 0;
          final double score = (result['anomaly_score'] as num).toDouble();

          // Insert into receiptAnomallies
          final Database db = await dbHelper.initDB();
          await db.insert(
            'receiptAnomallies',
            {
              'receiptGlobalNo': globalNo,
              'isAnomaly': isAnomaly,
              'score': score,
              'receiptTotal': receiptTotal,
              'taxAmount': taxAmount,
              'salesAmountWithTax': salesAmountWithTax,
              'taxPercent': taxPercent.toString(),
            },
          );
        } else {
          print('API error ${response.statusCode}: ${response.body}');
        }
      } catch (e) {
        print('HTTP error for receipt $globalNo: $e');
      }
    }
  }

  }
  @override
  Widget build(BuildContext context){
    return  Scaffold(
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        scrollDirection: Axis.vertical,
        child: SafeArea(
          bottom: false,
            child:  Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(10.0),
                  child: Container(
                    height: 100,
                    width: 390,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      color: Colors.blue
                    ),
                    child: Padding(
                        padding: const EdgeInsets.all(16.0),
                        child: Row(
                          children: [
                             const Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text("Welcome Back!",
                                  style: TextStyle(color: Colors.white),
                                ),
                                Text("User",
                                  style: TextStyle(color: Colors.white, fontSize: 24 , fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                            const Spacer(),
                            IconButton.outlined(onPressed: (){
                              Navigator.push(context,
                              MaterialPageRoute(builder: (context)=> const Login()));
                            }, icon: const Icon(Icons.logout_sharp, color: Colors.white, ), color: Colors.white, highlightColor: Colors.white,)
                          ],
                        ),
                    ),
                  ),
                ),
                //const SizedBox(height: 5,),
                const Padding(
                  padding: EdgeInsets.all(16.0),
                  child: Text("Quick Navigation" ,style: TextStyle(fontWeight: FontWeight.bold , fontSize: 24.0 , color: Colors.black ),),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Container(
                      height: 100,
                      width: 100,
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        borderRadius: BorderRadius.circular(15.0)
                      ),
                      child: TextButton(onPressed: (){
                        Get.to(() => const InvoicesPage());
                      },
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8 , horizontal: 15),
                        child: Column(
                          children: [
                            Icon(Icons.monetization_on , size: 30, color: Colors.white),
                            Text('Sales Data' , textAlign: TextAlign.center ,style: TextStyle(fontWeight: FontWeight.bold , fontSize: 12, color:Colors.white ),)
                          ],
                        ),
                      )),
                    ),
                    Container(
                      height: 100,
                      width: 100,
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        borderRadius: BorderRadius.circular(15.0)
                      ),
                      child: TextButton(onPressed: (){
                        Get.to(()=> const StockManagement());
                      },
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8 , horizontal: 15),
                        child: Column(
                          children: [
                            Icon(Icons.shopping_bag_sharp , size: 30, color: Colors.white,),
                            Text('Stock Updates' , textAlign: TextAlign.center,style: TextStyle(fontWeight: FontWeight.bold , fontSize: 12, color:Colors.white ),)
                          ],
                        ),
                      )),
                    ),
                    Container(
                      height: 100,
                      width: 100,
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        borderRadius: BorderRadius.circular(15.0)
                      ),
                      child: TextButton(onPressed: (){
                        Navigator.push(context,
                        MaterialPageRoute(builder: (context) => const AddProduct()  ));
                      },
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8 , horizontal: 15),
                        child: Column(
                          children: [
                            Icon(Icons.add_box_rounded , size: 30, color: Colors.white,),
                            Text('Add Product' ,textAlign: TextAlign.center,style: TextStyle(fontWeight: FontWeight.bold , fontSize: 12, color:Colors.white),)
                          ],
                        ),
                      )),
                    ),
                  ],
                ),
                const SizedBox(height: 15,),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Container(
                      height: 100,
                      width: 100,
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        borderRadius: BorderRadius.circular(15.0)
                      ),
                      child: TextButton(onPressed: (){
                        Get.to(()=> const ViewInvoices());
                      },
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8 , horizontal: 15),
                        child: Column(
                          children: [
                            Icon(Icons.remove_red_eye , size: 30, color: Colors.white),
                            Text('View Invoices' ,textAlign: TextAlign.center,style: TextStyle(fontWeight: FontWeight.bold , fontSize: 12, color:Colors.white ),)
                          ],
                        ),
                      )),
                    ),
                    Container(
                      height: 100,
                      width: 100,
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        borderRadius: BorderRadius.circular(15.0)
                      ),
                      child: TextButton(onPressed: (){
                        Get.to(()=> const Cancelledinvoices());
                      },
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8 , horizontal: 15),
                        child: Column(
                          children: [
                            Icon(Icons.cancel , size: 30, color: Colors.white),
                            Text('Invoice Returns' ,textAlign: TextAlign.center,style: TextStyle(fontWeight: FontWeight.bold , fontSize: 12, color:Colors.white ),)
                          ],
                        ),
                      )),
                    ),
                    Container(
                      height: 100,
                      width: 100,
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        borderRadius: BorderRadius.circular(15.0)
                      ),
                      child: TextButton(onPressed: (){
                        Get.to(()=> const MyTaxes());
                      },
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8 , horizontal: 15),
                        child: Column(
                          children: [
                            Icon(Icons.balance , size: 30, color: Colors.white),
                            Text('My Taxes' ,textAlign: TextAlign.center ,style: TextStyle(fontWeight: FontWeight.bold , fontSize: 12, color:Colors.white  ),)
                          ],
                        ),
                      )),
                    ),
                  ],
                ),
                const SizedBox(height: 15,),
                const SizedBox(height: 15,),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Container(
                      height: 100,
                      width: 100,
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        borderRadius: BorderRadius.circular(15.0)
                      ),
                      child: TextButton(onPressed: (){
                        Get.to(()=>const Reports());
                      },
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8 , horizontal: 15),
                        child: Column(
                          children: [
                            Icon(Icons.light_mode_sharp , size: 30, color: Colors.white),
                            Text('My Reports',textAlign: TextAlign.center ,style: TextStyle(fontWeight: FontWeight.bold , fontSize: 12, color:Colors.white ),)
                          ],
                        ),
                      )),
                    ),
                    Container(
                      height: 100,
                      width: 100,
                      decoration: BoxDecoration(
                        color: Colors.blue,
                        borderRadius: BorderRadius.circular(15.0)
                      ),
                      child: TextButton(onPressed: (){
                        Navigator.push(context,
                        MaterialPageRoute(builder: (context)=> const FlaggedReceipts()));
                      },
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8 , horizontal: 15),
                        child: Column(
                          children: [
                            Icon(Icons.error , size: 30, color: Colors.white),
                            Text('Flagged Receipt',textAlign: TextAlign.center ,style: TextStyle(fontWeight: FontWeight.bold , fontSize: 12, color:Colors.white  ),)
                          ],
                        ),
                      )),
                    ),
                    Container(
                      height: 100,
                      width: 100,
                      decoration: BoxDecoration(
                        color: Colors.orange,
                        borderRadius: BorderRadius.circular(15.0)
                      ),
                      child: TextButton(onPressed: (){},
                      child: const Padding(
                        padding: EdgeInsets.symmetric(vertical: 8 , horizontal: 15),
                        child: Column(
                          children: [
                            Icon(Icons.print_rounded , size: 30, color: Colors.white),
                            Text('Printer Settings' ,  textAlign: TextAlign.center,style: TextStyle(fontWeight: FontWeight.bold , fontSize: 12, color:Colors.white ),)
                          ],
                        ),
                      )),
                    ),
                  ],
                ),
                const SizedBox(height: 15,),
                Padding(
                  padding: const EdgeInsets.all(10.0),
                  child: Container(
                    height: 200,
                    width: 390,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.grey, width: 5),
                      // image: const DecorationImage(
                      //   image: Lottie.asset("assets/dash.json"),
                      //   fit: BoxFit.cover,
                      // ),
                    ),
                    child: Lottie.asset('assets/dash.json'),
                  ),
                ),
              ],
            )
        ),
      ),
      bottomNavigationBar: BottomAppBar(
        color: Colors.white,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            IconButton(
                onPressed: (){
                  Get.to(()=> const HomePage());
                },
                icon: const Column(
                  children: [
                    Icon(Icons.home, color: Colors.black,),
                    Text(
                        "Home",
                        style: TextStyle(fontSize: 10),
                    )
                  ],
                ),
            ),
            IconButton(
              onPressed: (){
                //Navigator.pushReplacement(
                  //context,
                  //MaterialPageRoute(builder: (context) => MyAccount()),
                //);
                Get.to(()=> const FiscalPage());
              },
              icon: const Column(
                children: [
                  Icon(Icons.list_alt, color: Colors.grey),
                  Text(
                    "Fiscalization",
                    style: TextStyle(fontSize: 10),
                  )
                ],
              ),
            ),
            FloatingActionButton(
                onPressed: (){
                    Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => const Pos()),
                  );
                },
                backgroundColor: Colors.blue,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                child: const Icon(
                  Icons.calculate,
                  color: Colors.white,
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
                  Icon(Icons.summarize, color: Colors.grey),
                  Text(
                    "Reporting",
                    style: TextStyle(fontSize: 10),
                  )
                ],
              ),
            ),
            IconButton(
              onPressed: (){
               // Navigator.pushReplacement(
                 // context,
                 // MaterialPageRoute(builder: (context) => Profile()),
               // );
               Get.to(()=> const Settings());
              },
              icon: const Column(
                children: [
                  Icon(Icons.settings, color: Colors.grey),
                  Text(
                    "Settings",
                    style: TextStyle(fontSize: 10),
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

class QuickServiceButton extends StatelessWidget{
  final IconData icon;
  final String label;

  const QuickServiceButton({
    required this.icon,
    required this.label
  });

  @override
  Widget build(BuildContext context){
    return Column(
      children: [
        CircleAvatar(
          backgroundColor: Colors.grey.shade800,
          radius: 30,
          child: Icon(icon, color: Colors.white,size: 30, ),
        ),
        const SizedBox(height: 8,),
        Text(
          label,
          style: const TextStyle(color: Colors.white),
        )
      ],
    );
  }
}