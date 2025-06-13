import 'dart:convert';
import 'package:http/http.dart' as http;

class APIService {
  static const String baseUrl = "http://server.troinbit.com:8000"; // Change if needed

  static Future<void> sendReceipt() async {
    final url = Uri.parse("$baseUrl/remote_invoice/");
    final headers = {
      "Content-Type": "application/json",
      "database": "second"
    };

    final Map<String, dynamic> receiptData = {
      "receipt": {
        "receiptLines": [
          {
            "receiptLineNo": "1",
            "receiptLineHSCode": "99002000",
            "receiptLinePrice": "2.0",
            "taxID": 2,
            "taxPercent": "0",
            "receiptLineType": "Sale",
            "receiptLineQuantity": "2",
            "taxCode": "B",
            "receiptLineTotal": 4.0,
            "receiptLineName": "New",
            "receiptLineProductCode": "1232"
          },
          {
            "receiptLineNo": "2",
            "receiptLineHSCode": "99002000",
            "receiptLinePrice": "2.0",
            "taxID": 3,
            "taxPercent": "15.0",
            "receiptLineType": "Sale",
            "receiptLineQuantity": "2",
            "taxCode": "C",
            "receiptLineTotal": 4.0,
            "receiptLineName": "New",
            "receiptLineProductCode": "1234"
          },
          {
            "receiptLineNo": "3",
            "receiptLineHSCode": "99002000",
            "receiptLinePrice": "2.0",
            "taxID": 1,
            "receiptLineType": "Sale",
            "receiptLineQuantity": "2",
            "taxCode": "A",
            "receiptLineTotal": 4.0,
            "receiptLineName": "New",
            "receiptLineProductCode": "1235"
          }
        ],
        "receiptType": "FISCALINVOICE",
        "receiptCurrency": "USD",
        "receiptPrintForm": "Receipt48",
        "receiptDate": "2025-04-14T12:41:21",
        "receiptPayments": [
          {"moneyTypeCode": "Cash", "paymentAmount": "12.0"}
        ],
        "buyerData": {
          "VATNumber": "220000000",
          "buyerTradeName": "Chifen",
          "buyerTIN": "1000000000",
          "buyerRegisterName": "Chifen"
        },
        "receiptLinesTaxInclusive": true,
        "invoiceNo": "IN6767",
      }
    };

    try {
      final response = await http.post(url, headers: headers, body: jsonEncode(receiptData));
      if (response.statusCode == 200) {
        print("Receipt sent successfully: ${response.body}");
      } else {
        print("Failed to send receipt: ${response.statusCode} - ${response.body}");
      }
    } catch (e) {
      print("Error sending receipt: $e");
    }
  }

  static Future<void> sendCredit() async {
    final url = Uri.parse("$baseUrl/remote_credit/");
    final headers = {
      "Content-Type": "application/json",
      "database": "second"
    };

    final Map<String, dynamic> creditData = {
      "invoiceNo": "CR1209",
      "reason": "reason",
      "reference": "IN1209"
    };

    try {
      final response = await http.post(url, headers: headers, body: jsonEncode(creditData));
      if (response.statusCode == 200) {
        print("Credit sent successfully: ${response.body}");
      } else {
        print("Failed to send credit: ${response.statusCode} - ${response.body}");
      }
    } catch (e) {
      print("Error sending credit: $e");
    }
  }

  static Future<void> getStatus() async {
    final url = Uri.parse("$baseUrl/getstatus/");
    final headers = {
      "Content-Type": "application/json",
      "database": "troinverse"
    };

    try {
      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        print("Status: ${response.body}");
      } else {
        print("Failed to get status: ${response.statusCode}");
      }
    } catch (e) {
      print("Error getting status: $e");
    }
  }

  static Future<void> getConfig() async {
    final url = Uri.parse("$baseUrl/getconfig/");
    final headers = {
      "Content-Type": "application/json",
      "database": "troinverse"
    };

    try {
      final response = await http.get(url, headers: headers);
      if (response.statusCode == 200) {
        print("Config: ${response.body}");
      } else {
        print("Failed to get config: ${response.statusCode}");
      }
    } catch (e) {
      print("Error getting config: $e");
    }
  }

  static Future<void> openDay() async {
    final url = Uri.parse("$baseUrl/openday/");
    final headers = {
      "Content-Type": "application/json",
      "database": "troinverse"
    };

    try {
      final response = await http.get(url, headers: headers);
      print("Open Day: ${response.body}");
    } catch (e) {
      print("Error opening day: $e");
    }
  }

  static Future<void> closeDay() async {
    final url = Uri.parse("$baseUrl/closeday/");
    final headers = {
      "Content-Type": "application/json",
      "database": "troinverse"
    };

    try {
      final response = await http.post(url, headers: headers);
      print("Close Day: ${response.body}");
    } catch (e) {
      print("Error closing day: $e");
    }
  }

  static Future<void> registerDevice() async {
    final url = Uri.parse("$baseUrl/create_certificates/");
    final headers = {
      "Content-Type": "application/json",
      "database": "troinverse"
    };

    try {
      final response = await http.post(url, headers: headers);
      print("Register Device: ${response.body}");
    } catch (e) {
      print("Error registering device: $e");
    }
  }
}
