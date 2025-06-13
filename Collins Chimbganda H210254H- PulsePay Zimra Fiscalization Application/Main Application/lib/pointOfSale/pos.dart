import 'dart:convert';
import 'dart:io';
import 'package:basic_utils/basic_utils.dart';
import 'package:blue_thermal_printer/blue_thermal_printer.dart';
import 'package:crypto/crypto.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:logger/logger.dart';
import 'package:lottie/lottie.dart';
import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:pointycastle/digests/sha256.dart';
import 'package:pointycastle/signers/rsa_signer.dart';
import 'package:pulsepay/JsonModels/json_models.dart';
//import 'package:flutter_screenutil/flutter_screenutil.dart';
//import 'package:get/get_connect/sockets/src/socket_notifier.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/constants.dart';
import 'package:pulsepay/common/custom_field.dart';
import 'package:get/get.dart';
import 'package:pulsepay/fiscalization/ping.dart';
import 'package:pulsepay/fiscalization/receiptResponse.dart';
import 'package:pulsepay/fiscalization/sslContextualization.dart';
import 'package:pulsepay/fiscalization/submitReceipts.dart';
import 'package:pulsepay/main.dart';
import 'package:sqflite/sqflite.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path/path.dart' as p;
import 'package:sunmi_printer_plus/core/enums/enums.dart';
import 'package:sunmi_printer_plus/core/styles/sunmi_qrcode_style.dart';
import 'package:sunmi_printer_plus/core/styles/sunmi_text_style.dart';
import 'package:sunmi_printer_plus/core/sunmi/sunmi_printer.dart';
//import 'package:barcode_widget/barcode_widget.dart';
//import 'package:pulsepay/home/home_page.dart';

class Pos  extends StatefulWidget{
  const Pos({super.key});
  @override
  State<Pos> createState() => _PosState();
}

class _PosState extends State<Pos>{
  static const platform = MethodChannel('com.example.pulsepay/signature');
  bool isBarcodeEnabled = false;
  @override
  void initState() {
    super.initState();
    fetchPayMethods();
    fetchDefaultPayMethod();
    fetchDefaultCurrency();
    fetchDefaultRate();
    _initializePrinter();
    //initializePrivateKey();
  }

  late String privateKey;

  final TextEditingController controller = TextEditingController();
  final TextEditingController customerNameController = TextEditingController();
  final TextEditingController tinController = TextEditingController();
  final TextEditingController vatController = TextEditingController();
  final TextEditingController addressController = TextEditingController();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController paidController = TextEditingController();
  final TextEditingController searchCustomer = TextEditingController();
  final DatabaseHelper dbHelper  = DatabaseHelper();
  final pdf = pw.Document();


  List<Map<String , dynamic>> defaultPayMethod = [];
  List<Map<String, dynamic>> payMethods = [];
  List<Map<String, dynamic>> searchResults = [];
  List<Map<String, dynamic>> products = [];
  List<Map<String, dynamic>> cartItems = [];
  List<Map<String, dynamic>> customerDetails = [];
  List<Map<String, dynamic>> selectedCustomer =[];
  List<Map<String, dynamic>> selectedPayMethod =[];
  List<Map<String, dynamic>> productOnSale =[];
  List<Map<String,dynamic>> dayReceiptCounter = [];
  final formKey = GlobalKey<FormState>();
  final paidKey = GlobalKey<FormState>();
  bool isActve = true;
  String? defaultCurrency;
  double? defaultRate;
  int currentFiscal = 0;
  List<Map<String, dynamic>> receiptItems = [];
  double totalAmount = 0.0; 
  double taxAmount = 0.0;
  String? generatedJson;
  String? fiscalResponse;
  double taxPercent = 0.0 ;
  String? taxCode;
  double salesAmountwithTax =0.0;
  String? encodedSignature;
  String? encodedHash;
  String? signature64 ;
   String? signatureMD5 ;
   DateTime? currentDateTime;
  // ignore: non_constant_identifier_names
  String? receiptDeviceSignature_signature_hex ;
  String? first16Chars;
  // ignore: non_constant_identifier_names
  String? receiptDeviceSignature_signature;
  String genericzimraqrurl = "https://fdmstest.zimra.co.zw/";
  int deviceID = 25395;
  final BlueThermalPrinter bluetooth = BlueThermalPrinter.instance;
    bool _isConnected = false;
  bool _isPrinting = false;
  String _printerStatus = 'Checking...';

    Future<void> _initializePrinter() async {
    try {
      // Initialize the printer first
      await SunmiPrinter.initPrinter();
      
      // Check if printer is available
      await SunmiPrinter.bindingPrinter();
      
      setState(() {
        _isConnected = true;
        _printerStatus = 'Sunmi Printer Ready';
      });
      print("Printer Initialized Successfully");
    } catch (e) {
      print('Printer initialization error: $e');
      setState(() {
        _isConnected = false;
        _printerStatus = 'Printer initialization failed: ${e.toString()}';
      });
    }
  }

Future<void> print58mmAdvanced(Map<String, dynamic> receiptJson, String qrUrl) async {
  try {
    // More robust printer initialization
    print("Initializing Sunmi printer...");
    
    // Try multiple initialization attempts
    bool printerReady = false;
    int attempts = 0;

    final receipt = receiptJson['receipt'];

    // Print receipt with better formatting
    await _printHeader();
    await _printCustomerInfo(receipt);
    await _printInvoiceDetails(receipt);
    await _printItems(receipt['receiptLines']);
    await _printTotal(receipt['receiptTotal']);
    await _printSignature(receipt['receiptDeviceSignature']);
    await _printVerification(receipt['receiptGlobalNo']);
    await _printQRCode(qrUrl);
    await _finishPrint();
    
    print("Advanced receipt printed successfully.");
    
  } catch (e) {
    print("Advanced print error: $e");
    rethrow;
  }
}

// Helper functions for better organization
Future<void> _printHeader() async {
  SunmiPrintAlign.CENTER;
  //await SunmiPrinter.setFontSize(SunmiFontSize.LG);
  await SunmiPrinter.printText("FISCAL TAX INVOICE" , style: SunmiTextStyle(bold: true, align: SunmiPrintAlign.CENTER));
  await SunmiPrinter.lineWrap(3);
  await SunmiPrinter.printText("PULSE PVT LTD", style: SunmiTextStyle(align: SunmiPrintAlign.CENTER));
  await SunmiPrinter.resetFontSize();
  await SunmiPrinter.printText("TIN: 1234567890" ,style: SunmiTextStyle(align: SunmiPrintAlign.CENTER));
  await SunmiPrinter.printText("16 Ganges Road, Harare", style: SunmiTextStyle(align: SunmiPrintAlign.CENTER));
  await SunmiPrinter.printText("Tel: +263 77 14172798", style: SunmiTextStyle(align: SunmiPrintAlign.CENTER));
  await SunmiPrinter.printText("================================");
}

Future<void> _printCustomerInfo(Map<String, dynamic> receipt) async {
  await SunmiPrinter.setAlignment(SunmiPrintAlign.LEFT);
  await SunmiPrinter.printText("CUSTOMER INFORMATION");
  await SunmiPrinter.printText("--------------------------------");
  await SunmiPrinter.printText("Name: ${receipt['buyerData']?['buyerTradeName'] ?? 'Walk-in Customer'}");
  await SunmiPrinter.printText("TIN: ${receipt['buyerData']?['buyerTIN'] ?? 'N/A'}");
  await SunmiPrinter.printText("VAT: ${receipt['buyerData']?['VATNumber'] ?? 'N/A'}");
  await SunmiPrinter.printText("--------------------------------");
  await SunmiPrinter.lineWrap(1);
}

Future<void> _printInvoiceDetails(Map<String, dynamic> receipt) async {
  await SunmiPrinter.printText("INVOICE DETAILS");
  await SunmiPrinter.printText("--------------------------------");
  await SunmiPrinter.printText("Invoice No: ${receipt['invoiceNo']}");
  await SunmiPrinter.printText("Date: ${receipt['receiptDate']}");
  await SunmiPrinter.printText("--------------------------------");
  await SunmiPrinter.lineWrap(1);
}

Future<void> _printItems(List receiptLines) async {
  await SunmiPrinter.printText("ITEMS");
  await SunmiPrinter.printText("--------------------------------");
  
  for (var item in receiptLines) {
    // Format item name and quantity
    String itemLine = "${item['receiptLineName']} x${item['receiptLineQuantity']}";
    await SunmiPrinter.printText(itemLine);
    
    // Format price line with proper spacing
    String priceLine = "@\$${item['receiptLinePrice']} = \$${item['receiptLineTotal']}";
    await SunmiPrinter.setAlignment(SunmiPrintAlign.RIGHT);
    await SunmiPrinter.printText(priceLine);
    await SunmiPrinter.setAlignment(SunmiPrintAlign.LEFT);
    await SunmiPrinter.lineWrap(1);
  }
}

Future<void> _printTotal(dynamic receiptTotal) async {
  await SunmiPrinter.printText("================================");
  double total = double.tryParse(receiptTotal.toString()) ?? 0.0;
  await SunmiPrinter.setAlignment(SunmiPrintAlign.CENTER);
  //await SunmiPrinter.setFontSize(SunmiFontSize.LG);
  await SunmiPrinter.printText("TOTAL: \$${total.toStringAsFixed(2)}");
  await SunmiPrinter.resetFontSize();
  await SunmiPrinter.printText("================================");
  await SunmiPrinter.lineWrap(1);
}

Future<void> _printSignature(Map<String, dynamic>? signature) async {
  await SunmiPrinter.setAlignment(SunmiPrintAlign.LEFT);
  await SunmiPrinter.printText("SIGNATURE");
  await SunmiPrinter.printText("--------------------------------");
  //await SunmiPrinter.setFontSize(SunmiFontSize.SM);
  await SunmiPrinter.printText("Hash: ${signature?['hash'] ?? 'N/A'}");
  await SunmiPrinter.resetFontSize();
  await SunmiPrinter.lineWrap(1);
}

Future<void> _printVerification(dynamic receiptGlobalNo) async {
  await SunmiPrinter.printText("VERIFICATION");
  await SunmiPrinter.printText("--------------------------------");
  await SunmiPrinter.printText("Verify at:", style: SunmiTextStyle(align: SunmiPrintAlign.CENTER));
  await SunmiPrinter.printText("https://fdmstest.zimra.co.zw", style: SunmiTextStyle(align: SunmiPrintAlign.CENTER));
  await SunmiPrinter.lineWrap(1);
  await SunmiPrinter.printText("Device ID: 25395", style: SunmiTextStyle(align: SunmiPrintAlign.CENTER));
  await SunmiPrinter.printText("Receipt No: ${receiptGlobalNo.toString().padLeft(10, '0')}", style: SunmiTextStyle(align: SunmiPrintAlign.CENTER));
}

Future<void> _printQRCode(String qrUrl) async {
  await SunmiPrinter.lineWrap(2);
  await SunmiPrinter.setAlignment(SunmiPrintAlign.CENTER);
  await SunmiPrinter.printText("Scan to Verify");
  await SunmiPrinter.lineWrap(1);
  await SunmiPrinter.printQRCode(qrUrl, style: SunmiQrcodeStyle(align: SunmiPrintAlign.CENTER, qrcodeSize: 6));
}

Future<void> _finishPrint() async {
  await SunmiPrinter.lineWrap(3);
  await SunmiPrinter.cutPaper();
}

