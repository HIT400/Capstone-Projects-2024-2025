// To parse this JSON data, do
//
//     final users = usersFromMap(jsonString);

import 'dart:ffi';

import 'package:flutter/material.dart';
//import 'package:meta/meta.dart';
import 'dart:convert';

import 'package:flutter/services.dart';

Users usersFromMap(String str) => Users.fromMap(json.decode(str));

String usersToMap(Users data) => json.encode(data.toMap());

class Users {
  final int? userId;
  final String? realName;
  final String userName;
  final String userPassword;
  final String? DateCreated;
  final int? isAdmin;
  final int? isCashier;
  final int? isActive;


  Users({
    this.userId,
    this.realName,
    required this.userName,
    required this.userPassword,
    this.DateCreated,
    this.isAdmin,
    this.isCashier,
    this.isActive
  });

  factory Users.fromMap(Map<String, dynamic> json) => Users(
    userId: json["userID"],
    realName: json["realName"],
    userName: json["userName"],
    userPassword: json["userPassword"],
    DateCreated: json["dateCreated"],
    isAdmin: json["isAdmin"],
    isCashier: json["isCashier"],
    isActive: json["isActive"]
  );

  Map<String, dynamic> toMap() => {
    "userID": userId,
    "realName": realName,
    "userName": userName,
    "userPassword": userPassword,
    "dateCreated": DateCreated,
    "isAdmin": isAdmin,
    "isCashier": isCashier,
    "isActive": isActive
  };
}

// To parse this JSON data, do
//
//     final users = usersFromMap(jsonString);


Products productsFromMap(String str) => Products.fromMap(json.decode(str));

String productsToMap(Products data) => json.encode(data.toMap());

class Products {
  final int? productid;
  final String productName;
  final String barcode;
  final int hsCode;
  final double costPrice;
  final double sellingPrice;
  final String tax;
  final int stockQty;

  Products({
    this.productid,
    required this.productName,
    required this.barcode,
    required this.hsCode,
    required this.costPrice,
    required this.sellingPrice,
    required this.tax,
    required this.stockQty
  });

  factory Products.fromMap(Map<String, dynamic> json) => Products(
    productid: json["productid"],
    productName: json["productName"],
    barcode: json["barcode"],
    hsCode: json["hsCode"],
    costPrice: json["costPrice"],
    sellingPrice: json["sellingPrice"],
    tax: json["tax"],
    stockQty: json["stockQty"]
  );

  Map<String, dynamic> toMap() => {
    "productid": productid,
    "productName": productName,
    "barcode": barcode,
    "hsCode": hsCode,
    "costPrice": costPrice,
    "sellingPrice": sellingPrice,
    "tax": tax,
    "stockQty": stockQty
  };
}

// To parse this JSON data, do
//
//     final users = usersFromMap(jsonString);


Invoices invoicesFromMap(String str) => Invoices.fromMap(json.decode(str));

String invoicesToMap(Invoices data) => json.encode(data.toMap());

class Invoices {
  final int? invoiceId;
  final Text date;
  final double totalAmount;
  final double totalTax;

  Invoices({
    this.invoiceId,
    required this.date,
    required this.totalAmount,
    required this.totalTax,
  });

  factory Invoices.fromMap(Map<String, dynamic> json) => Invoices(
    invoiceId: json["invoiceId"],
    date: json["date"],
    totalAmount: json["totalAmount"],
    totalTax: json["totalTax"],
  );

  Map<String, dynamic> toMap() => {
    "invoiceId": invoiceId,
    "date": date,
    "totalAmount": totalAmount,
    "totalTax": totalTax,
  };
}


// To parse this JSON data, do
//
//     final users = usersFromMap(jsonString);


Sales salesFromMap(String str) => Sales.fromMap(json.decode(str));

String salesToMap(Sales data) => json.encode(data.toMap());

class Sales {
  final int? saleId;
  final int invoiceId;
  final int? customerID;
  final int productId;
  final int quantity;
  final double sellingPrice;
  final double tax;

