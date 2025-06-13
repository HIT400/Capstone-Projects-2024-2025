import 'dart:convert';
import 'dart:io';
import 'package:crypto/crypto.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/constants.dart';
import 'package:pulsepay/common/custom_button.dart';
import 'package:pulsepay/common/reusable_text.dart';
import 'package:pulsepay/fiscalization/api_endPoints.dart';
import 'package:pulsepay/fiscalization/closeday.dart';
import 'package:pulsepay/fiscalization/get_status.dart';
import 'package:pulsepay/fiscalization/ping.dart';
import 'package:pulsepay/fiscalization/sslContextualization.dart';
import 'package:pulsepay/fiscalization/submitReceipts.dart';
import 'package:pulsepay/fiscalization/unsubmitted_receipt.dart';
import 'package:pulsepay/forms/interact.dart';
import 'package:pulsepay/home/home_page.dart';
import 'package:pulsepay/home/settings.dart';
import 'package:pulsepay/main.dart';
import 'package:pulsepay/pointOfSale/pos.dart';

class FiscalPage extends StatefulWidget {
  const FiscalPage({super.key});

  @override
  State<FiscalPage> createState() => _FiscalPageState();
}

class _FiscalPageState extends State<FiscalPage> {
  @override
  void initState(){
    super.initState();
    getlatestFiscalDay();
    fetchReceiptsPending();
    fetchReceiptsSubmitted();
    fetchAllReceipts();
    fetchDayReceiptCounter();
  }

  final DatabaseHelper dbHelper  = DatabaseHelper();
  int currentFiscal = 0;
  String deviceID = "25395";
  String taxPayerName = "STEAM TEAM (PVT)LTD";
  String tinNumber = "2000002740";
  String vatNumber = "220022786";
  String serialNumber = "steamTest-1";
  String modelName = "Server";
  List<Map<String, dynamic>> receiptsPending= [];
  List<Map<String, dynamic>> receiptsSubmitted= [];
  List<Map<String , dynamic>> allReceipts=[];
  List<Map<String,dynamic>> dayReceiptCounter = [];
  String? receiptDeviceSignature_signature_hex ;
  String? first16Chars;
  String? receiptDeviceSignature_signature;

  Future<void> fetchReceiptsPending() async {
    List<Map<String, dynamic>> data = await dbHelper.getReceiptsPending();
    setState(() {
      receiptsPending = data;
    });
  }
  Future <void> fetchReceiptsSubmitted() async{
    List<Map<String ,dynamic>> data  = await dbHelper.getSubmittedReceipts();
    setState(() {
      receiptsSubmitted = data;
    });
  }
  Future <void> fetchAllReceipts() async{
    List<Map<String ,dynamic>> data  = await dbHelper.getAllReceipts();
    setState(() {
      allReceipts = data;
    });
  }
  Future<void> fetchDayReceiptCounter() async {
    int latestFiscDay = await dbHelper.getlatestFiscalDay();
    setState(() {
      currentFiscal = latestFiscDay;
    });
    List<Map<String, dynamic>> data = await dbHelper.getReceiptsSubmittedToday(currentFiscal);
    setState(() {
      dayReceiptCounter = data;
    });
  }