  Future<void> generateInvoiceFromJson(Map<String , dynamic> receiptJson , String qrUrl) async{
    final receipt = receiptJson['receipt'];
    final supplier = {
      'name': 'Pulse Pvt Ltd',
      'tin': '1234567890',
      'address': '16 Ganges Road, Harare',
      'phone': '+263 77 14172798',
    };
    final customer = {
      'name': receipt['buyerData']?['buyerTradeName'] ?? 'Customer',
      'tin': receipt['buyerData']?['buyerTIN'] ?? '0000000000',
      'vat': receipt['buyerData']?['VATNumber'] ?? '00000000',
    };
    String receiptGlobalNo = receipt['receiptGlobalNo'].toString().padLeft(10, '0');
    String deviceID = "25395";
    final receiptLines = List<Map<String, dynamic>>.from(receipt['receiptLines']);
    final receiptTaxes = List<Map<String, dynamic>>.from(receipt['receiptTaxes']);
    final receiptTotal = double.tryParse(receipt['receiptTotal'].toString()) ?? 0.0;
    final signature = receipt['receiptDeviceSignature']?['signature'] ?? 'No Signature';
    double totalTax = 0.0;
    for (var tax in receiptTaxes) {
      totalTax += double.tryParse(tax['taxAmount'].toString()) ?? 0.0;
    }
    pdf.addPage(
      pw.Page(
        pageFormat: PdfPageFormat.a4,
        margin: const pw.EdgeInsets.all(24),
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text('FISCAL TAX INVOICE', style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold)),
                      pw.SizedBox(height: 8),
                      pw.Text('Supplier: ${supplier['name']}'),
                      pw.Text('TIN: ${supplier['tin']}'),
                      pw.Text('Address: ${supplier['address']}'),
                      pw.Text('Phone: ${supplier['phone']}'),
                    ],
                  ),
                  pw.Container(
                    width: 100,
                    height: 100,
                    child: pw.BarcodeWidget(
                      barcode: pw.Barcode.qrCode(),
                      data: qrUrl,
                      drawText: false,
                    ),
                  ),
                ],
              ),
              pw.Divider(
                thickness: 5,
                color: PdfColors.blue,
              ),
              pw.SizedBox(height: 8),
              pw.Text('Customer: ${customer['name']}'),
              pw.Text('TIN: ${customer['tin']}'),
              pw.Text('VAT: ${customer['vat']}'),
              pw.SizedBox(height: 12),
              pw.Text('Invoice No: ${receipt['invoiceNo']}', style: pw.TextStyle(fontSize: 14)),
              pw.Text('Date: ${receipt['receiptDate']}'),
              pw.SizedBox(height: 12),
              pw.Table.fromTextArray(
                headers: ['No.', 'Item', 'Qty', 'Unit Price', 'Tax %', 'Total'],
                data: receiptLines.map((item) {
                  return [
                    item['receiptLineNo'],
                    item['receiptLineName'],
                    item['receiptLineQuantity'].toString(),
                    '\$${item['receiptLinePrice'].toString()}',
                    '${item['taxPercent'] ?? '0'}%',
                    '\$${item['receiptLineTotal'].toString()}',
                  ];
                }).toList(),
              ),
              pw.Divider(),
              pw.SizedBox(height: 10),
              pw.Align(
                alignment: pw.Alignment.centerRight,
                child: pw.Column(
                  crossAxisAlignment: pw.CrossAxisAlignment.end,
                  children: [
                    pw.Text('Total Tax: \$${totalTax.toStringAsFixed(2)}'),
                    pw.Text('Grand Total: \$${receiptTotal.toStringAsFixed(2)}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold)),
                  ],
                ),
              ),
              pw.SizedBox(height: 20),
              pw.Text('Signature Hash:', style: pw.TextStyle(fontSize: 10)),
              pw.Text(receipt['receiptDeviceSignature']?['hash'] ?? '', style: pw.TextStyle(fontSize: 8)),
              pw.Text("You can verify this manually at:", style: pw.TextStyle(fontSize: 10)),
              pw.Text("https://fdmstest.zimra.co.zw", style: pw.TextStyle(fontSize: 8, color: PdfColors.blue)),
              pw.Text("Device ID: $deviceID", style: pw.TextStyle(fontSize: 10)),
              pw.Text("Receipt Global No: $receiptGlobalNo", style: pw.TextStyle(fontSize: 10)),
            ],
          );
        },
      ),
    );
    try {
      final directory = Directory('/storage/emulated/0/Pulse/Invoices');

      // Create the directory if it doesn't exist
      if (!await directory.exists()) {
        await directory.create(recursive: true);
      }
      final filePath = p.join(directory.path, 'invoice_${receipt['invoiceNo']}.pdf');
      final file = File(filePath);
      await file.writeAsBytes(await pdf.save());

      print('Invoice saved at ${file.path}');
    } catch (e) {
      print('Error saving invoice: $e');
    }
  }
  
  Future<bool> requestStoragePermission() async {
  if (await Permission.storage.isGranted) {
    return true;
  }
  var status = await Permission.storage.request();
  return status.isGranted;
}

  addItem() async{
  for (var item in cartItems) {
    double itemTotal = (item['sellingPrice'] is String) 
        ? double.parse(item['sellingPrice']) 
        : item['sellingPrice'].toDouble();
    
    int quantity = (item['sellqty'] is String) 
        ? int.parse(item['sellqty']) 
        : item['sellqty'];

    double totalPrice = itemTotal * quantity;
    double itemTax;
    int taxID;
    String taxCode;
    String taxPercent;
    
    String productTax = item['tax'] ?? ""; // Handle null case

    if (productTax == "zero") {
      taxID = 2;
      taxPercent = "0.00";
      taxCode = "B";
      itemTax = totalPrice * double.parse(taxPercent);
    } else if (productTax == "vat") {
      taxID = 3;
      taxPercent = "15.00"; // Convert 15% to decimal
      taxCode = "C";
      itemTax = totalPrice * 0.15;
      salesAmountwithTax += totalPrice;
    } else {
      taxID = 1;
      taxPercent = "0";
      taxCode = "A";
      itemTax = totalPrice * 0;
    }

    setState(() {
      receiptItems.add({
        'productName': item['productName'],
        'price': itemTotal,
        'quantity': quantity,
        'total': totalPrice,
        'taxID': taxID,
        'taxPercent': taxPercent,
        'taxCode': taxCode,
      });
    });

    totalAmount += totalPrice;
    taxAmount += itemTax;
  }
}

  static Future<String?> getSignatureHash(String data) async {
    try {
      final String? result = await platform.invokeMethod('SignatureHash', {"data": data});
      return result;
    } on PlatformException catch (e) {
      return "Failed to get hash: '${e.message}'.";
    }
  }

  static Future<List<String>?> getSignatureSignature(String data) async {
    try {
      final List<dynamic>? result = await platform.invokeMethod('SignatureSignature', {"data": data});
      return result?.map((e) => e as String).toList();
    } on PlatformException catch (e) {
      return ["Failed to sign: '${e.message}'.", ""];
    }
  }

  String buildZimraCanonicalString({
  required Map<String, dynamic> receipt,
  required String deviceID,
  required String previousReceiptHash,
}) {
  final buffer = StringBuffer();

  // 1. Device ID
  buffer.write(deviceID);

  // 2. Receipt Type
  buffer.write(receipt['receiptType']);

  // 3. Currency
  buffer.write(receipt['receiptCurrency']);

  // 4. Receipt Global No
  buffer.write(receipt['receiptGlobalNo']);

  // 5. Receipt Date
  buffer.write(receipt['receiptDate']);

  // 6. Total amount in cents
  final double totalAmount = double.parse(receipt['receiptTotal'].toString());
  buffer.write((totalAmount * 100).round().toString());

  // 7. Tax blocks
  final List<dynamic> receiptTaxes = receipt['receiptTaxes'] ?? [];

  for (var tax in receiptTaxes) {
    final String taxCode = tax['taxCode'];
    final double taxPercent = double.parse(tax['taxPercent'].toString());
    final double taxAmount = double.parse(tax['taxAmount'].toString());
    final double salesAmountWithTax = double.parse(tax['salesAmountWithTax'].toString());

    buffer.write(taxCode);

    // ✅ Apply the rule for taxCode 'A'
    if (taxCode == 'A') {
      buffer.write('0');
    } else {
      buffer.write(taxPercent.toStringAsFixed(2));
    }

    buffer.write((taxAmount * 100).round().toString());
    buffer.write((salesAmountWithTax * 100).round().toString());
  }

  // 8. Receipt Counter
  buffer.write(receipt['receiptCounter'].toString());

  // 9. Previous Receipt Hash
  buffer.write(previousReceiptHash);

  return buffer.toString();
}


  Future<String> generateFiscalJSON() async {
    String encodedreceiptDeviceSignature_signature;
  try {
    print("Entered generateFiscalJSON");

    String filePath = "/storage/emulated/0/Pulse/Configurations/steamTest_T_certificate.p12";
    String password = "steamTest123";

    // Ensure signing does not fail

    try {
      String data = await useRawString();
      //List<String>? signature = await getSignatureSignature(data);
      //receiptDeviceSignature_signature_hex = signature?[0];
      //receiptDeviceSignature_signature  = signature?[1];
      final Map<String, String> signedDataMap  = await signData(filePath, password, data);
      //final Map<String, dynamic> signedDataMap = jsonDecode(signedDataString);
      receiptDeviceSignature_signature_hex = signedDataMap["receiptDeviceSignature_signature_hex"] ?? "";
      receiptDeviceSignature_signature = signedDataMap["receiptDeviceSignature_signature"] ?? "";
      first16Chars = signedDataMap["receiptDeviceSignature_signature_md5_first16"] ?? "";
      
      verifySignatureAndShowResult(context, filePath, password, data, receiptDeviceSignature_signature.toString());
      
    } catch (e) {
      Get.snackbar("Signing Error", "$e", snackPosition: SnackPosition.TOP);
      return "{}";
    }
    print("Signed Data: $receiptDeviceSignature_signature");
    if (receiptItems.isEmpty) {
      print("Receipt items are empty, returning empty JSON.");
      return "{}";
    }

    int fiscalDayNo = await dbHelper.getlatestFiscalDay();
    int nextReceiptCounter = await dbHelper.getNextReceiptCounter(fiscalDayNo);
   

    int nextInvoice = await dbHelper.getNextInvoiceId();
    int getNextReceiptGlobalNo = await dbHelper.getLatestReceiptGlobalNo();
    String saleCurrency = selectedPayMethod.isEmpty ? defaultCurrency.toString() : returnCurrency();

    // Ensure tax calculation does not fail
    List<Map<String, dynamic>> taxes = [];
    try {
      taxes = generateReceiptTaxes(receiptItems);
    } catch (e) {
      Get.snackbar("Tax Calculation Error", "$e", snackPosition: SnackPosition.TOP);
      return "{}";
    }

    DateTime now = DateTime.now();
    String formattedDate = DateFormat("yyyy-MM-ddTHH:mm:ss").format(now);

    String hash = await generateHash(formattedDate);
    print("Hash generated successfully");

    Map<String, dynamic> jsonData = {
      "receipt": {
        "receiptLines": receiptItems.asMap().entries.map((entry) {
          int index = entry.key + 1;
          var item = entry.value;
          if (item["taxPercent"] != "0"){
            return {
            "receiptLineNo": "$index",
            "receiptLineHSCode": "04021099",
            "receiptLinePrice": item["price"].toStringAsFixed(2),
            "taxID": item["taxID"],
            //if  "taxPercent":  item["taxPercent"] == "" ? 0.00  : double.parse(item["taxPercent"].toString()).toStringAsFixed(2),
            "taxPercent": item["taxPercent"],   
            "receiptLineType": "Sale",
            "receiptLineQuantity": item["quantity"].toString(),
            "taxCode": item["taxCode"],
            "receiptLineTotal": item["total"].toStringAsFixed(2),
            "receiptLineName": item["productName"],
          };
          }
          else{
            return {
            "receiptLineNo": "$index",
            "receiptLineHSCode": "99001000",
            "receiptLinePrice": item["price"].toStringAsFixed(2),
            "taxID": item["taxID"], 
            "receiptLineType": "Sale",
            "receiptLineQuantity": item["quantity"].toString(),
            "taxCode": item["taxCode"],
            "receiptLineTotal": item["total"].toStringAsFixed(2),
            "receiptLineName": item["productName"],
          };
          }
          
          // Only add taxPercent if it's not an empty strin
        }).toList(),
        "receiptType": "FISCALINVOICE",
        "receiptGlobalNo": getNextReceiptGlobalNo + 1,
        "receiptCurrency": saleCurrency,
        "receiptPrintForm": "InvoiceA4",
        "receiptDate": formattedDate,
        "receiptPayments": [
          {"moneyTypeCode": "Cash", "paymentAmount": totalAmount.toStringAsFixed(2)}
        ],
        "receiptCounter": nextReceiptCounter,
        "receiptTaxes": taxes,
        "receiptDeviceSignature": {
          "signature": receiptDeviceSignature_signature,
          "hash": hash,
        },
        "buyerData": {
          "VATNumber": "123456789",
          "buyerTradeName": "Cash Sale",
          "buyerTIN": "0000000000",
          "buyerRegisterName": "Cash Sale"
        },
        "receiptTotal": totalAmount.toStringAsFixed(2),
        "receiptLinesTaxInclusive": true,
        "invoiceNo": nextInvoice.toString() ,
      }
    };

    // Ensure JSON encoding does not fail
    final jsonString;
    try {
      jsonString = jsonEncode(jsonData);
    } catch (e) {
      Get.snackbar("JSON Encoding Error", "$e", snackPosition: SnackPosition.TOP);
      return "{}";
    }
    // String getLatestReceiptHash = await dbHelper.getLatestReceiptHash();

    // String verifyString =  buildZimraCanonicalString(receipt: jsonData, deviceID: "25395", previousReceiptHash: getLatestReceiptHash);
    // verifyString.trim();
    // var bytes = utf8.encode(verifyString);
    // var digest = sha256.convert(bytes);
    // final hashVerify = base64.encode(digest.bytes);
    // verifySignatureAndShowResult2(context, filePath, password, hashVerify, receiptDeviceSignature_signature.toString());
    File file = File("/storage/emulated/0/Pulse/Configurations/jsonFile.txt");
    await file.writeAsString(jsonString);
    print("Generated JSON: $jsonString");
    return jsonString;

  } catch (e) {
    Get.snackbar(
      "Error Message",
      "$e",
      snackPosition: SnackPosition.TOP,
      colorText: Colors.white,
      backgroundColor: Colors.red,
      icon: const Icon(Icons.error),
      shouldIconPulse: true
    );
    return "{}"; // Ensure the function always returns something
  }
}