  Sales({
    this.saleId,
    required this.invoiceId,
    this.customerID,
    required this.productId,
    required this.quantity,
    required this.sellingPrice,
    required this.tax
  });

  factory Sales.fromMap(Map<String, dynamic> json) => Sales(
    saleId: json["salesId"],
    invoiceId: json["invoiceId"],
    customerID: json["customerID"],
    productId: json["productId"],
    quantity: json["quantity"],
    sellingPrice: json["sellingPrice"],
    tax: json["tax"]
  );

  Map<String, dynamic> toMap() => {
    "salesId": saleId,
    "invoiceId": invoiceId,
    "customerID": customerID,
    "productId": productId,
    "quantity": quantity,
    "sellingPrice":sellingPrice,
    "tax":tax,
  };
}


///CustomerDetailsModel//////
///////////////////////////////////////////////////////
Customer customerFromMap(String str) => Customer.fromMap(json.decode(str));

String customerToMap(Customer data) => json.encode(data.toMap());

class Customer {
  final int? customerID;
  final String tradeName;
  final int tinNumber;
  final int vatNumber;
  final String address;
  final String email;

  Customer({
    this.customerID,
    required this.tradeName,
    required this.tinNumber,
    required this.vatNumber,
    required this.address,
    required this.email
  });

  factory Customer.fromMap(Map<String, dynamic> json) => Customer(
    customerID: json["customerID"],
    tradeName: json["tradeName"],
    tinNumber: json["tinNumber"],
    vatNumber: json["vatNumber"],
    address: json["address"],
    email: json["email"]
  );

  Map<String, dynamic> toMap() => {
    "customerID": customerID,
    "tradeName": tradeName,
    "tinNumber": tinNumber,
    "vatNumber": vatNumber,
    "address": address,
    "email": email,
  };
}

///CustomerDetailsModel//////
///////////////////////////////////////////////////////
StockPurchase stockPurchaseFromMap(String str) => StockPurchase.fromMap(json.decode(str));

String stockPurchaseToMap(StockPurchase data) => json.encode(data.toMap());

class StockPurchase {
  final int? purchaseId;
  final String date;
  final int productid;
  final int quantity;
  final String payMethod;
  final String supplier;

  StockPurchase({
    this.purchaseId,
    required this.date,
    required this.productid,
    required this.quantity,
    required this.payMethod,
    required this.supplier
  });

  factory StockPurchase.fromMap(Map<String, dynamic> json) => StockPurchase(
    purchaseId: json["purchaseId"],
    date: json["date"],
    productid: json["productid"],
    quantity: json["quantity"],
    payMethod: json["payMethod"],
    supplier: json["supplier"]
  );

  Map<String, dynamic> toMap() => {
    "purchaseId": purchaseId,
    "date": date,
    "productid": productid,
    "quantity": quantity,
    "payMethod": payMethod,
    "supplier": supplier,
  };
}


///Payment methods//////
///////////////////////////////////////////////////////
PaymentMethod paymentMethodFromMap(String str) => PaymentMethod.fromMap(json.decode(str));

String paymentMethodToMap(PaymentMethod data) => json.encode(data.toMap());

class PaymentMethod{
  final int? payMethodId;
  final String description;
  final double rate;
  final int fiscalGroup;
  final String currency;
  final String? vatNumber;
  final String? tinNumber;

  PaymentMethod({
    this.payMethodId,
    required this.description,
    required this.rate,
    required this.fiscalGroup,
    required this.currency,
    this.vatNumber,
    this.tinNumber
  });

  factory PaymentMethod.fromMap(Map<String, dynamic> json) => PaymentMethod(
    payMethodId: json["payMethodId"],
    description: json["description"],
    rate: json["rate"],
    fiscalGroup: json["fiscalGroup"],
    currency: json["currency"],
    vatNumber: json["vatNumber"],
    tinNumber: json["tinNumber"]
  );

  Map<String, dynamic> toMap() => {
    "payMethodId": payMethodId,
    "description": description,
    "rate": rate,
    "fiscalGroup": fiscalGroup,
    "currency": currency,
    "vatNumber": vatNumber,
    "tinNumber": tinNumber
  };
}