  ///MANUAL OPENDAY
  Future<String> openDayManual() async {
  final dbHelper = DatabaseHelper();
  final previousData = await dbHelper.getPreviousReceiptData();
  final previousFiscalDayNo = await dbHelper.getPreviousFiscalDayNo();
  final taxIDSetting = await getConfig();

  int fiscalDayNo = (previousData["receiptCounter"] == 0 &&
          previousData["receiptGlobalNo"] == 0)
      ? 1
      : previousFiscalDayNo + 1;

  String iso8601 = DateFormat("yyyy-MM-dd'T'HH:mm:ss").format(DateTime.now());

  String openDayRequest = jsonEncode({
    "fiscalDayNo": fiscalDayNo,
    "fiscalDayOpened": iso8601,
    "taxID": taxIDSetting,
  });

  print("Open Day Request JSON: $openDayRequest");

  try {
    final response = await http.post(
      Uri.parse("https://fdmsapitest.zimra.co.zw/Device/v1/25395/OpenDay"), // Update this URL
      headers: {
        "Content-Type": "application/json",
        "DeviceModelName": "Server",
        "DeviceModelVersion": "v1"
      },
      body: openDayRequest,
    );
    if (response.statusCode == 200) {
      print("Open Day posted successfully!");
      await dbHelper.insertOpenDay(fiscalDayNo, "unprocessed", iso8601);
      return "Open Day Successfully Recorded!";
    } else {
      print("Failed to post Open Day: ${response.body}");
      return "Failed to post Open Day";
    }
  } catch (e) {
    print("Error sending request: $e");
    return "Connection error";
  }
}

Future<String> getConfig() async {
  String apiEndpointGetConfig = "https://fdmsapitest.zimra.co.zw/Device/v1/25395/GetConfig"; // Replace with actual API endpoint
  String responseMessage = "There was no response from the server. Check your connection !!";

  try {
    final uri = Uri.parse(apiEndpointGetConfig);

    final response = await http.get(
      uri,
      headers: {
        'Content-Type': 'application/json',
        'DeviceModelName': 'Server', // Replace with actual model
        'DeviceModelVersion': 'v1' // Replace with actual version
      },
    );

    if (response.statusCode == 200) {
      print("Get Config request sent successfully :)");
      print(response.body);

      Map<String, dynamic> jsonResponse = jsonDecode(response.body);

      // Extract data from JSON
      String taxPayerName = jsonResponse["taxPayerName"];
    String taxPayerTIN = jsonResponse["taxPayerTIN"]; // Keep as String
    String vatNumber = jsonResponse["vatNumber"]; // Keep as String
    String deviceSerialNo = jsonResponse["deviceSerialNo"];
    String deviceBranchName = jsonResponse["deviceBranchName"];

      // Extract address details
    Map<String, dynamic> deviceBranchAddress = jsonResponse["deviceBranchAddress"];
    String province = deviceBranchAddress["province"];
    String street = deviceBranchAddress["street"];
    String houseNo = deviceBranchAddress["houseNo"];
    String city = deviceBranchAddress["city"];

      // Extract contact details
    Map<String, dynamic> deviceBranchContacts = jsonResponse["deviceBranchContacts"];
    String phoneNo = deviceBranchContacts["phoneNo"];
    String email = deviceBranchContacts["email"];

     // Other device details
    String deviceOperatingMode = jsonResponse["deviceOperatingMode"];
    int taxPayerDayMaxHrs = jsonResponse["taxPayerDayMaxHrs"]; // Already an int
    String certificateValidTill = jsonResponse["certificateValidTill"];
    String qrUrl = jsonResponse["qrUrl"];
    int taxpayerDayEndNotificationHrs = jsonResponse["taxpayerDayEndNotificationHrs"]; // Already an int
    String operationID = jsonResponse["operationID"];
    
      // Extract applicable taxes
      List<dynamic> applicableTaxes = jsonResponse["applicableTaxes"];
      Map<String, int> taxIDs = {};

      for (var tax in applicableTaxes) {
        String taxName = tax["taxName"];
        int taxID = int.tryParse(tax["taxID"].toString()) ?? 0; 

        if (taxName == "Standard rated 15%") {
          taxIDs["VAT15"] = taxID;
        } else if (taxName == "Zero rated 0%" || taxName == "Zero rate 0%") {
          taxIDs["Zero"] = taxID;
        } else if (taxName == "Exempt") {
          taxIDs["Exempt"] = taxID;
        } else if (taxName == "Non-VAT Withholding Tax") {
          taxIDs["WT"] = taxID;
        }
      }

      // Store tax details in SQLite database
      DatabaseHelper dbHelper = DatabaseHelper();
      await dbHelper.updateDatabase(taxIDs);

      responseMessage = """
        taxPayerName: $taxPayerName
        taxPayerTIN: $taxPayerTIN
        vatNumber: $vatNumber
        deviceSerialNo: $deviceSerialNo
        deviceBranchName: $deviceBranchName
        Address: $houseNo $street, $city, $province
        Contacts: Phone - $phoneNo, Email - $email
        Operating Mode: $deviceOperatingMode
        Max Hrs: $taxPayerDayMaxHrs
        Certificate Valid Till: $certificateValidTill
        QR URL: $qrUrl
        Notification Hrs: $taxpayerDayEndNotificationHrs
        Operation ID: $operationID
        Taxes: ${taxIDs.entries.map((e) => '${e.key}: ${e.value}').join(', ')}
      """;

      print("Response received: $responseMessage");

      Get.snackbar("Zimra Response", responseMessage , 
      icon:const Icon(Icons.message),
      colorText: Colors.white,
      backgroundColor: Colors.green,
      snackPosition: SnackPosition.TOP
      );

    } else {
      print("Failed to get config. Status code: ${response.statusCode}");
      Get.snackbar("Zimra Response", "Failed to get config. Status code: ${response.statusCode}" , 
      icon:const Icon(Icons.message),
      colorText: Colors.white,
      backgroundColor: Colors.red,
      snackPosition: SnackPosition.TOP
      );
    }
  } catch (e) {
    print("Error getting config: $e");
    Get.snackbar("Zimra Response", "Error getting config: $e" , 
      icon:const Icon(Icons.message),
      colorText: Colors.white,
      backgroundColor: Colors.red,
      snackPosition: SnackPosition.TOP
      );

  }

  return responseMessage;
}


  ///GETSTATUS
  
  Future<void> getStatus() async {
    String apiEndpointGetStatus =
      "https://fdmsapitest.zimra.co.zw/Device/v1/25395/GetStatus";
    const String deviceModelName = "Server";
    const String deviceModelVersion = "v1";

    SSLContextProvider sslContextProvider = SSLContextProvider();
    SecurityContext securityContext = await sslContextProvider.createSSLContext();

    final String response = await GetStatus.getStatus(
      apiEndpointGetStatus: apiEndpointGetStatus,
      deviceModelName: deviceModelName,
      deviceModelVersion: deviceModelVersion,
      securityContext: securityContext,
    );
    //print("Response: \n$response");
    Get.snackbar(
      "Zimra Response", "$response",
      snackPosition: SnackPosition.TOP,
      colorText: Colors.white,
      backgroundColor: Colors.green,
      icon: const Icon(Icons.message, color: Colors.white),
    );
  }