List<Map<String, dynamic>> generateReceiptTaxes(List<dynamic> receiptItems) {
  Map<int, Map<String, dynamic>> taxGroups = {}; // Store tax summaries

  for (var item in receiptItems) {
    int taxID = item["taxID"];
    String taxPercent = item["taxPercent"];
    double total = item["total"];

    if (!taxGroups.containsKey(taxID)) {
      taxGroups[taxID] = {
        "taxID": taxID,
        "taxPercent": taxPercent.isEmpty ? "" : taxPercent, // Leave blank if empty
        "taxCode": item["taxCode"],
        "taxAmount": 0.0,
        "salesAmountWithTax": 0.0
      };
    }

    // Calculate tax amount
    //double taxAmount = taxPercent.isEmpty
      //  ? 0.00  // If taxPercent is empty, set taxAmount to 0.00
       // : total - double.parse((total / 1.15).toString());
    double taxAmount;
    if(taxPercent.isEmpty){
      taxAmount = 0.00;
    }
    else if(taxPercent=="15.00"){
      taxAmount = total - double.parse((total / 1.15).toString());
    }
    else{
      taxAmount = total * 0;
    }
    taxGroups[taxID]!["taxAmount"] += taxAmount;
    taxGroups[taxID]!["salesAmountWithTax"] += total;
  }

  // Convert map to list and round values
  // return taxGroups.values.map((tax) {
  //   return {
  //     "taxID": tax["taxID"],
  //     "taxPercent": tax["taxPercent"],  // Blank if empty
  //     "taxCode": tax["taxCode"],
  //     "taxAmount": tax["taxAmount"].toStringAsFixed(2), // Rounded to 2 decimal places
  //     "salesAmountWithTax": tax["salesAmountWithTax"],
  //   };
  // }).toList();
  return taxGroups.values.map((tax) {
    final taxID = tax["taxID"];
    final taxCode = tax["taxCode"];
    final isGroupA = (taxCode == "A" || taxID == 1);

    return {
      "taxID": taxID.toString(),
      if (!isGroupA) "taxPercent": tax["taxPercent"], // Omit if group A
      "taxCode": taxCode,
      "taxAmount": isGroupA ? "0" : tax["taxAmount"].toStringAsFixed(2),
      "salesAmountWithTax": tax["salesAmountWithTax"],
    };
  }).toList();
}