///Receipt Anomallies//////
///////////////////////////////////////////////////////
Anomaly anomalyFromMap(String str) => Anomaly.fromMap(json.decode(str));

String anomalyToMap(Anomaly data) => json.encode(data.toMap());

class Anomaly{
  final int? id;
  final int receiptGlobalNo;
  final int isAnomaly;
  final double score;
  final double receiptTotal;
  final double taxAmount;
  final double salesAmountwithTax;
  final String taxPercent;

  Anomaly({
    this.id,
    required this.receiptGlobalNo,
    required this.isAnomaly,
    required this.score,
    required this.receiptTotal,
    required this.taxAmount,
    required this.salesAmountwithTax,
    required this.taxPercent
  });

  factory Anomaly.fromMap(Map<String, dynamic> json) => Anomaly(
    id: json["anomallyId"],
    receiptGlobalNo: json["receiptGlobalNo"],
    isAnomaly: json["isAnomaly"],
    score: json["score"],
    receiptTotal: json["receiptTotal"],
    taxAmount: json["taxAmount"],
    salesAmountwithTax: json["salesAmountWithTax"],
    taxPercent: json["taxPercent"]
  );

  Map<String, dynamic> toMap() => {
    "anomallyId": id,
    "receiptGlobalNo": receiptGlobalNo,
    "isAnomaly": isAnomaly,
    "score": score,
    "receiptTotal": receiptTotal,
    "taxAmount": taxAmount,
    "salesAmountWithTax": salesAmountwithTax,
    "taxPercent": taxPercent
  };
}


///CreditNote//////
///////////////////////////////////////////////////////
CreditNote creditNoteFromMap(String str) => CreditNote.fromMap(json.decode(str));

String creditNoteToMap(CreditNote data) => json.encode(data.toMap());

class CreditNote{
  final int? id;
  final String receiptGlobalNo;
  final String receiptID;
  final String receiptDate;
  final double receiptTotal;
  final String receiptNotes;
  final String creditNoteNumber;

  CreditNote({
    this.id,
    required this.receiptGlobalNo,
    required this.receiptID,
    required this.receiptDate,
    required this.receiptTotal,
    required this.receiptNotes,
    required this.creditNoteNumber
  });

  factory CreditNote.fromMap(Map<String, dynamic> json) => CreditNote(
    id: json["id"],
    receiptGlobalNo: json["receiptGlobalNo"],
    receiptID: json["receiptID"],
    receiptDate: json["receiptDate"],
    receiptTotal: json["receiptTotal"],
    receiptNotes: json["receiptNotes"],
    creditNoteNumber: json["creditNoteNumber"]
  );

  Map<String, dynamic> toMap() => {
    "id": id,
    "receiptGlobalNo": receiptGlobalNo,
    "receiptID": receiptID,
    "receiptDate": receiptDate,
    "receiptTotal": receiptTotal,
    "receiptNotes": receiptNotes,
    "creditNoteNumber": creditNoteNumber
  };
}

///Company DetailsModel//////
///////////////////////////////////////////////////////
CompanyDetails companyDetailsFromMap(String str) => CompanyDetails.fromMap(json.decode(str));

String companyDetailsToMap(CompanyDetails data) => json.encode(data.toMap());

class CompanyDetails{
  final int? companyID;
  final String company;
  final String? logo;
  final String? address;
  final String? tel;
  final String branchName;
  final String? tel2;
  final String? email;
  final String tinNumber;
  final String vatNumber;
  final String? vendorNumber;
  final String? website;
  final String? bank;
  final String? bankBranch;
  final String? bankAcntName;
  final String? bankAcntNo;
  final String baseCurreny;
  final String? backUpLocation;
  final String baseTaxPercentage;

