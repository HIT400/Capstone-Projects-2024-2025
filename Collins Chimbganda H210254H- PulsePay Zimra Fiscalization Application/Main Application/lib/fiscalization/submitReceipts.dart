import 'dart:convert';
import 'dart:io';

import 'package:pulsepay/fiscalization/receiptResponse.dart';

class SubmitReceipts {
  static Future<Map<String, dynamic>> submitReceipts({
    required String apiEndpointSubmitReceipt,
    required String deviceModelName,
    required String deviceModelVersion,
    required SecurityContext securityContext,
    required String receiptjsonBody,
  }) async {
    String responseMessage = "No response from the server. Check your connection!";
    final Map<String, dynamic> jsonResponse;
    final HttpClient httpClient = HttpClient(context: securityContext);
    httpClient.badCertificateCallback = (X509Certificate cert, String host, int port) => true;

    try {
      // Create HTTP request
      final HttpClientRequest request = await httpClient.postUrl(Uri.parse(apiEndpointSubmitReceipt));
      request.headers.contentType = ContentType.json;
      request.headers.add("DeviceModelName", deviceModelName);
      request.headers.add("DeviceModelVersion", deviceModelVersion);
      
      // Write the actual receipt JSON body
      request.write(receiptjsonBody);

      // Log request details
      print("[INFO] Sending receipt to $apiEndpointSubmitReceipt");
      print("[INFO] Headers: ${request.headers}");
      print("[INFO] Request Body: $receiptjsonBody");

      // Send request & await response
      final HttpClientResponse response = await request.close();
      final String responseBody = await response.transform(utf8.decoder).join();

      // Log response details
      print("[INFO] Receipt submission response received");
      print("[INFO] Status Code: ${response.statusCode}");
      print("[INFO] Response Body: $responseBody");

      if (response.statusCode == 200) {
        // // Parse JSON response
        jsonResponse = jsonDecode(responseBody);

        if (jsonResponse.containsKey("receiptID") && jsonResponse.containsKey("receiptServerSignature")) {
          int receiptID = jsonResponse["receiptID"];
          String receiptServerSignature = jsonResponse["receiptServerSignature"].toString();

          print("[SUCCESS] Receipt submitted successfully!");
          print("[INFO] Receipt ID: $receiptID");
          print("[INFO] Receipt Server Signature: $receiptServerSignature");

          responseMessage = "Receipt submitted successfully.\nStatus Code: ${response.statusCode}";
        } else {
          print("[WARNING] Receipt submission was successful but missing required fields.");
        }
        return {
        "statusCode": response.statusCode,
        "responseBody": responseBody,
        };
          // final Map<String, dynamic> jsonResponse = jsonDecode(responseBody);
          // if (jsonResponse.containsKey("receiptID") && jsonResponse.containsKey("receiptServerSignature")) {
          //   return ReceiptResponse.fromJson(jsonResponse, response.statusCode);
          // }
      } else {
        responseMessage = "Error: Received status code ${response.statusCode}\nResponse Body: $responseBody";
        print("[ERROR] Receipt submission failed with status ${response.statusCode}");
        return {"error": "Failed with status code ${response.statusCode}", "responseBody": responseBody};
        // return ReceiptResponse(
        //   receiptID: -1,
        //   receiptServerSignature: "",
        //   statusCode: response.statusCode,
        //   message: "Failed to submit receipt. Status Code: ${response.statusCode}",
        // );
      }
    } catch (e) {
      print("[ERROR] Exception during receipt submission: ${e.toString()}");
      print("[ERROR] Probable issue with server connection.");
      return {"error": "Exception occurred: ${e.toString()}"};
    } finally {
      httpClient.close();
    }
  }
  /// ✅ SQLite Update Function - Updates OpenDay Table in Fiscalization DB
//   static Future<void> _updateOpenDayStatus(String status) async {
//     try {
//       final String dbPath = "C:/Fiscal/Configurations/fiscalization.db";
//       final conn = await Sqlite.open(dbPath);

//       final String query = "UPDATE OpenDay SET StatusofFirstReceipt = ? WHERE id = (SELECT id FROM OpenDay ORDER BY id DESC LIMIT 1)";
//       final preparedStatement = await conn.prepare(query);
//       await preparedStatement.execute([status]);

//       print("[DB UPDATE] OpenDay Status updated to: $status");
//       await conn.close();
//     } catch (e) {
//       print("[DB ERROR] Failed to update OpenDay status: ${e.toString()}");
//     }
//   }
}
