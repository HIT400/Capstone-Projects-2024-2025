import 'dart:convert';
import 'dart:io';

class CloseDay {
  static Future<Map<String, dynamic>> submitCloseDay({
    required String apiEndpoint,
    required String deviceModelName,
    required String deviceModelVersion,
    required SecurityContext securityContext,
    required Map<String, dynamic> payload,
  }) async {
    final HttpClient httpClient = HttpClient(context: securityContext);
    httpClient.badCertificateCallback = (X509Certificate cert, String host, int port) => true;

    print("[INFO] Close Day Payload:");
    print(payload);

    try {
      final HttpClientRequest request = await httpClient.postUrl(Uri.parse(apiEndpoint));
      request.headers.contentType = ContentType.json;
      request.headers.add("DeviceModelName", deviceModelName);
      request.headers.add("DeviceModelVersion", deviceModelVersion);
      request.write(jsonEncode(payload));

      final HttpClientResponse response = await request.close();
      final String responseBody = await response.transform(utf8.decoder).join();

      print("[INFO] Close Day response received");
      print("[INFO] Status Code: ${response.statusCode}");
      print("[INFO] Response Body: $responseBody");

      if (response.statusCode == 200) {
        final Map<String, dynamic> jsonResponse = jsonDecode(responseBody);
        return {
          "statusCode": response.statusCode,
          "responseBody": jsonResponse
        };
      } else {
        return {
          "error": "Failed with status code ${response.statusCode}",
          "responseBody": responseBody
        };
      }
    } catch (e) {
      return {
        "error": "Exception occurred: ${e.toString()}"
      };
    } finally {
      httpClient.close();
    }
  }
}