  CompanyDetails({
    this.companyID,
    required this.company,
    this.logo,
    this.address,
    this.tel,
    required this.branchName,
    this.tel2,
    this.email,
    required this.tinNumber,
    required this.vatNumber,
    this.vendorNumber,
    this.website,
    this.bank,
    this.bankBranch,
    this.bankAcntName,
    this.bankAcntNo,
    required this.baseCurreny,
    this.backUpLocation,
    required this.baseTaxPercentage
  });

  factory CompanyDetails.fromMap(Map<String, dynamic> json) => CompanyDetails(
    companyID: json["companyID"],
    company: json["company"],
    logo: json["logo"],
    address: json["address"],
    tel: json["tel"],
    branchName: json["branchName"],
    tel2: json["tel2"],
    email: json["email"],
    tinNumber: json["tinNumber"],
    vatNumber: json["vatNumber"],
    vendorNumber: json["vendorNumber"],
    website: json["website"],
    bank: json["bank"],
    bankBranch: json["bankBranch"],
    bankAcntName: json["bankAcntName"],
    bankAcntNo: json["bankAcntNo"],
    baseCurreny: json["baseCurreny"],
    backUpLocation: json["backUpLocation"],
    baseTaxPercentage: json["baseTaxPercentage"],
  );

  Map<String, dynamic> toMap() => {
    "companyID": companyID,
    "company": company,
    "logo": logo,
    "address": address,
    "tel": tel,
    "branchName": branchName,
    "tel2": tel2,
    "email": email,
    "tinNumber": tinNumber,
    "vatNumber": vatNumber,
    "vendorNumber": vendorNumber,
    "website": website,
    "bank": bank,
    "bankBranch": bankBranch,
    "bankAcntName": bankAcntName,
    "bankAcntNo": bankAcntNo,
    "baseCurreny": baseCurreny,
    "backUpLocation": backUpLocation,
    "baseTaxPercentage": baseTaxPercentage,
  };
}

///CustomerDetailsModel//////
///////////////////////////////////////////////////////
OpenDay openDayMethodFromMap(String str) => OpenDay.fromMap(json.decode(str));

String openDayMethodToMap(OpenDay data) => json.encode(data.toMap());

class OpenDay{
  final int? ID;
  final int? FiscalDayNo;
  final String? StatusOfFirstReceipt;
  final String? FiscalDayOpened;
  final String? FiscalDayClosed;
  final int? TaxExempt;
  final int? TaxZero;
  final int? Tax15;
  final int?TaxWT;

  OpenDay({
    this.ID,
    this.FiscalDayNo,
    this.StatusOfFirstReceipt,
    this.FiscalDayOpened,
    this.FiscalDayClosed,
    this.TaxExempt,
    this.TaxZero,
    this.Tax15,
    this.TaxWT

  });

  factory OpenDay.fromMap(Map<String, dynamic> json) => OpenDay(
    ID: json["ID"],
    FiscalDayNo: json["FiscalDayNo"],
    StatusOfFirstReceipt: json["StatusOfFirstReceipt"],
    FiscalDayOpened: json["FiscalDayOpened"],
    FiscalDayClosed: json["FiscalDayClosed"],
    TaxExempt: json["TaxExempt"],
    TaxZero: json["TaxZero"],
    Tax15:json['Tax15'] ,
    TaxWT: json['TaxWT'],
  );

  Map<String, dynamic> toMap() => {
    "ID": ID,
    "FiscalDayNo": FiscalDayNo,
    "StatusOfFirstReceipt": StatusOfFirstReceipt,
    "FiscalDayOpened": FiscalDayOpened,
    "FiscalDayClosed": FiscalDayClosed,
    "TaxExempt": TaxExempt,
    "TaxZero": TaxZero,
    "Tax15":Tax15,
    "TaxWT": TaxWT
  };
}

// To parse this JSON data, do
//
//     final submittedReceipt = submittedReceiptFromMap(jsonString);

SubmittedReceipt submittedReceiptFromMap(String str) => SubmittedReceipt.fromMap(json.decode(str));

String submittedReceiptToMap(SubmittedReceipt data) => json.encode(data.toMap());

