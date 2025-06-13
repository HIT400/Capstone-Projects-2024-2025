import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/constants.dart';

class FlaggedReceipts extends StatefulWidget {
  const FlaggedReceipts({super.key});

  @override
  State<FlaggedReceipts> createState() => _FlaggedReceiptsState();
}

class _FlaggedReceiptsState extends State<FlaggedReceipts> {
  bool isLoading = false;
  DatabaseHelper dbHelper = DatabaseHelper();
  List<Map<String, dynamic>> flaggedReceipts = [];
  List<Map<String, dynamic>> anomalyReceiptsList = [];
  int anomalyReceipts = 0;
  int flaggedReceiptsCount = 0;

  @override
  void initState() {
    super.initState();
    getFlaggedReceipts();
  }

  void getFlaggedReceipts() async {
    try {
      // Fetch flagged receipts from the database
      final dbflaggedReceipts = await dbHelper.getFlaggedReceipts();
      if (dbflaggedReceipts.isNotEmpty) {
        setState(() {
          flaggedReceipts = dbflaggedReceipts;
          flaggedReceiptsCount = flaggedReceipts.length;
        });
      } else {
        print("No flagged receipts found.");
      }

      final scannedReceipts  = await dbHelper.getAnomalyTable();
      if (scannedReceipts.isNotEmpty) {
        print("receipts found");
        setState(() {
          anomalyReceiptsList = scannedReceipts;
          anomalyReceipts = anomalyReceiptsList.length;
        });
      } else {
        print("No flagged receipts found.");
      }
    } catch (e) {
      print("Error fetching flagged receipts: $e");
    } finally {
      setState(() {

      });
    }
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(50)
        ,child: AppBar(
          centerTitle: true,
          title: const Text("Flagged Receipts" , style: TextStyle(fontSize: 20, color: Colors.white, fontWeight:  FontWeight.bold),),
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
      body: SingleChildScrollView(
        scrollDirection: Axis.vertical,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20,),
              Container(
                height: 200,
                width: 390,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  color: Colors.grey.shade400
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 10,),
                    Center(child: Icon(Icons.error , color:  Colors.white,size:  60,)),
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Container(
                            width: 160,
                            height: 100,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              color:Colors.white
                            ),
                            child: Center(
                              child: Column(
                                //crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 15,),
                                  Text("Receipts Analyzed" , style:  TextStyle(color: Colors.green ,  fontSize: 16 , fontWeight: FontWeight.bold ),),
                                  const SizedBox(height: 15,),
                                  Text("$anomalyReceipts" , style:  TextStyle(color: kDark,  fontSize: 25 , fontWeight: FontWeight.bold ),),
                                ],
                              ),
                            ),
                          ),
                          Container(
                            width: 160,
                            height: 100,
                            decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(10),
                            color:Colors.white
                            ),
                            child: Center(
                              child: Column(
                                //crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const SizedBox(height: 15,),
                                  Text("Receipts Flagged" , style:  TextStyle(color: Colors.red ,  fontSize: 16 , fontWeight: FontWeight.bold ),),
                                  const SizedBox(height: 15,),
                                  Text("$flaggedReceiptsCount" , style:  TextStyle(color: kDark,  fontSize: 25 , fontWeight: FontWeight.bold ),),
                                ],
                              ),
                            ),
                          )
                        ],
                      ),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 20,),
              flaggedReceiptsCount==0 ?
                Column(
                  children: [
                    Container(
                      height: 100,
                      width: 390,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10),
                        color: Colors.green,
                      ),
                      child: const Center(
                        child: Text("No flagged receipts found !!" , style: TextStyle(color: Colors.white , fontSize: 20 , fontWeight: FontWeight.bold),),
                      ),
                    ),
                    Lottie.asset('assets/correct.json', )
                  ],
                )
              : Container(
                height: 100,
                width: 390,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  color: Colors.red,
                ),
                child: const Center(
                  child: Text("Flagged Receipts" , style: TextStyle(color: Colors.white , fontSize: 20 , fontWeight: FontWeight.bold),),
                ),
              ), 
            ],
          ),
        ),
      ),
    );
  }
}