String generateTaxSummary(List<dynamic> receiptItems) {
  Map<int, Map<String, dynamic>> taxGroups = {};

  for (var item in receiptItems) {
    int taxID = item["taxID"];
    double total = item["total"];
    String taxCode = item["taxCode"];
    
    // Preserve empty taxPercent when missing
    String? taxPercentValue = item["taxPercent"];
    double taxPercent = (taxPercentValue == null || taxPercentValue == "")
        ? 0.0
        : double.parse(taxPercentValue);

    if (!taxGroups.containsKey(taxID)) {
      taxGroups[taxID] = {
        "taxCode": taxCode,
        "taxPercent": taxPercentValue == null || taxPercentValue == "" 
          ? 0
          : (taxPercent % 1 == 0 
              ? "${taxPercent.toInt()}.00" 
              : taxPercent.toStringAsFixed(2)),
        "taxAmount": 0.0,
        "salesAmountWithTax": 0.0
      };
    }
    double taxAmount ;
    if(taxPercentValue=="15.00"){
      taxAmount = total - double.parse((total / 1.15).toString());
    }else{
      taxAmount = total * 0;
    }
    taxGroups[taxID]!["taxAmount"] += taxAmount;
    taxGroups[taxID]!["salesAmountWithTax"] += total;
  }

  List<Map<String, dynamic>> sortedTaxes = taxGroups.values.toList()
    ..sort((a, b) => a["taxCode"].compareTo(b["taxCode"]));

  // return sortedTaxes.map((tax) {
  //   return "${tax["taxCode"]}${tax["taxPercent"]}${(tax["taxAmount"] * 100).round().toString()}${(tax["salesAmountWithTax"] * 100).round().toString()}";
  // }).join("");
  return sortedTaxes.map((tax) {
    final taxCode = tax["taxCode"];
    final taxPercent = tax["taxPercent"];
    final taxAmount = (tax["taxAmount"] * 100).round().toString();
    final salesAmount = (tax["salesAmountWithTax"] * 100).round().toString();

    // Omit taxPercent for taxCode A
    if (taxCode == "A") {
      return "$taxCode$taxAmount$salesAmount";
    }

    return "$taxCode$taxPercent$taxAmount$salesAmount";
  }).join("");
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


/// Function to generate the final concatenated receipt string
String generateReceiptString({
  required int deviceID,
  required String receiptType,
  required String receiptCurrency,
  required int receiptGlobalNo,
  required DateTime receiptDate,
  required double receiptTotal,
  required List<dynamic> receiptItems,
  required String getPreviousReceiptHash,
}) {
  String formattedDate = receiptDate.toIso8601String().split('.').first;
  print("Formatted Date: $formattedDate");
  String formattedTotal = receiptTotal.toStringAsFixed(2);
  double receiptTotal_numeric = receiptTotal;
  int receiptTotal_ampl = (receiptTotal_numeric * 100).round();
  String receiptTotal_adj = receiptTotal_ampl.toString();
  String receiptTaxes = generateTaxSummary(receiptItems);

  return "$deviceID$receiptType$receiptCurrency$receiptGlobalNo$formattedDate$receiptTotal_adj$receiptTaxes$getPreviousReceiptHash";
}

  /// Generate SHA-256 Hash
  /// 
  useRawString() async {
    int latestFiscDay = await dbHelper.getlatestFiscalDay();
    setState(() {
      currentFiscal = latestFiscDay;
    });
    List<Map<String, dynamic>> data = await dbHelper.getReceiptsSubmittedToday(currentFiscal);
    setState(() {
      dayReceiptCounter = data;
    });
    int latestReceiptGlobalNo = await dbHelper.getLatestReceiptGlobalNo();
    int currentGlobalNo = latestReceiptGlobalNo + 1;
    String getLatestReceiptHash = await dbHelper.getLatestReceiptHash();
    if (dayReceiptCounter.isEmpty){
      String receiptString = generateReceiptString(
        deviceID: 25395,
        receiptType: "FISCALINVOICE",
        receiptCurrency: "USD",
        receiptGlobalNo: currentGlobalNo,
        receiptDate: DateTime.now(),
        receiptTotal: totalAmount,
        receiptItems: receiptItems,
        getPreviousReceiptHash:"",
      );
      print("Concatenated Receipt String: $receiptString");
      return receiptString;
    }else{
      String receiptString = generateReceiptString(
        deviceID: 25395,
        receiptType: "FISCALINVOICE",
        receiptCurrency: "USD",
        receiptGlobalNo: currentGlobalNo,
        receiptDate: DateTime.now(),
        receiptTotal: totalAmount,
        receiptItems: receiptItems,
        getPreviousReceiptHash: getLatestReceiptHash,
      );
      print("Concatenated Receipt String: $receiptString");
      return receiptString;
    }
    
  
  }

  generateHash(String date) async {
    int latestFiscDay = await dbHelper.getlatestFiscalDay();
    String receiptString;
    setState(() {
      currentFiscal = latestFiscDay;
    });
    List<Map<String, dynamic>> data = await dbHelper.getReceiptsSubmittedToday(currentFiscal);
    setState(() {
      dayReceiptCounter = data;
    });
    int latestReceiptGlobalNo = await dbHelper.getLatestReceiptGlobalNo();
    int currentGlobalNo = latestReceiptGlobalNo + 1;
    String getLatestReceiptHash = await dbHelper.getLatestReceiptHash();
    if(dayReceiptCounter.isEmpty){
      receiptString = generateReceiptString(
        deviceID: 25395,
        receiptType: "FISCALINVOICE",
        receiptCurrency: "USD",
        receiptGlobalNo: currentGlobalNo,
        receiptDate: DateTime.parse(date),
        receiptTotal: totalAmount,
        receiptItems: receiptItems,
        getPreviousReceiptHash:"",
      );
      print("Concatenated Receipt String:$receiptString");
      receiptString.trim();
    }
    else{
      receiptString = generateReceiptString(
        deviceID: 25395,
        receiptType: "FISCALINVOICE",
        receiptCurrency: "USD",
        receiptGlobalNo: currentGlobalNo,
        receiptDate: DateTime.parse(date),
        receiptTotal: totalAmount,
        receiptItems: receiptItems,
        getPreviousReceiptHash: getLatestReceiptHash,
      );
    }
  print("Concatenated Receipt String:$receiptString");
  receiptString.trim();
    var bytes = utf8.encode(receiptString);
    var digest = sha256.convert(bytes);
    final hash = base64.encode(digest.bytes);
    print(hash);
    return hash;
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
  Map<String , dynamic> jsonDatatest = {"receipt":{"receiptLines":[{"receiptLineNo":"1","receiptLineHSCode":"99001000","receiptLinePrice":"434.78","taxID":3,"taxPercent":"15.00","receiptLineType":"Sale","receiptLineQuantity":"1.0","taxCode":"C","receiptLineTotal":"434.78","receiptLineName":"RENTAL JANUARY 2025 "}],"receiptType":"FISCALINVOICE","receiptGlobalNo":6,"receiptCurrency":"USD","receiptPrintForm":"InvoiceA4","receiptDate":"2025-01-31T17:18:37","receiptPayments":[{"moneyTypeCode":"Cash","paymentAmount":"434.78"}],"receiptCounter":5,"receiptTaxes":[{"taxID":"3","taxPercent":"15.00","taxCode":"C","taxAmount":"56.71","SalesAmountwithTax":434.78}],"receiptDeviceSignature":{"signature":"","hash": ""},"buyerData":{"VATNumber":"123456789","buyerTradeName":"SAT ","buyerTIN":"0000000000","buyerRegisterName":"SAT "},"receiptTotal":"434.78","receiptLinesTaxInclusive":true,"invoiceNo":"00000390"}};
  String getReceiptQrData(String receiptDeviceSignatureSignatureHexsent) {
    return receiptDeviceSignatureSignatureHexsent.length > 16 
      ? receiptDeviceSignatureSignatureHexsent.substring(0, 16) 
      : receiptDeviceSignatureSignatureHexsent;
  }
  
  Future<void> submitReceipt() async {
    String jsonString  = await generateFiscalJSON();
    final receiptJson = jsonEncode(jsonString);
    Get.snackbar(
      'Fiscalizing',
      'Processing',
      icon: const Icon(Icons.check, color: Colors.white,),
      colorText: Colors.white,
      backgroundColor: Colors.green,
      snackPosition: SnackPosition.TOP,
      showProgressIndicator: true,
    );
    String pingResponse = await ping();
    final receiptJsonbody = await generateFiscalJSON();
    
    Map<String, dynamic> jsonData = jsonDecode(receiptJsonbody);
    final db=DatabaseHelper();
      String moneyType = (jsonData['receipt']['receiptPayments'] != null && jsonData['receipt']['receiptPayments'].isNotEmpty)
      ? jsonData['receipt']['receiptPayments'][0]['moneyTypeCode'].toString()
      : "";
      print("your date is ${jsonData['receipt']?['receiptDate']}");
      print("your invoice number is ${jsonData['receipt']?['invoiceNo']?.toString()}");
      print(jsonData);
      int fiscalDayNo = await db.getlatestFiscalDay();
      print("fiscal day no is $fiscalDayNo");
      double receiptTotal = double.parse(jsonData['receipt']?['receiptTotal']?.toString() ?? "0");
      String formattedDeviceID = deviceID.toString().padLeft(10, '0');
      String parseDate = jsonData['receipt']?['receiptDate'];
      DateTime formattedDate = DateTime.parse(parseDate);
      String formattedDateStr = DateFormat("ddMMyyyy").format(formattedDate);
      int latestReceiptGlobalNo = await db.getLatestReceiptGlobalNo();
      
      int currentGlobalNo = latestReceiptGlobalNo + 1;
      String formatedReceiptGlobalNo = currentGlobalNo.toString().padLeft(10, '0');
      String receiptDeviceSignatureSignatureHex= receiptDeviceSignature_signature_hex.toString();
      //String receiptQrData = getReceiptQrData(receiptDeviceSignatureSignatureHex);
      String receiptQrData = first16Chars.toString();
      String testHash = "Lvf3obAk4W4uJclOQTcqwV4zd+59xIj5sEOv5e5UUlM=";
      String testQrData = getReceiptQrData(testHash);
      String qrurl = genericzimraqrurl + formattedDeviceID + formattedDateStr + formatedReceiptGlobalNo + receiptQrData;
      print("QR URL: $qrurl");
      
    if(pingResponse=="200"){
      String apiEndpointSubmitReceipt =
      "https://fdmsapitest.zimra.co.zw/Device/v1/25395/SubmitReceipt";
      const String deviceModelName = "Server";
      const String deviceModelVersion = "v1";  

      SSLContextProvider sslContextProvider = SSLContextProvider();
      SecurityContext securityContext = await sslContextProvider.createSSLContext();
      
      print(receiptJsonbody);
      // Call the Ping function
      Map<String, dynamic> response = await SubmitReceipts.submitReceipts(
        apiEndpointSubmitReceipt: apiEndpointSubmitReceipt,
        deviceModelName: deviceModelName,
        deviceModelVersion: deviceModelVersion,
        securityContext: securityContext,
        receiptjsonBody:receiptJsonbody,
      );
      print(response);
      Get.snackbar(
        "Zimra Response", "$response",
        snackPosition: SnackPosition.TOP,
        colorText: Colors.white,
        backgroundColor: Colors.green,
        icon: const Icon(Icons.message, color: Colors.white),
      );
      Map<String, dynamic> responseBody = jsonDecode(response["responseBody"]);
      int statusCode = response["statusCode"];
      String submitReceiptServerresponseJson = responseBody.toString();
      print("your server server response is $submitReceiptServerresponseJson");
      if (statusCode == 200) {
      print("Code is 200, saving receipt...");

      // Check if 'receiptPayments' is non-empty before accessing index 0
      
      try {
        final Database dbinit = await dbHelper.initDB();
        await dbinit.insert('submittedReceipts',
          {
            'receiptCounter': jsonData['receipt']?['receiptCounter'] ?? 0,
            'FiscalDayNo' : fiscalDayNo,
            'InvoiceNo': int.tryParse(jsonData['receipt']?['invoiceNo']?.toString() ?? "0") ?? 0,
            'receiptID': responseBody['receiptID'] ?? 0,
            'receiptType': jsonData['receipt']['receiptType']?.toString() ?? "",
            'receiptCurrency': jsonData['receipt']?['receiptCurrency']?.toString() ?? "",
            'moneyType': moneyType,
            'receiptDate': jsonData['receipt']?['receiptDate']?.toString() ?? "",
            'receiptTime': jsonData['receipt']?['receiptDate']?.toString() ?? "",
            'receiptTotal': receiptTotal,
            'taxCode': "C",
            'taxPercent': "15.00",
            'taxAmount': taxAmount ?? 0,
            'SalesAmountwithTax': salesAmountwithTax ?? 0,
            'receiptHash': jsonData['receipt']?['receiptDeviceSignature']?['hash']?.toString() ?? "",
            'receiptJsonbody': receiptJsonbody?.toString() ?? "",
            'StatustoFDMS': "Submitted".toString(),
            'qrurl': qrurl,
            'receiptServerSignature': responseBody['receiptServerSignature']?['signature'].toString() ?? "",
            'submitReceiptServerresponseJSON': "$submitReceiptServerresponseJson" ?? "noresponse",
            'Total15VAT': '0.0',
            'TotalNonVAT': 0.0,
            'TotalExempt': 0.0,
            'TotalWT': 0.0,
          },
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
         //print("Data inserted successfully!");
        generateInvoiceFromJson(jsonData, qrurl);
        //print58mmAdvanced(jsonData, qrurl);
      } catch (e) {
        Get.snackbar(" Db Error",
          "$e",
          snackPosition: SnackPosition.TOP,
          colorText: Colors.white,
          backgroundColor: Colors.red,
          icon: const Icon(Icons.error),
        );
    }
    
  }
  else{
    try {
        final Database dbinit = await dbHelper.initDB();
        await dbinit.insert('submittedReceipts',
          {
            'receiptCounter': jsonData['receipt']?['receiptCounter'] ?? 0,
            'FiscalDayNo' : fiscalDayNo,
            'InvoiceNo': int.tryParse(jsonData['receipt']?['invoiceNo']?.toString() ?? "0") ?? 0,
            'receiptID': 0,
            'receiptType': jsonData['receipt']['receiptType']?.toString() ?? "",
            'receiptCurrency': jsonData['receipt']?['receiptCurrency']?.toString() ?? "",
            'moneyType': moneyType,
            'receiptDate': jsonData['receipt']?['receiptDate']?.toString() ?? "",
            'receiptTime': jsonData['receipt']?['receiptDate']?.toString() ?? "",
            'receiptTotal': receiptTotal,
            'taxCode': "C",
            'taxPercent': "15.00",
            'taxAmount': taxAmount ?? 0,
            'SalesAmountwithTax': salesAmountwithTax ?? 0,
            'receiptHash': jsonData['receipt']?['receiptDeviceSignature']?['hash']?.toString() ?? "",
            'receiptJsonbody': receiptJsonbody?.toString() ?? "",
            'StatustoFDMS': "NOTSubmitted".toString(),
            'qrurl': qrurl,
            'receiptServerSignature':"",
            'submitReceiptServerresponseJSON':"noresponse",
            'Total15VAT': '0.0',
            'TotalNonVAT': 0.0,
            'TotalExempt': 0.0,
            'TotalWT': 0.0,
          },
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
         print("Data inserted successfully!");
         generateInvoiceFromJson(jsonData, qrurl);
         // print58mmAdvanced(jsonData, qrurl);
      } catch (e) {
        Get.snackbar("Db Error",
          "$e",
          snackPosition: SnackPosition.TOP,
          colorText: Colors.white,
          backgroundColor: Colors.red,
          icon: const Icon(Icons.error),
        );
    }
  }
    }
    else{
      
      try {
        final Database dbinit = await dbHelper.initDB();
        await dbinit.insert('submittedReceipts',
          {
            'receiptCounter': jsonData['receipt']?['receiptCounter'] ?? 0,
            'FiscalDayNo' : fiscalDayNo,
            'InvoiceNo': int.tryParse(jsonData['receipt']?['invoiceNo']?.toString() ?? "0") ?? 0,
            'receiptID': 0,
            'receiptType': jsonData['receipt']['receiptType']?.toString() ?? "",
            'receiptCurrency': jsonData['receipt']?['receiptCurrency']?.toString() ?? "",
            'moneyType': moneyType,
            'receiptDate': jsonData['receipt']?['receiptDate']?.toString() ?? "",
            'receiptTime': jsonData['receipt']?['receiptDate']?.toString() ?? "",
            'receiptTotal': receiptTotal,
            'taxCode': "C",
            'taxPercent': "15.00",
            'taxAmount': taxAmount ?? 0,
            'SalesAmountwithTax': salesAmountwithTax ?? 0,
            'receiptHash': jsonData['receipt']?['receiptDeviceSignature']?['hash']?.toString() ?? "",
            'receiptJsonbody': receiptJsonbody?.toString() ?? "",
            'StatustoFDMS': "NOTSubmitted".toString(),
            'qrurl': qrurl,
            'receiptServerSignature':"",
            'submitReceiptServerresponseJSON':"noresponse",
            'Total15VAT': '0.0',
            'TotalNonVAT': 0.0,
            'TotalExempt': 0.0,
            'TotalWT': 0.0,
          },
          conflictAlgorithm: ConflictAlgorithm.replace,
        );
         print("Data inserted successfully!");
         generateInvoiceFromJson(jsonData, qrurl);
          //print58mmAdvanced(jsonData, qrurl);
      } catch (e) {
        Get.snackbar("DB error Error",
          "$e",
          snackPosition: SnackPosition.TOP,
          colorText: Colors.white,
          backgroundColor: Colors.red,
          icon: const Icon(Icons.error),
        );
    }
    }
  }
  completeSale() async {
    try {
      final double totalAmount = calculateTotalPrice();
    final double totalTax = calculateTotalTax();
    final double indiTax = calculateIndividualtax();
    final int customerID;
    
    if(selectedCustomer.isEmpty){
      customerID = 999999;
      //= selectedCustomer[0]['customerID']
      await dbHelper.saveSale(cartItems, totalAmount, totalTax , indiTax, customerID );
      for (var item in cartItems){
      int sellQty = item['sellqty'];
      int productid = item['productid'];
      final product = await dbHelper.getProductById(productid);
      setState(() {
        productOnSale = product;
      });
      int productOnSaleQty = productOnSale[0]['stockQty'];
      int remainingStock = productOnSaleQty - sellQty;
      dbHelper.updateProductStockQty(productid, remainingStock);
    }
    }
    else{
      customerID = selectedCustomer[0]['customerID'];
      await dbHelper.saveSale(cartItems, totalAmount, totalTax , indiTax, customerID );
      for (var item in cartItems){
      int sellQty = item['sellqty'];
      int productid = item['productid'];
      final product = await dbHelper.getProductById(productid);
      setState(() {
        productOnSale = product;
      });
      int productOnSaleQty = productOnSale[0]['stockQty'];
      int remainingStock = productOnSaleQty - sellQty;
      dbHelper.updateProductStockQty(productid, remainingStock);
    }
    }
    Get.snackbar(
      'Succes',
      'Sales Done',
      icon: const Icon(Icons.check, color: Colors.white,),
      colorText: Colors.white,
      backgroundColor: Colors.green,
      snackPosition: SnackPosition.TOP,
    );
    clearCart();
    } catch (e) {
      Get.snackbar(
        "Error",
        "Sale Not Done: $e",
        icon: Icon(Icons.error),
        colorText: Colors.white,
        backgroundColor: Colors.red,
      );
    }
    // Clear the cart
    // Notify user
    //ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Sale completed!")))
  }

  void clearCart(){
    setState(() {
      cartItems.clear();
    });
  }

  void searchProducts(String query) async{
    final results = await dbHelper.searchProducts(query);
    setState(() {
      searchResults = results;
    });
  }

  void searchCustomerDetails(String query) async{
    final customerSearchResult = await dbHelper.searchCustomer(query);
    setState(() {
      customerDetails = customerSearchResult;
    });
  }

  Future<void> fetchPayMethods() async {
    List<Map<String, dynamic>> data = await dbHelper.getPaymentMethods();
    setState(() {
      payMethods = data;
    });
  }

  Future<void> fetchDefaultCurrency() async {
    try {
      String? currency = await dbHelper.getDefaultCurrency();
      setState(() {
        defaultCurrency = currency ?? 'N/A'; // Display 'N/A' if no default currency is found
      });
    } catch (e) {
      print('Error fetching default currency: $e');
      setState(() {
        defaultCurrency = 'Error';
      });
    }

  }

  Future<void> fetchDefaultRate() async {
    try {
      double? rate = await dbHelper.getDefaultRate();
      setState(() {
        defaultRate = rate ?? 1.0; // Default to 0.0 if no rate is found
      });
    } catch (e) {
      print('Error fetching default rate: $e');
      setState(() {
        defaultRate = null; // Handle error by setting rate to null
      });
    }
  }

  Future<void> fetchDefaultPayMethod() async {
    int defaultTag = 1;
    try {
      List<Map<String, dynamic>> data = await dbHelper.getDefaultPayMethod(defaultTag);
      if (data.isNotEmpty) {
        defaultPayMethod = data;
        print('Default payment method fetched: $defaultPayMethod');
      } else {
        print('No default payment method found for defaultTag: $defaultTag');
        defaultPayMethod = [];
      }
    } catch (e) {
      print('Error fetching default payment method: $e');
      defaultPayMethod = []; // Optional: Handle this scenario based on your application logic
    }
  }

  void addToCustomer(Map<String , dynamic> customer){
    selectedCustomer.add(customer);
    Get.snackbar(
      "Success",
      "Customer Added",
      colorText: Colors.white,
      backgroundColor: Colors.green,
      snackPosition: SnackPosition.TOP
    );
    Navigator.pop(context);
  }

  void addToPayments(Map<String , dynamic> payMethod){
    selectedPayMethod.add(payMethod);

    Get.snackbar(
      "Success",
      "Customer Added",
      colorText: Colors.white,
      backgroundColor: Colors.green,
      snackPosition: SnackPosition.TOP
    );
    Navigator.pop(context);
  }

  String returnCurrency() {
    if (selectedPayMethod.isNotEmpty) {
      String selectedCurrency = selectedPayMethod[0]['currency'];
      print(selectedCurrency);
      return selectedCurrency;
      
    } else {
      return defaultCurrency ?? 'N/A';
    }
  }

  void addToCart(Map<String, dynamic> product) {
    //double qty = 1;
    int stockQty = product['stockQty'];
    if (stockQty > 0){
      setState(() {

      int index = cartItems.indexWhere((item) => item['productid']==product['productid']);
      if(index != -1){
        cartItems[index]['sellqty'] +=1;
      }else{
        Map<String, dynamic> updatedProduct = {...product};
        updatedProduct['sellqty'] = 1;
        cartItems.add(updatedProduct);
      }
    });
    }
    else{
      Get.snackbar(
        "No Stock",
        "Product is now out of stock",
        colorText: Colors.black,
        backgroundColor: Colors.amber,
        icon:const Icon(Icons.error)
      );
    }
    
  }

  double calculateTotalTax() {
    double totalTax = 0.0;
    
    for (var item in cartItems) {
      final taxType = item['tax']; // e.g., 'vat', 'zero', 'ex'
      final sellingPrice = item['sellingPrice'];
      final quantity = item['sellqty'];

      // Determine the applicable tax rate
      double taxRate = 0.0;
      if (taxType == 'vat') {
        taxRate = 0.15; // 15% VAT
      } else if (taxType == 'zero' || taxType == 'ex') {
        taxRate = 0.0; // Zero-rated or exempted
      }

      if(selectedPayMethod.isEmpty){
        totalTax += sellingPrice * quantity*taxRate;
      }
      else{
        double rate  = selectedPayMethod[0]['rate'];
        totalTax += sellingPrice * quantity * taxRate *rate;
      }
      // Calculate the tax for this item
    }
    return totalTax;
  }

  double calculateIndividualtax(){
    double indiTax  = 0 ;
    for (var item in cartItems) {
      final taxType = item['tax']; // e.g., 'vat', 'zero', 'ex'
      final sellingPrice = item['sellingPrice'];
      final quantity = item['sellqty'];

      // Determine the applicable tax rate
      double taxRate = 0.0;
      if (taxType == 'vat') {
        taxRate = 0.15; // 15% VAT
      } else if (taxType == 'zero' || taxType == 'ex') {
        taxRate = 0.0; // Zero-rated or exempted
      }

      // Calculate the tax for this item
      indiTax = sellingPrice * quantity * taxRate;
    }
    return indiTax;
  }

 

  double calculateTotalPrice() {
    return cartItems.fold(0.0, (total, item) {
      final double sellingPrice = item['sellingPrice'] ?? 0.0; // Default to 0.0 if null
      final int sellQty = item['sellqty'] ?? 1.0; // Default to 1.0 if null
      if(selectedPayMethod.isEmpty){
        return total + (sellingPrice * sellQty);
      }else{
        double rate  = selectedPayMethod[0]['rate'];
        return total + (sellingPrice * sellQty * rate);
      }
    });
  }

  ///=====CUSTOMER DETAILS=====//////////
  //////////////////////////////////////
  addCustomerDetails(){
    return showModalBottomSheet(
      isScrollControlled: true,
      isDismissible: false,
      context: context,
      builder: (context){
        return Container(
          height: 600,
          child: Padding(
            padding:  EdgeInsets.only(
              left: 16.0,
              right: 16.0,
              top: 16.0,
              bottom: MediaQuery.of(context).viewInsets.bottom
            ),
            child: Form(
              key: formKey,
              child: ListView(
                scrollDirection: Axis.vertical,
                  children: [
                    Center(
                      child: Container(
                        height: 5,
                        width: 100,
                        decoration: BoxDecoration(
                          color: kDark,
                          borderRadius: BorderRadius.circular(20), 
                        ),
                      ),
                    ),
                    const SizedBox(height: 10,),
                    Row(
                      children: [
                        IconButton(onPressed: (){
                          Navigator.pop(context);
                        }, icon:const Icon(Icons.arrow_circle_left_sharp, size: 40, color: kDark,)),
                        const Center(child: const Text("Customer Details" , style: TextStyle(color: Colors.black,fontSize: 18, fontWeight: FontWeight.w500),)),
                      ],
                    ),
                    SizedBox(height: 15,),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.start,
                      children: [
                        Text("Existing?"),
                        SizedBox(height: 10,),
                        Expanded(
                          child: TextField(
                            controller: searchCustomer,
                            onChanged: searchCustomerDetails,
                            decoration: InputDecoration(
                              labelText: 'Name',
                              labelStyle: TextStyle(color:Colors.grey.shade600 ),
                              filled: true,
                              fillColor: Colors.grey.shade300,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12.0),
                                borderSide: BorderSide.none
                              )
                            ),
                            
                          )
                        ),
                        IconButton(
                          onPressed: (){
                            searchCustomerDetails(searchCustomer.text);
                            setState(() {
                              isActve = false;
                            });
                          },
                          icon: Icon(Icons.person_search_rounded)
                        )
                      ],
                    ),
                    SizedBox(height: 10,),
                    Container(
                      height: 100,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10.0),
                        border: Border.all(width: 1 , color: const Color.fromARGB(255, 14, 19, 29)),
                        color:const Color.fromARGB(255, 14, 19, 29),
                      ),
                      child: ListView.builder(
                        itemCount: customerDetails.length,
                        itemBuilder: (context , index){
                          final customer = customerDetails[index];
                          return Container(
                            margin: const EdgeInsets.symmetric(vertical: 5.0, horizontal: 10.0),
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey, width: 1.0),
                              borderRadius: BorderRadius.circular(10.0), 
                              color: Colors.white, 
                            ),
                            child: ListTile(
                              title: Text(customer['tradeName']),
                              subtitle: Text("Price: \$${customer['tinNumber']}"),
                              trailing: IconButton(onPressed: ()=>addToCustomer(customer), icon:const Icon(Icons.add_circle_outline_sharp)),
                            ),
                          );
                        }
                      ),
                    ),
                    SizedBox(height: 10,),
                    TextFormField(
                      controller: customerNameController,
                      decoration: InputDecoration(
                          labelText: 'Trade Name',
                          labelStyle: TextStyle(color:Colors.grey.shade600 ),
                          enabled: isActve,
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12.0),
                              borderSide: BorderSide.none
                          )
                      ),
                    ),
                    const SizedBox(height: 10,),
                    TextFormField(
                      controller: tinController,
                      decoration: InputDecoration(
                          labelText: 'TIN Number',
                          labelStyle: TextStyle(color:Colors.grey.shade600 ),
                          enabled: isActve,
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12.0),
                              borderSide: BorderSide.none
                          )
                      ),
                      validator: (value){
                          if(value!.isEmpty){
                            return "TIN Required";
                          }return null;
                        },
                    ),
                    const SizedBox(height: 10,),
                    TextFormField(
                      controller: vatController,
                      decoration: InputDecoration(
                          labelText: 'VAT Number',
                          enabled: isActve,
                          labelStyle: TextStyle(color:Colors.grey.shade600 ),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12.0),
                              borderSide: BorderSide.none
                          )
                      ),
                      validator: (value){
                          if(value!.isEmpty){
                            return "VAT Required";
                          }return null;
                        },
                    ),
                    const SizedBox(height: 10,),
                    TextFormField(
                      controller: addressController,
                      decoration: InputDecoration(
                          labelText: 'Address',
                          labelStyle: TextStyle(color:Colors.grey.shade600 ),
                          enabled: isActve,
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12.0),
                              borderSide: BorderSide.none
                          )
                      ),
                    ),
                    const SizedBox(height: 10,),
                    TextFormField(
                      controller: emailController,
                      decoration: InputDecoration(
                          labelText: 'Email',
                          labelStyle: TextStyle(color:Colors.grey.shade600 ),
                          enabled: isActve,
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12.0),
                              borderSide: BorderSide.none
                          )
                      ),
                    ),
                    const SizedBox(height: 10,),
                    
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () async{
                          if(formKey.currentState!.validate()){
                            final db = DatabaseHelper();
                            await db.addCustomer(Customer(
                              tradeName: customerNameController.text,
                              tinNumber: int.parse(tinController.text),
                              vatNumber: int.parse(vatController.text),
                              address: addressController.text,
                              email: emailController.text
                            ));
                            setState(() {
                              selectedCustomer.add({
                                'tradeName': customerNameController.text,
                                'tinNumber': tinController.text,
                                'vatNumber': vatController.text,
                                'address': addressController.text,
                                'email': emailController.text,
                              });
                            });
                            
                            Navigator.pop(context);
                            Get.snackbar(
                              'Success',
                              'Customer Details Saved',
                              snackPosition: SnackPosition.TOP,
                              backgroundColor: Colors.green,
                              colorText: Colors.white
                            );
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: kDark,
                          padding:const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12.0),
                          ),
                        ),
                        child: const Text(
                          'Save Customer',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                
              ),
            ),
          ),
        );
      }
    );
  }
  
 

  ///=====PAYMENT METHODS=====//////////
  //////////////////////////////////////
  addpaymethod(){
    return showModalBottomSheet(
      isScrollControlled: true,
      isDismissible: false,
      context: context,
      builder: (context){
        return Container(
          height: 600,
          child: Padding(
            padding:  EdgeInsets.only(
              left: 16.0,
              right: 16.0,
              top: 16.0,
              bottom: MediaQuery.of(context).viewInsets.bottom
            ),
            child: Form(
              key: formKey,
              child: ListView(
                scrollDirection: Axis.vertical,
                  children: [
                    Center(
                      child: Container(
                        height: 5,
                        width: 100,
                        decoration: BoxDecoration(
                          color: kDark,
                          borderRadius: BorderRadius.circular(20), 
                        ),
                      ),
                    ),
                    const SizedBox(height: 10,),
                    Row(
                      children: [
                        IconButton(onPressed: (){
                          Navigator.pop(context);
                        }, icon:const Icon(Icons.arrow_circle_left_sharp, size: 40, color: kDark,)),
                        const Center(child: const Text("Payment Methods" , style: TextStyle(color: Colors.black,fontSize: 18, fontWeight: FontWeight.w500),)),
                      ],
                    ),
                    SizedBox(height: 15,),
                    
                    SizedBox(height: 10,),
                    Container(
                      height: 300,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10.0),
                        border: Border.all(width: 1 , color: const Color.fromARGB(255, 14, 19, 29)),
                        color:const Color.fromARGB(255, 14, 19, 29),
                      ),
                      child: ListView.builder(
                        itemCount: payMethods.length,
                        itemBuilder: (context , index){
                          final payMethod = payMethods[index];
                          return Container(
                            margin: const EdgeInsets.symmetric(vertical: 5.0, horizontal: 10.0),
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey, width: 1.0),
                              borderRadius: BorderRadius.circular(10.0), 
                              color: Colors.white, 
                            ),
                            child: ListTile(
                              title: Text(payMethod['description']),
                              subtitle: Text("Rate: ${payMethod['rate']}"),
                              trailing: IconButton(onPressed: (){
                                addToPayments(payMethod);
                                returnCurrency();
                              }, icon:const Icon(Icons.add_circle_outline_sharp)),
                            ),
                          );
                        }
                      ),
                    ),
                  ],
                
              ),
            ),
          ),
        );
      }
    );
  }

  ///=====PAYMENT METHODS=====//////////
  //////////////////////////////////////
  showProducts() async{
    products = await dbHelper.getAllProducts();
    return showModalBottomSheet(
      isScrollControlled: true,
      isDismissible: false,
      context: context,
      builder: (context){
        return Container(
          height: 600,
          child: Padding(
            padding:  EdgeInsets.only(
              left: 16.0,
              right: 16.0,
              top: 16.0,
              bottom: MediaQuery.of(context).viewInsets.bottom
            ),
            child: Form(
              key: formKey,
              child: ListView(
                scrollDirection: Axis.vertical,
                  children: [
                    Center(
                      child: Container(
                        height: 5,
                        width: 100,
                        decoration: BoxDecoration(
                          color: kDark,
                          borderRadius: BorderRadius.circular(20), 
                        ),
                      ),
                    ),
                    const SizedBox(height: 10,),
                    Row(
                      children: [
                        IconButton(onPressed: (){
                          Navigator.pop(context);
                        }, icon:const Icon(Icons.arrow_circle_left_sharp, size: 40, color: kDark,)),
                        const Center(child: const Text("Products" , style: TextStyle(color: Colors.black,fontSize: 18, fontWeight: FontWeight.w500),)),
                      ],
                    ),
                    const SizedBox(height: 15,),
                    const SizedBox(height: 10,),
                    Container(
                      height: 480,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(10.0),
                        border: Border.all(width: 1 , color: const Color.fromARGB(255, 14, 19, 29)),
                        color:const Color.fromARGB(255, 14, 19, 29),
                      ),
                      child: ListView.builder(
                        itemCount: products.length,
                        itemBuilder: (context , index){
                          final product = products[index];
                          return Container(
                            margin: const EdgeInsets.symmetric(vertical: 5.0, horizontal: 10.0),
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey, width: 1.0),
                              borderRadius: BorderRadius.circular(10.0), 
                              color: Colors.white, 
                            ),
                            child: ListTile(
                              title: Text(product['productName']),
                              subtitle: Text("Price: ${product['sellingPrice']}"),
                              trailing: IconButton(onPressed:()=>addToCart(product), icon:const Icon(Icons.add_circle_outline_sharp)),
                            ),
                          );
                        }
                      ),
                    ),
                  ],
                
              ),
            ),
          ),
        );
      }
    );
  }

  //sale done modal

  
  

  //=================END OF FUNCTIONS============================//a
  //======================================================//
  

  @override  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.blue,
        automaticallyImplyLeading: false,
        elevation: 0,
        shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(25),
                  bottomRight: Radius.circular(25)
                )
            ),
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
                controller: controller,
                onChanged: searchProducts,
              ),
              GestureDetector(
                onTap: ()=> searchProducts(controller.text),
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
          bottom: false,
          child: Padding(
            padding:const  EdgeInsets.symmetric(horizontal: 5.0 , vertical: 10.0) ,
            child: Column(
              children: [
                const SizedBox(height: 20,),
                Container(
                  height: 200,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10.0),
                    border: Border.all(width: 1 , color: Colors.grey.shade400),
                    color:Colors.grey.shade400,
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
                          trailing: IconButton(onPressed: ()=>addToCart(product), icon:const Icon(Icons.add_circle_outline_sharp)),
                        ),
                      );
                    }
                    ),
                ),
                const SizedBox(height: 10,),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(
                      height: 50 ,
                      width: 50,
                      decoration: BoxDecoration(
                        color: isBarcodeEnabled?  Colors.green : Colors.white,
                        borderRadius: BorderRadius.circular(15.0),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.2),
                            spreadRadius: 3,
                            blurRadius: 7,
        
                          )
                        ] 
                      ),
                      child: TextButton(onPressed: (){
                        //toggleBarcodeScanner;
                        if(isBarcodeEnabled){
                          setState(() {
                            isBarcodeEnabled = false;
                          });
                        }else{
                          setState(() {
                            isBarcodeEnabled = true;
                          });
                        }
                      },
                      child: Center(
                        child: isBarcodeEnabled? const Icon(Icons.barcode_reader , size: 25, color: Colors.white) : const Icon(Icons.barcode_reader , size: 25, color: Color.fromARGB(255, 14, 19, 29),) ,
                      )),
                    ),
                    //////////Button
                    Container(
                      height: 50 ,
                      width: 50,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(15.0),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.2),
                            spreadRadius: 3,
                            blurRadius: 7,
        
                          )
                        ] 
                      ),
                      child: TextButton(onPressed: (){
                        addCustomerDetails();
                      },
                      child: const Center(
                        child: Icon(Icons.person , size: 25, color: Color.fromARGB(255, 14, 19, 29),),
                      )),
                    ),
                    //////////Button
                    Container(
                      height: 50 ,
                      width: 50,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(15.0),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.2),
                            spreadRadius: 3,
                            blurRadius: 7,
        
                          )
                        ] 
                      ),
                      child: TextButton(onPressed: (){
                        try {
                          fetchPayMethods();
                          addpaymethod();
                        } catch (e) {
                          Get.snackbar("Error","$e", icon: Icon(Icons.error ,) ,colorText: Colors.white, backgroundColor: Colors.red);
                        }
                        
                      },
                      child: const Center(
                        child: Icon(Icons.monetization_on , size: 25, color: Color.fromARGB(255, 14, 19, 29),),
                      )),
                    ),
                    //////////Button
                    Container(
                      height: 50 ,
                      width: 50,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(15.0),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.2),
                            spreadRadius: 3,
                            blurRadius: 7,
        
                          )
                        ] 
                      ),
                      child: TextButton(onPressed: (){
                        
                      },
                      child: const Center(
                        child: Icon(Icons.discount , size: 25, color: Color.fromARGB(255, 14, 19, 29),),
                      )),
                    ),
                    //////////Button
                    Container(
                      height: 50 ,
                      width: 50,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(15.0),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.2),
                            spreadRadius: 3,
                            blurRadius: 7,
        
                          )
                        ] 
                      ),
                      child: TextButton(onPressed: (){
                        
                      },
                      child: const Center(
                        child: Icon(Icons.save , size: 25, color: Color.fromARGB(255, 14, 19, 29),),
                      )),
                    ),
                    //////////Button
                    Container(
                      height: 50 ,
                      width: 50,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(15.0),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.grey.withOpacity(0.2),
                            spreadRadius: 3,
                            blurRadius: 7,
        
                          )
                        ] 
                      ),
                      child: TextButton(onPressed: (){
                        
                      },
                      child: const Center(
                        child: Icon(Icons.scale , size: 25, color: Color.fromARGB(255, 14, 19, 29),),
                      )),
                    ),
                    
                  ],
                ),
                const SizedBox(height: 20,),
                const Text(
                  "Cart",
                  style: TextStyle(fontSize: 16 , fontWeight: FontWeight.w500),
                ),
                Container(
                  height: 250,
                  width: 390,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(10.0),
                    border: Border.all(width: 1 , color: Colors.grey.shade400),
                    color: Colors.grey.shade400,
                  ),
                  child: cartItems.isEmpty ? Lottie.asset('assets/cart.json'): ListView.builder(
                    itemCount: cartItems.length,
                    itemBuilder: (context , index){
                      final product = cartItems[index];
                      return Dismissible(
                        key: Key(product['productid'].toString()),
                        background: Container(
                          decoration: BoxDecoration(
                            color: Colors.green,
                            borderRadius: BorderRadius.circular(10.0)
                          ),
                          alignment: Alignment.centerLeft,
                          padding: const EdgeInsets.symmetric(horizontal: 20.0),
                          child: const Icon(Icons.add, color: Colors.white),
                        ),
                        secondaryBackground: Container(
                          decoration: BoxDecoration(
                            color: Colors.red,
                            borderRadius: BorderRadius.circular(10.0)
                          ),
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.symmetric(horizontal: 20.0),
                          child: const Icon(Icons.delete, color: Colors.white),
                        ),
                        confirmDismiss: (direction) async {
                          if (direction == DismissDirection.endToStart) {
                            // Swipe to the right to delete
                            bool confirm = await showDialog(
                              context: context,
                              builder: (context) => AlertDialog(
                                title: const Text('Remove Item'),
                                content: const Text('Are you sure you want to remove this item?'),
                                actions: [
                                  TextButton(
                                    onPressed: () => Navigator.of(context).pop(false),
                                    child: const Text('Cancel'),
                                  ),
                                  TextButton(
                                    onPressed: () => Navigator.of(context).pop(true),
                                    child: const Text('Remove'),
                                  ),
                                ],
                              ),
                            );
                            return confirm;
                          } else {
                              // Swipe to the left to add or subtract
                              //_showQuantityAdjustmentDialog(product);
                            return false; // Prevent dismissal
                          }
                        },
                        onDismissed: (direction) {
                          //int cartItemQty = cartItems[index]['sellqty'];
                          if (direction == DismissDirection.endToStart) {
                            setState(() {
                              cartItems.removeAt(index);
                            });
                          }
                          else{
                            setState(() {
                              cartItems[index]['sellqty'] += 1;
                            });
                          }
                        },
                        child: Container(
                          margin: const EdgeInsets.symmetric(vertical: 5.0, horizontal: 10.0),
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.grey, width: 1.0),
                            borderRadius: BorderRadius.circular(10.0), 
                            color: Colors.white, 
                          ),
                          child: ListTile(
                              title: Text(product['productName']),
                              subtitle: Text("Price: \$${product['sellingPrice']} - Tax: ${product['tax'].toUpperCase()}"),
                              trailing: IconButton(onPressed: (){}, icon:const Icon(Icons.minimize_outlined)),
                              leading: Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: const Color.fromARGB(255, 14, 19, 29),
                                  borderRadius: BorderRadius.circular(50.0)
                                ),
                                child:  Center(
                                  child:  Text(
                                    product['sellqty'].toString(),
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Colors.white),
                                  ),
                                ),
        
                              ),
                            ),
                        ),
                      );
                    }
                    ),
                ),
                const SizedBox(height: 10,),
                Container(
                  height: 80,
                  decoration: BoxDecoration(
                    color: Colors.blue,
                    borderRadius: BorderRadius.circular(10.0)
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(8.0),
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.start,
                            children: [
                              Text(defaultCurrency != null && selectedPayMethod.isEmpty ? '$defaultCurrency' : returnCurrency() , style:const TextStyle(color: Colors.white , fontWeight: FontWeight.bold , fontSize: 20),),
                              Text(":\$${calculateTotalPrice().toStringAsFixed(2)}" , style:const TextStyle(color: Colors.white , fontWeight: FontWeight.bold , fontSize: 20),),
                            ],
                          ),
                          const SizedBox(width: 20),
                          //Text("\$${calculateTotalPrice().toStringAsFixed(2)}" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.bold , fontSize: 20),),
                          Text("QTY: ${cartItems.length}" , style:const TextStyle(color: Colors.white , fontWeight: FontWeight.bold , fontSize: 20),),
                          const SizedBox(width: 20),
                          //Text("${cartItems.length}" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.bold , fontSize: 20),),
                          Text("Tax: \$${calculateTotalTax().toStringAsFixed(2)}" , style:const TextStyle(color: Colors.white , fontWeight: FontWeight.bold , fontSize: 20),),
                          //Text("\$${calculateTotalTax().toStringAsFixed(2)}" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.bold , fontSize: 20),),
                        ],
                      ),
                    ),
                  ),
                )
              ],
            ),
            )
          ),
      ),
        bottomNavigationBar: BottomAppBar(
        color: Colors.blue.shade900,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            IconButton(
                onPressed: (){

                },
                icon: const Column(
                  children: [
                    Icon(Icons.home, color: Colors.white,),
                    Text(
                        "Home",
                        style: TextStyle(fontSize: 10,color: Colors.white),
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
                showProducts();
              },
              icon: const Column(
                children: [
                  Icon(Icons.list_alt, color: Colors.white),
                  Text(
                    "Products",
                    style: TextStyle(fontSize: 10  ,color: Colors.white),
                  )
                ],
              ),
            ),
            FloatingActionButton(
                onPressed: () async {
                  if(cartItems.isEmpty){
                    await showDialog(
                            context: context,
                            builder: (context) => AlertDialog(
                              title: const Text('Empty Cart'),
                              content: const Text('You did not select any product to complate the sale'),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.of(context).pop(true),
                                  child: const Text('Get Back'),
                                ),
                              ],
                            ),
                          );
                  }
                  else{
                    return showModalBottomSheet(
                      isScrollControlled: true,
                      isDismissible: false,
                      context: context,
                      builder: (context){
                        return Container(
                          height: 600,
                          child: Padding(
                            padding:  EdgeInsets.only(
                              left: 16.0,
                              right: 16.0,
                              top: 16.0,
                              bottom: MediaQuery.of(context).viewInsets.bottom
                            ),
                            child: Form(
                              key: paidKey,
                              child: ListView(
                                scrollDirection: Axis.vertical,
                                  children: [
                                    Center(
                                      child: Container(
                                        height: 5,
                                        width: 100,
                                        decoration: BoxDecoration(
                                          color: kDark,
                                          borderRadius: BorderRadius.circular(20), 
                                        ),
                                      ),
                                    ),
                                    const SizedBox(height: 10,),
                                    Row(
                                      children: [
                                        IconButton(onPressed: (){
                                          Navigator.pop(context);
                                        }, icon:const Icon(Icons.arrow_circle_left_sharp, size: 40, color: kDark,)),
                                        const Text("Customer Details" , style: TextStyle(color: Colors.black,fontSize: 18, fontWeight: FontWeight.w500),),
                                      ],
                                    ),
                                    selectedCustomer.isEmpty?
                                    const Text("Customer: Cash" , style: TextStyle(color: Colors.black , fontWeight: FontWeight.w500 , fontSize: 18),):
                                    Text("Customer: ${ selectedCustomer[0]['tradeName']}" , style:const TextStyle(color: Colors.black , fontWeight: FontWeight.w500 , fontSize: 18),),
                                    const SizedBox(width: 20),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.start,
                                        children: [
                                          Text(defaultCurrency != null && selectedPayMethod.isEmpty ? '$defaultCurrency' : returnCurrency() , style:const TextStyle(color: Colors.black , fontWeight: FontWeight.bold , fontSize: 20),),
                                          Text(":\$${calculateTotalPrice().toStringAsFixed(2)}" , style:const TextStyle(color: Colors.black , fontWeight: FontWeight.bold , fontSize: 20),),
                                        ],
                                    ),
                                    const SizedBox(width: 20),
                                    //Text("\$${calculateTotalPrice().toStringAsFixed(2)}" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.bold , fontSize: 20),),
                                    Text("Items: ${cartItems.length}" , style:const TextStyle(color: Colors.black , fontWeight: FontWeight.w500 , fontSize: 18),),
                                    const SizedBox(width: 20),
                                    //Text("${cartItems.length}" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.bold , fontSize: 20),),
                                    Text("Tax: \$${calculateTotalTax().toStringAsFixed(2)}" , style:const TextStyle(color: Colors.black , fontWeight: FontWeight.w500 , fontSize: 18),),
                                    Container(
                                      height: 150,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(20),
                                        color: kDark,
                                      ),
                                      child: ListView.builder(
                                        itemCount: cartItems.length,
                                        itemBuilder: (context , index){
                                          final product = cartItems[index];
                                          return ListTile(
                                            title: Text(product['productName'] , style: const TextStyle(color: Colors.white),),
                                            subtitle: Text("Price: \$${product['sellingPrice']} - Tax: ${product['tax'].toUpperCase()}", style: const TextStyle(color: Colors.white),),
                                            leading: Container(
                                              width: 40,
                                              height: 40,
                                              decoration: BoxDecoration(
                                                color: Colors.white,
                                                borderRadius: BorderRadius.circular(50.0)
                                              ),
                                              child:  Center(
                                                child:  Text(
                                                  product['sellqty'].toString(),
                                                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: kDark),
                                                ),
                                              ),
                              
                                            ),
                                          );
                                        }
                                      ),
                                    ),
                                    const SizedBox(height: 30,),
                                    Row(
                                      //mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text("Paid", style:const TextStyle(color: Colors.black , fontWeight: FontWeight.w500 , fontSize: 18),),
                                        SizedBox(width: 10,),
                                        Expanded(
                                          child: TextFormField(
                                            inputFormatters: [
                                              FilteringTextInputFormatter.allow(
                                                RegExp(r'^\d*\.?\d*'), // Allows only digits and a single decimal point
                                              ),
                                            ],
                                            controller: paidController,
                                            decoration: InputDecoration(
                                              labelText: 'Amount Paid',
                                              labelStyle: TextStyle(color:Colors.grey.shade600 ),
                                              filled: true,
                                              fillColor: Colors.grey.shade300,
                                              border: OutlineInputBorder(
                                                borderRadius: BorderRadius.circular(12.0),
                                                borderSide: BorderSide.none
                                              )
                                            ),
                                            validator: (value){
                                              if(value!.isEmpty){
                                                return "Amount Required";
                                              }return null;
                                            },
                                          ),
                                        )
                                      ],
                                    ),
                                    const SizedBox(height: 40,),
                                    SizedBox(
                                      width: double.infinity,
                                      child: ElevatedButton(
                                        onPressed: () async {
                                          try {
                                            // Check if the text input is empty
                                            if (paidController.text.isEmpty) {
                                              Get.snackbar(
                                                "Alert",
                                                "Sales cannot complete without amount paid",
                                                icon: Icon(Icons.sd_card_alert),
                                                colorText: Colors.black,
                                                backgroundColor: Colors.amber,
                                              );
                                              return; // Exit the function
                                            }

                                            double paid = double.tryParse(paidController.text) ?? 0.0;
                                            double price = double.parse(calculateTotalPrice().toString());

                                            // Validate the parsed values
                                            if (paid <= 0) {
                                              Get.snackbar(
                                                "Error",
                                                "Invalid amount paid. Please enter a valid number.",
                                                icon: Icon(Icons.error),
                                                colorText: Colors.white,
                                                backgroundColor: Colors.red,
                                              );
                                              return; // Exit the function
                                            }

                                            if (paid < price) {
                                              Get.snackbar(
                                                "Error",
                                                "Amount Paid Is Not Sufficient",
                                                icon: Icon(Icons.error),
                                                colorText: Colors.white,
                                                backgroundColor: Colors.red,
                                              );
                                              return; // Exit the function
                                            }
                                            // Complete the sale if all validations pass
                                            DateTime transactionTime = DateTime.now();
                                            String formattedDate = DateFormat("yyyy-MM-ddTHH:mm:ss").format(transactionTime);
                                            currentDateTime = DateTime.parse(formattedDate);
                                            await addItem();
                                            await generateFiscalJSON();
                                            //generateHash();
                                            await submitReceipt();
                                            await completeSale();
                                            Navigator.pop(context);

                                            } catch (e) {
                                              Get.snackbar(
                                                "Error",
                                                "An error occurred: $e",
                                                icon: Icon(Icons.error),
                                                colorText: Colors.white,
                                                backgroundColor: Colors.red,
                                                snackPosition: SnackPosition.TOP,
                                              );
                                            }
                                        },
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.green,
                                          padding:const EdgeInsets.symmetric(vertical: 16),
                                          shape: RoundedRectangleBorder(
                                            borderRadius: BorderRadius.circular(12.0),
                                          ),
                                        ),
                                        child: const Text(
                                          'Save Sale',
                                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                                        ),
                                      ),
                                    ),
                              
                                  ],
                                            
                              ),
                            ),
                          ),
                        );
                      }
                    );
                  }
                  
                },
                backgroundColor: Colors.green,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                child: const Icon(
                  Icons.done_outline_rounded,
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
                  Icon(Icons.summarize, color: Colors.white),
                  Text(
                    "Reporting",
                    style: TextStyle(fontSize: 10, color: Colors.white),
                  )
                ],
              ),
            ),
            IconButton(
              onPressed: () async {
                await showDialog(
                            context: context,
                            builder: (context) => AlertDialog(
                              title: const Text('Clearing Cart!!'),
                              content: const Text('Are you sure you want to cancel the sale'),
                              actions: [
                                TextButton(
                                  onPressed: () => Navigator.of(context).pop(true),
                                  child: const Text('Get Back'),
                                ),
                                TextButton(
                                  onPressed: (){
                                    setState(() {
                                      cartItems.clear();
                                    });
                                    Navigator.of(context).pop(true);
                                  },
                                  child: const Text('Yes'),
                                ),
                              ],
                            ),
                          );
               // Navigator.pushReplacement(
                 // context,
                 // MaterialPageRoute(builder: (context) => Profile()),
               // );
              },
              icon: const Column(
                children: [
                  Icon(Icons.cancel, color: Colors.red),
                  Text(
                    "Cancel",
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