class SubmittedReceipt {
    final int? receiptGlobalNo;
    final int receiptCounter;
    final int fiscalDayNo;
    final int invoiceNo;
    final int? receiptId;
    final String receiptType;
    final String receiptCurrency;
    final String moneyType;
    final String receiptDate;
    final String receiptTime;
    final double receiptTotal;
    final String taxCode;
    final String taxPercent;
    final double taxAmount;
    final double salesAmountwithTax;
    final String receiptHash;
    final String receiptJsonbody;
    final String StatustoFdms;
    final String qrurl;
    final String? receiptServerSignature;
    final String? submitReceiptServerresponseJson;
    final double total15Vat;
    final double totalNonVat;
    final double totalExempt;
    final double totalWt;

    SubmittedReceipt({
        this.receiptGlobalNo,
        required this.receiptCounter,
        required this.fiscalDayNo,
        required this.invoiceNo,
        this.receiptId,
        required this.receiptType,
        required this.receiptCurrency,
        required this.moneyType,
        required this.receiptDate,
        required this.receiptTime,
        required this.receiptTotal,
        required this.taxCode,
        required this.taxPercent,
        required this.taxAmount,
        required this.salesAmountwithTax,
        required this.receiptHash,
        required this.receiptJsonbody,
        required this.StatustoFdms,
        required this.qrurl,
        this.receiptServerSignature,
        this.submitReceiptServerresponseJson,
        required this.total15Vat,
        required this.totalNonVat,
        required this.totalExempt,
        required this.totalWt,
    });

    factory SubmittedReceipt.fromMap(Map<String, dynamic> json) => SubmittedReceipt(
        receiptGlobalNo: json["receiptGlobalNo"],
        receiptCounter: json["receiptCounter"],
        fiscalDayNo: json["FiscalDayNo"],
        invoiceNo: json["InvoiceNo"],
        receiptId: json["receiptID"],
        receiptType: json["receiptType"],
        receiptCurrency: json["receiptCurrency"],
        moneyType: json["moneyType"],
        receiptDate: DateTime.parse(json["receiptDate"]).toString(),
        receiptTime: json["receiptTime"],
        receiptTotal: json["receiptTotal"].toDouble(),
        taxCode: json["taxCode"],
        taxPercent: json["taxPercent"],
        taxAmount: json["taxAmount"].toDouble(),
        salesAmountwithTax: json["SalesAmountwithTax"].toDouble(),
        receiptHash: json["receiptHash"],
        receiptJsonbody: json["receiptJsonbody"],
        StatustoFdms: json["StatustoFDMS"],
        qrurl: json["qrurl"],
        receiptServerSignature: json["receiptServerSignature"],
        submitReceiptServerresponseJson: json["submitReceiptServerresponseJSON"],
        total15Vat: json["Total15VAT"],
        totalNonVat: json["TotalNonVAT"],
        totalExempt: json["TotalExempt"],
        totalWt: json["TotalWT"],
    );

    Map<String, dynamic> toMap() => {
        "receiptGlobalNo": receiptGlobalNo,
        "receiptCounter": receiptCounter,
        "FiscalDayNo": fiscalDayNo,
        "InvoiceNo": invoiceNo,
        "receiptID": receiptId,
        "receiptType": receiptType,
        "receiptCurrency": receiptCurrency,
        "moneyType": moneyType,
        "receiptDate": receiptDate,
        "receiptTime": receiptTime,
        "receiptTotal": receiptTotal,
        "taxCode": taxCode,
        "taxPercent": taxPercent,
        "taxAmount": taxAmount,
        "SalesAmountwithTax": salesAmountwithTax,
        "receiptHash": receiptHash,
        "receiptJsonbody": receiptJsonbody,
        "StatustoFDMS": StatustoFdms,
        "qrurl": qrurl,
        "receiptServerSignature": receiptServerSignature,
        "submitReceiptServerresponseJSON": submitReceiptServerresponseJson,
        "Total15VAT": total15Vat,
        "TotalNonVAT": totalNonVat,
        "TotalExempt": totalExempt,
        "TotalWT": totalWt,
    };
}