  Future<String> ping() async {
  String apiEndpointPing =
      "https://fdmsapitest.zimra.co.zw/Device/v1/25395/Ping";
  const String deviceModelName = "Server";
  const String deviceModelVersion = "v1"; 

  SSLContextProvider sslContextProvider = SSLContextProvider();
  SecurityContext securityContext = await sslContextProvider.createSSLContext();

  // Call the Ping function
  final String response = await PingService.ping(
    apiEndpointPing: apiEndpointPing,
    deviceModelName: deviceModelName,
    deviceModelVersion: deviceModelVersion,
    securityContext: securityContext,
  );

  //print("Response: \n$response");
  Get.snackbar(
      "Zimra Response", "$response",
      snackPosition: SnackPosition.TOP,
      colorText: Colors.white,
      backgroundColor: Colors.green,
      icon: const Icon(Icons.message, color: Colors.white),
    );
  return response;
}
  Future<String> submitUnsubmittedReceipts(DatabaseHelper dbHelper) async {
  String sql = "SELECT * FROM submittedReceipts WHERE StatustoFDMS = 'NotSubmitted'";
  int resubmittedCount = 0;

  // String pingResponse = await ping();
  String pingResponse = "200";

  if (pingResponse == "200") {
    try {
      print("entered submit missing");
    // Get the database instance
    final db = await dbHelper.initDB();
    String apiEndpointSubmitReceipt =
      "https://fdmsapitest.zimra.co.zw/Device/v1/25395/SubmitReceipt";
    const String deviceModelName = "Server";
    const String deviceModelVersion = "v1"; 
    SSLContextProvider sslContextProvider = SSLContextProvider();
    SecurityContext securityContext = await sslContextProvider.createSSLContext();
    // Retrieve unsubmitted receipts
    //List<Map<String, dynamic>> receipts = await db.rawQuery(sql);
    List<Map<String, dynamic>> receipts = await dbHelper.getReceiptsNotSubmitted();
    print(receipts);
    File file = File("/storage/emulated/0/Pulse/Configurations/unsubmittedReceipts.txt");
    await file.writeAsString(receipts.toString());

    for (var row in receipts) {
      print("submitting receipts");
      //UnsubmittedReceipt receipt = UnsubmittedReceipt.fromMap(row);
      final String unsubmittedJsonBody = row["receiptJsonbody"];
      final int receiptGlobalNo = row["receiptGlobalNo"];
      print("unsubmittedJsonBody: $unsubmittedJsonBody");
      // Submit the receipt via HTTP
      Map<String, dynamic> submitResponse = await SubmitReceipts.submitReceipts(
        apiEndpointSubmitReceipt: apiEndpointSubmitReceipt,
        deviceModelName: deviceModelName,
        deviceModelVersion: deviceModelVersion, 
        securityContext: securityContext,
        receiptjsonBody: unsubmittedJsonBody,
      );
      Map<String, dynamic> responseBody = jsonDecode(submitResponse["responseBody"]);
      int statusCode = submitResponse["statusCode"];
      print("server response is $submitResponse");

      if (statusCode == 200) {
        String submitReceiptServerresponseJson = responseBody.toString();
        // Parse the server response
        int receiptID = responseBody['receiptID'] ?? 0;
        String receiptServerSignature = responseBody['receiptServerSignature']?['signature'].toString() ?? "";

        print("receiptID: $receiptID");
        print("receiptServerSignature: $receiptServerSignature");

        // Update database record
        String updateSql = '''
          UPDATE SubmittedReceipts 
          SET receiptID = ?, receiptServerSignature = ?, submitReceiptServerResponseJSON = ?, StatustoFDMS = 'Submitted' 
          WHERE receiptGlobalNo = ?
        ''';

        await db.rawUpdate(updateSql, [
          receiptID,
          receiptServerSignature,
          submitReceiptServerresponseJson,
          //receipt.receiptGlobalNo
          receiptGlobalNo
        ]);

        resubmittedCount++;
      }
      else{
        Get.snackbar("Response message", "$submitResponse",
          snackPosition: SnackPosition.TOP,
          colorText: Colors.white,
          backgroundColor: Colors.green,
          icon: const Icon(Icons.message, color: Colors.white),
        );
      }
    }
  } catch (e) {
    print("Error: $e");
  }
  Get.snackbar("Submit Successs", "The number of receipts resubmitted is: $resubmittedCount"
  , snackPosition: SnackPosition.TOP,
      colorText: Colors.white,
      backgroundColor: Colors.green,
      icon: const Icon(Icons.message, color: Colors.white),
  );
  return "The number of receipts resubmitted is: $resubmittedCount";
  }
  Get.snackbar("No Submission", "Failed to ping the server. Check your connection!"
  , snackPosition: SnackPosition.TOP,
      colorText: Colors.black,
      backgroundColor: Colors.amber,
      icon: const Icon(Icons.message, color: Colors.black),
  );
  return "Failed to ping the server. Check your connection!";

}
Future<int> getlatestFiscalDay() async {
  int latestFiscDay = await dbHelper.getlatestFiscalDay();
  setState(() {
    currentFiscal = latestFiscDay;
  });
  return latestFiscDay;
}

// void main() {
//   // Call getStatus from the main method
//   getStatus();
// }


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
        title: const Text("Fiscal Configuration" , style: TextStyle(fontWeight: FontWeight.w500 , fontSize: 16 , color: Colors.white),),
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(20),
            bottomRight: Radius.circular(20),
          ),
        ),
      ),
      body: SafeArea(
        bottom: false,
        child: SingleChildScrollView(
          scrollDirection: Axis.vertical,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 30,),
                Center(
                  child: Image.asset(
                    'assets/zimra.PNG',
                    height: 100,
                  ),
                ),
                const SizedBox(height: 15,),
                Container(
                  height:350,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10),
                    color: Colors.blue,
                  ),
                  child: Padding(
                    padding: const EdgeInsets.only(left: 10.0 ,top: 10.0),
                    child: ListView(
                      children: [
                        Text("TAXPAYER NAME: $taxPayerName" , style:const TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16),),
                        const SizedBox(height: 6,),
                        Text("TAXPAYER TIN: $tinNumber" , style:const TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                        const SizedBox(height: 6,),
                        Text("VAT NUMBER: $vatNumber" , style:const TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                        const SizedBox(height: 6,),
                        Text("DEVICE ID: $deviceID" , style:const TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                        const SizedBox(height: 6,),
                        Text("SERIAL NO: $serialNumber" , style:const TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                        const SizedBox(height: 6,),
                        Text("MODEL NAME: $modelName" , style:const TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                        const SizedBox(height: 6,),
                        Text("FSCAL DAY: $currentFiscal" , style: const TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                        const SizedBox(height: 6,),
                        Text("TIME TO CLOSEDAY:" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                        const SizedBox(height: 6,),
                        Text("RECEIPT COUNTER: ${dayReceiptCounter.length}" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                        const SizedBox(height: 6,),
                        Text("RECEIPTS SUBMITTED: ${receiptsSubmitted.length}" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                        const SizedBox(height: 6,),
                        Text("RECEIPTS PENDING: ${receiptsPending.length}" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 15,),
                const Center(child: ReusableText(text: "Functions", style: TextStyle(fontWeight: FontWeight.bold , fontSize: 20),)),
                const SizedBox(height: 10),
                CustomOutlineBtn(
                  text: "Manual Open Day",
                  color: Colors.blue,
                  color2: Colors.blue,
                  onTap: (){
                    openDayManual();
                  },
                  height: 50,
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  text: "Device Configuration",
                  color: Colors.blue,
                  color2: Colors.blue,
                  onTap: () {
                    getConfig();
                  },
                  height: 50,
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  text: "Device Status",
                  color: Colors.blue,
                  color2: Colors.blue,
                  onTap: (){
                    getStatus();
                  },
                  height: 50,
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  text: "Ping Tests",
                  color: Colors.blue,
                  color2: Colors.blue,
                  onTap: (){
                    ping();
                  },
                  height: 50,
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  text: "Manual Close Day",
                  color: Colors.blue,
                  color2: Colors.blue,
                  onTap: (){
          
                  },
                  height: 50,
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  text: "Submit Missing Receipts",
                  color: Colors.blue,
                  color2: Colors.blue,
                  onTap: (){
                    submitUnsubmittedReceipts(dbHelper);
                  },
                  height: 50,
                ),
                const SizedBox(height: 10,),
                CustomOutlineBtn(
                  text: "Close Day",
                  color: Colors.blue,
                  color2: Colors.blue,
                  onTap: () async{
                    String filePath = "/storage/emulated/0/Pulse/Configurations/steamTest_T_certificate.p12";
                    String password = "steamTest123";
                    int fiscalDay = currentFiscal;
                    List<Map<String , dynamic>> openDayData = await dbHelper.getDayOpenedDate(fiscalDay);
                    String openDayDate = openDayData[0]["FiscalDayOpened"];
                    DateTime parseDate = DateTime.parse(openDayDate);
                    String formattedDate = DateFormat('yyyy-MM-dd').format(parseDate);
                    //APIService.sendReceipt();
                    final (invoices, creditNotes, balances, concatStr) =
                      await buildFiscalDayCountersAndConcat(fiscalDay);
                    String finalStringConcat = "$deviceID$fiscalDay$formattedDate$concatStr";

                    // Hash generation
                    finalStringConcat.trim();

                    var bytes = utf8.encode(finalStringConcat);
                    var digest = sha256.convert(bytes);
                    final hash = base64.encode(digest.bytes);
                    print("Close day Hash :$hash");

                    //signature generation
                    try {
                      final Map<String, String> signedDataMap = await signData(filePath, password, finalStringConcat);
                      receiptDeviceSignature_signature_hex = signedDataMap["receiptDeviceSignature_signature_hex"] ?? "";
                      receiptDeviceSignature_signature = signedDataMap["receiptDeviceSignature_signature"] ?? "";
                      first16Chars = signedDataMap["receiptDeviceSignature_signature_md5_first16"] ?? "";
                    } catch (e) {
                      Get.snackbar("Signing Error", "$e", snackPosition: SnackPosition.TOP);
                    }

                    String apiEndpointCloseDay =
                      "https://fdmsapitest.zimra.co.zw/Device/v1/25395/CloseDay";
                    const String deviceModelName = "Server";
                    const String deviceModelVersion = "v1";  

                    SSLContextProvider sslContextProvider = SSLContextProvider();
                    SecurityContext securityContext = await sslContextProvider.createSSLContext();



                    // JSON payload:
                    final payload = { 
                    'deviceID': deviceID,
                    'fiscalDayNo': fiscalDay,
                    'fiscalDayCounters': [
                      ...invoices.map((c) => c.toJson()),
                      ...creditNotes.map((c) => c.toJson()),
                      ...balances.map((c) => c.toJson()),
                    ],
                    'fiscalDayDeviceSignature': {
                      'hash' : hash,
                      'signature': receiptDeviceSignature_signature,
                    },
                    'receiptCounter': dayReceiptCounter.length,
                    };

                    Map<String , dynamic> response = await CloseDay.submitCloseDay(
                      apiEndpoint: apiEndpointCloseDay,
                      deviceModelName: deviceModelName,
                      deviceModelVersion: deviceModelVersion,
                      securityContext: securityContext,
                      payload: payload,
                    );
                    Get.snackbar(
                      "Zimra Response", "$response",
                      snackPosition: SnackPosition.TOP,
                      colorText: Colors.white,
                      backgroundColor: Colors.green,
                      icon: const Icon(Icons.message, color: Colors.white),
                    );
                    print("Response: $response");
                     // And your concatenated string is:
                    print(finalStringConcat);
                    print(payload); 
                    File file = File("/storage/emulated/0/Pulse/Configurations/jsonFile.txt");
                    await file.writeAsString(jsonEncode(payload));
                  },
                  height: 50,
                )
              ],
            ),
          ),
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
                    Icon(Icons.home, color: Colors.grey,),
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
                  Icon(Icons.list_alt, color: Colors.black),
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


// class FiscalDayCounter {
//   final String type;
//   final String currency;
//   final double? percent;
//   final int? taxID;
//   final String? moneyType;
//   double value;

//   FiscalDayCounter({
//     required this.type,
//     required this.currency,
//     this.percent,
//     this.taxID,
//     this.moneyType,
//     this.value = 0,
//   });

//   String get key {
//     if (type == 'BalanceByMoneyType') {
//       return '$type|$currency|$moneyType';
//     }
//     return '$type|$currency|${percent!.toStringAsFixed(2)}|$taxID';
//   }

//   void accumulate(double addMe) => value += addMe;

//   Map<String, dynamic> toJson() {
//     final cents = (value * 100).round();
//     final m = {
//       'fiscalCounterType': type,
//       'fiscalCounterCurrency': currency,
//       'fiscalCounterValue': value,
//     };
//     if (percent != null) m['fiscalCounterTaxPercent'] = percent!.toStringAsFixed(2);
//     if (taxID != null) m['fiscalCounterTaxID'] = taxID.toString();
//     if (moneyType != null) m['fiscalCounterMoneyType'] = moneyType.toString();
//     return m;
//   }

//   String toConcatString() {
//     final buf = StringBuffer(type.toUpperCase());
//     buf.write(currency.toUpperCase());
//     if (type == 'BalanceByMoneyType') {
//       buf.write(moneyType!.toUpperCase());
//     } else {
//       buf.write(percent!.toStringAsFixed(2));
//     }
//     buf.write((value * 100).round());
//     return buf.toString();
//   }
// }

// Future<(
//   List<FiscalDayCounter> invoices,
//   List<FiscalDayCounter> creditNotes,
//   List<FiscalDayCounter> balances,
//   String concatenatedString
// )> buildFiscalDayCountersAndConcat(
//     int fiscalDayNo,
// ) async {
//   final invMap  = <String, FiscalDayCounter>{};
//   final crdMap  = <String, FiscalDayCounter>{};
//   final balMap  = <String, FiscalDayCounter>{};

//   DatabaseHelper dbHelper = DatabaseHelper();
//   final db = await dbHelper.initDB();

//   final rows = await db.query(
//     'submittedReceipts',
//     columns: ['receiptType','receiptJsonbody'],
//     where: 'FiscalDayNo = ?',
//     whereArgs: [fiscalDayNo],
//   );

//   for (final row in rows) {
//     final receiptType = row['receiptType'] as String;
//     final body        = json.decode(row['receiptJsonbody'] as String);
//     final r           = body['receipt'] as Map<String, dynamic>;
//     final curr        = r['receiptCurrency'] as String;
//     final isCredit    = receiptType != 'FISCALINVOICE';

//     for (final t in r['receiptTaxes'] as List<dynamic>) {
//       final rawTaxAmt = t['taxAmount'];
//       final rawSales  = t['salesAmountWithTax'];
//       final taxAmt    = rawTaxAmt is num ? rawTaxAmt.toDouble() : double.tryParse(rawTaxAmt.toString()) ?? 0;
//       final salesAmt  = rawSales is num ? rawSales.toDouble() : double.tryParse(rawSales.toString()) ?? 0;

//       final perc      = double.parse(t['taxPercent'] as String);
//       final taxId     = int.parse(t['taxID'].toString());

//       final targetMap = isCredit ? crdMap : invMap;

//       final sbtKey = 'SaleByTax|$curr|${perc.toStringAsFixed(2)}|$taxId';
//       targetMap.putIfAbsent(sbtKey, () => FiscalDayCounter(
//         type: 'SaleByTax', currency: curr, percent: perc, taxID: taxId))
//         .accumulate(isCredit ? -salesAmt : salesAmt);

//       final sttKey = 'SaleTaxByTax|$curr|${perc.toStringAsFixed(2)}|$taxId';
//       targetMap.putIfAbsent(sttKey, () => FiscalDayCounter(
//         type: 'SaleTaxByTax', currency: curr, percent: perc, taxID: taxId))
//         .accumulate(isCredit ? -taxAmt : taxAmt);

//       if (isCredit) {
//         final cbtKey = 'CreditNoteByTax|$curr|${perc.toStringAsFixed(2)}|$taxId';
//         crdMap.putIfAbsent(cbtKey, () => FiscalDayCounter(
//           type: 'CreditNoteByTax', currency: curr, percent: perc, taxID: taxId))
//           .accumulate(-salesAmt);

//         final cttKey = 'CreditNoteTaxByTax|$curr|${perc.toStringAsFixed(2)}|$taxId';
//         crdMap.putIfAbsent(cttKey, () => FiscalDayCounter(
//           type: 'CreditNoteTaxByTax', currency: curr, percent: perc, taxID: taxId))
//           .accumulate(-taxAmt);
//       }
//     }

//     for (final p in r['receiptPayments'] as List<dynamic>) {
//       final mType   = p['moneyTypeCode'] as String;
//       final rawAmt  = p['paymentAmount'];
//       final amt     = rawAmt is num ? rawAmt.toDouble() : double.tryParse(rawAmt.toString()) ?? 0;

//       final bKey = 'BalanceByMoneyType|$curr|$mType';
//       balMap.putIfAbsent(bKey, () => FiscalDayCounter(
//         type: 'BalanceByMoneyType', currency: curr, moneyType: mType))
//         .accumulate(amt);
//     }
//   }

//   final allCounters = [
//     ...invMap.values,
//     ...crdMap.values,
//     ...balMap.values,
//   ];

//   const counterOrder = [
//     'SaleByTax',
//     'SaleTaxByTax',
//     'CreditNoteByTax',
//     'CreditNoteTaxByTax',
//     'BalanceByMoneyType',
//   ];

//   allCounters.sort((a, b) =>
//     counterOrder.indexOf(a.type).compareTo(counterOrder.indexOf(b.type)));

//   final concat = StringBuffer();
//   for (final c in allCounters) {
//     concat.write(c.toConcatString());
//   }

//   final invoices    = allCounters.where((c) => c.type.startsWith('Sale')).toList();
//   final creditNotes = allCounters.where((c) => c.type.startsWith('CreditNote')).toList();
//   final balances    = allCounters.where((c) => c.type == 'BalanceByMoneyType').toList();

//   return (invoices, creditNotes, balances, concat.toString());
// }



// class FiscalDayCounter {
//   final String type;
//   final String currency;
//   final double? percent;
//   final int? taxID;
//   final String? moneyType;
//   double value;

//   FiscalDayCounter({
//     required this.type,
//     required this.currency,
//     this.percent,
//     this.taxID,
//     this.moneyType,
//     this.value = 0,
//   });

//   String get key {
//     if (type == 'BalanceByMoneyType') {
//       return '$type|$currency|$moneyType';
//     }
//     return '$type|$currency|${percent!.toStringAsFixed(2)}|$taxID';
//   }

//   void accumulate(double addMe) => value += addMe;

//   Map<String, dynamic> toJson() {
//     final double roundedValue = double.parse(value.toStringAsFixed(2));
//     if (roundedValue == 0.0) return {}; // skip if zero

//     final m = {
//       'fiscalCounterType': type,
//       'fiscalCounterCurrency': currency,
//       'fiscalCounterValue': roundedValue,
//     };
//     if (percent != null) m['fiscalCounterTaxPercent'] = percent!.toStringAsFixed(2);
//     if (taxID != null) m['fiscalCounterTaxID'] = taxID.toString();
//     if (moneyType != null) m['fiscalCounterMoneyType'] = moneyType.toString();
//     return m;
//   }

//   String toConcatString() {
//     final buf = StringBuffer(type.toUpperCase());
//     buf.write(currency.toUpperCase());
//     if (type == 'BalanceByMoneyType') {
//       buf.write(moneyType!.toUpperCase());
//     } else {
//       buf.write(percent!.toStringAsFixed(2));
//     }
//     buf.write((value * 100).round());
//     return buf.toString();
//   }
// }

// Future<(
//   List<FiscalDayCounter> invoices,
//   List<FiscalDayCounter> creditNotes,
//   List<FiscalDayCounter> balances,
//   String concatenatedString
// )> buildFiscalDayCountersAndConcat(
//     int fiscalDayNo,
// ) async {
//   final invMap  = <String, FiscalDayCounter>{};
//   final crdMap  = <String, FiscalDayCounter>{};
//   final balMap  = <String, FiscalDayCounter>{};

//   DatabaseHelper dbHelper = DatabaseHelper();
//   final db = await dbHelper.initDB();

//   final rows = await db.query(
//     'submittedReceipts',
//     columns: ['receiptType','receiptJsonbody'],
//     where: 'FiscalDayNo = ?',
//     whereArgs: [fiscalDayNo],
//   );

//   for (final row in rows) {
//     final receiptType = row['receiptType'] as String;
//     final body        = json.decode(row['receiptJsonbody'] as String);
//     final r           = body['receipt'] as Map<String, dynamic>;
//     final curr        = r['receiptCurrency'] as String;
//     final isCredit    = receiptType != 'FISCALINVOICE';

//     for (final t in r['receiptTaxes'] as List<dynamic>) {
//       final rawTaxAmt = t['taxAmount'];
//       final rawSales  = t['salesAmountWithTax'];
//       final taxAmt    = rawTaxAmt is num ? rawTaxAmt.toDouble() : double.tryParse(rawTaxAmt.toString()) ?? 0;
//       final salesAmt  = rawSales is num ? rawSales.toDouble() : double.tryParse(rawSales.toString()) ?? 0;

//       final perc      = double.parse(t['taxPercent'] as String);
//       final taxId     = int.parse(t['taxID'].toString());

//       final targetMap = isCredit ? crdMap : invMap;

//       final sbtKey = 'SaleByTax|$curr|${perc.toStringAsFixed(2)}|$taxId';
//       targetMap.putIfAbsent(sbtKey, () => FiscalDayCounter(
//         type: 'SaleByTax', currency: curr, percent: perc, taxID: taxId))
//         .accumulate(salesAmt);

//       final sttKey = 'SaleTaxByTax|$curr|${perc.toStringAsFixed(2)}|$taxId';
//       targetMap.putIfAbsent(sttKey, () => FiscalDayCounter(
//         type: 'SaleTaxByTax', currency: curr, percent: perc, taxID: taxId))
//         .accumulate(taxAmt);

//       if (isCredit) {
//         final cbtKey = 'CreditNoteByTax|$curr|${perc.toStringAsFixed(2)}|$taxId';
//         crdMap.putIfAbsent(cbtKey, () => FiscalDayCounter(
//           type: 'CreditNoteByTax', currency: curr, percent: perc, taxID: taxId))
//           .accumulate(-salesAmt);

//         final cttKey = 'CreditNoteTaxByTax|$curr|${perc.toStringAsFixed(2)}|$taxId';
//         crdMap.putIfAbsent(cttKey, () => FiscalDayCounter(
//           type: 'CreditNoteTaxByTax', currency: curr, percent: perc, taxID: taxId))
//           .accumulate(-taxAmt);
//       }
//     }

//     for (final p in r['receiptPayments'] as List<dynamic>) {
//       final mType   = p['moneyTypeCode'] as String;
//       final rawAmt  = p['paymentAmount'];
//       final amt     = rawAmt is num ? rawAmt.toDouble() : double.tryParse(rawAmt.toString()) ?? 0;

//       final bKey = 'BalanceByMoneyType|$curr|$mType';
//       balMap.putIfAbsent(bKey, () => FiscalDayCounter(
//         type: 'BalanceByMoneyType', currency: curr, moneyType: mType))
//         .accumulate(amt);
//     }
//   }

//   final allCounters = [
//     ...invMap.values,
//     ...crdMap.values,
//     ...balMap.values,
//   ];

//   const counterOrder = [
//     'SaleByTax',
//     'SaleTaxByTax',
//     'CreditNoteByTax',
//     'CreditNoteTaxByTax',
//     'BalanceByMoneyType',
//   ];

//   allCounters.sort((a, b) =>
//     counterOrder.indexOf(a.type).compareTo(counterOrder.indexOf(b.type)));

//   final concat = StringBuffer();
//   for (final c in allCounters) {
//     concat.write(c.toConcatString());
//   }

//   final invoices = allCounters
//       .where((c) => c.type.startsWith('Sale') && double.parse(c.value.toStringAsFixed(2)) != 0.0)
//       .toList();
//   final creditNotes = allCounters
//       .where((c) => c.type.startsWith('CreditNote') && double.parse(c.value.toStringAsFixed(2)) != 0.0)
//       .toList();
//   final balances = allCounters
//       .where((c) => c.type == 'BalanceByMoneyType' && double.parse(c.value.toStringAsFixed(2)) != 0.0)
//       .toList();

//   return (invoices, creditNotes, balances, concat.toString());
// }

// 

class FiscalDayCounter {
  final String type;
  final String currency;
  final double? percent;
  final int? taxID;
  final String? moneyType;
  double value;

  FiscalDayCounter({
    required this.type,
    required this.currency,
    this.percent,
    this.taxID,
    this.moneyType,
    this.value = 0,
  });

  String get key {
    if (type == 'BalanceByMoneyType') {
      return '$type|$currency|$moneyType';
    }
    return '$type|$currency|${percent!.toStringAsFixed(2)}|$taxID';
  }

  void accumulate(double addMe) => value += addMe;

  Map<String, dynamic> toJson() {
    final double roundedValue = double.parse(value.toStringAsFixed(2));
    if (roundedValue == 0.0) return {}; // skip if zero

    final m = {
      'fiscalCounterType': type,
      'fiscalCounterCurrency': currency,
      'fiscalCounterValue': (type.startsWith('CreditNote') ? -roundedValue.abs() : roundedValue.abs()),
    };
    if (percent != null) m['fiscalCounterTaxPercent'] = percent!.toStringAsFixed(2);
    if (taxID != null) m['fiscalCounterTaxID'] = taxID.toString();
    if (moneyType != null) m['fiscalCounterMoneyType'] = moneyType.toString();
    return m;
  }

  String toConcatString() {
    if (type == 'SaleTaxByTax' && percent?.toStringAsFixed(2) != '15.00') {
      return ''; // ❌ skip all but 15% VAT
    }
     if (type == 'CreditNoteTaxByTax' && percent?.toStringAsFixed(2) != '15.00') {
      return ''; // ❌ skip all but 15% VAT
    }
    final buf = StringBuffer(type.toUpperCase());
    buf.write(currency.toUpperCase());
    if (type == 'BalanceByMoneyType') {
      buf.write(moneyType!.toUpperCase());
    } else {
      buf.write(percent!.toStringAsFixed(2));
    }
    buf.write((value.abs() * 100).round()); // always positive in string
    return buf.toString();
  }
}

Future<(
  List<FiscalDayCounter> invoices,
  List<FiscalDayCounter> creditNotes,
  List<FiscalDayCounter> balances,
  String concatenatedString
)> buildFiscalDayCountersAndConcat(
    int fiscalDayNo,
) async {
  final invMap  = <String, FiscalDayCounter>{};
  final crdMap  = <String, FiscalDayCounter>{};
  final balMap  = <String, FiscalDayCounter>{};

  DatabaseHelper dbHelper = DatabaseHelper();
  final db = await dbHelper.initDB();

  final rows = await db.query(
    'submittedReceipts',
    columns: ['receiptType','receiptJsonbody'],
    where: 'FiscalDayNo = ?',
    whereArgs: [fiscalDayNo],
  );

  for (final row in rows) {
    final receiptType = row['receiptType'] as String;
    final body        = json.decode(row['receiptJsonbody'] as String);
    final r           = body['receipt'] as Map<String, dynamic>;
    final curr        = r['receiptCurrency'] as String;
    final isCredit    = receiptType != 'FISCALINVOICE';

    for (final t in r['receiptTaxes'] as List<dynamic>) {
      final rawTaxAmt = t['taxAmount'];
      final rawSales  = t['salesAmountWithTax'];
      final taxAmt    = rawTaxAmt is num ? rawTaxAmt.toDouble() : double.tryParse(rawTaxAmt.toString()) ?? 0;
      final salesAmt  = rawSales is num ? rawSales.toDouble() : double.tryParse(rawSales.toString()) ?? 0;

      final perc      = double.parse(t['taxPercent'] as String);
      final taxId     = int.parse(t['taxID'].toString());

      if (!isCredit) {
        final sbtKey = 'SaleByTax|$curr|${perc.toStringAsFixed(2)}|$taxId';
        invMap.putIfAbsent(sbtKey, () => FiscalDayCounter(
          type: 'SaleByTax', currency: curr, percent: perc, taxID: taxId))
          .accumulate(salesAmt);

        final sttKey = 'SaleTaxByTax|$curr|${perc.toStringAsFixed(2)}|$taxId';
        invMap.putIfAbsent(sttKey, () => FiscalDayCounter(
          type: 'SaleTaxByTax', currency: curr, percent: perc, taxID: taxId))
          .accumulate(taxAmt);
      } else {
        final cbtKey = 'CreditNoteByTax|$curr|${perc.toStringAsFixed(2)}|$taxId';
        crdMap.putIfAbsent(cbtKey, () => FiscalDayCounter(
          type: 'CreditNoteByTax', currency: curr, percent: perc, taxID: taxId))
          .accumulate(salesAmt); // accumulate positive value

        final cttKey = 'CreditNoteTaxByTax|$curr|${perc.toStringAsFixed(2)}|$taxId';
        crdMap.putIfAbsent(cttKey, () => FiscalDayCounter(
          type: 'CreditNoteTaxByTax', currency: curr, percent: perc, taxID: taxId))
          .accumulate(taxAmt); // accumulate positive value
      }
    }

    for (final p in r['receiptPayments'] as List<dynamic>) {
      final mType   = p['moneyTypeCode'] as String;
      final rawAmt  = p['paymentAmount'];
      final amt     = rawAmt is num ? rawAmt.toDouble() : double.tryParse(rawAmt.toString()) ?? 0;

      final bKey = 'BalanceByMoneyType|$curr|$mType';
      balMap.putIfAbsent(bKey, () => FiscalDayCounter(
        type: 'BalanceByMoneyType', currency: curr, moneyType: mType))
        .accumulate(amt);
    }
  }

  final allCounters = [
    ...invMap.values,
    ...crdMap.values,
    ...balMap.values,
  ];

  const counterOrder = [
    'SaleByTax',
    'SaleTaxByTax',
    'CreditNoteByTax',
    'CreditNoteTaxByTax',
    'BalanceByMoneyType',
  ];

  allCounters.sort((a, b) =>
    counterOrder.indexOf(a.type).compareTo(counterOrder.indexOf(b.type)));

  final concat = StringBuffer();
  for (final c in allCounters) {
    concat.write(c.toConcatString());
  }

  final invoices = allCounters
      .where((c) => c.type.startsWith('Sale') && double.parse(c.value.toStringAsFixed(2)) != 0.0)
      .toList();
  final creditNotes = allCounters
      .where((c) => c.type.startsWith('CreditNote') && double.parse(c.value.toStringAsFixed(2)) != 0.0)
      .toList();
  final balances = allCounters
      .where((c) => c.type == 'BalanceByMoneyType' && double.parse(c.value.toStringAsFixed(2)) != 0.0)
      .toList();

  return (invoices, creditNotes, balances, concat.toString());
}

