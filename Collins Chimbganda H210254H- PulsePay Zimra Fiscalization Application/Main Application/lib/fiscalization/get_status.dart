import 'dart:convert'; // For JSON handling
import 'dart:io'; // For HttpClient and SSL handling
import 'package:pulsepay/fiscalization/api_endPoints.dart';

class GetStatus {
  static Future<String> getStatus({
    required String apiEndpointGetStatus,
    required String deviceModelName,
    required String deviceModelVersion,
    required SecurityContext securityContext, // Equivalent to SSLContext
  }) async {
    String getStatusServerResponse="";
        //"There was no response from the server. Check your connection!";
    final HttpClient httpClient = HttpClient(context: securityContext);
    httpClient.badCertificateCallback =
        (X509Certificate cert, String host, int port) => true;

    try {
      // Create the HTTP request
      final HttpClientRequest request = await httpClient.getUrl(
        Uri.parse(apiEndpointGetStatus),
      );
      request.headers.contentType = ContentType.json;
      request.headers.add("DeviceModelName", deviceModelName);
      request.headers.add("DeviceModelVersion", deviceModelVersion);

      print("HTTP request GetStatus parameterization successful :)");

      // Send the request and await the response
      final HttpClientResponse response = await request.close();
      final String responseBody = await response.transform(utf8.decoder).join();

      print("Get Status request sent successfully :)");
      print("The returned response body is: $responseBody");

      if (response.statusCode == 200) {
        // Parse the JSON response
        try {
          final jsonResponse = jsonDecode(responseBody);

          final String fiscalDayStatus = jsonResponse["fiscalDayStatus"];
          final String operationID = jsonResponse["operationID"];

          print("fiscalDayStatus: $fiscalDayStatus");
          print("operationID: $operationID");

          getStatusServerResponse =
              "fiscalDayStatus: $fiscalDayStatus\n\n" +
                  "operationID: $operationID";
          
        } catch (e) {
          print("Error parsing response: ${e.toString()}");
        }
      } else {
        print("The server responded with status code: ${response.statusCode}");
        getStatusServerResponse = "The server responded with status code: ${response.statusCode}";
      }
    } catch (e) {
      print("Error occurred during the request: ${e.toString()}");
      print("Probable issue with connection to the server :)");
    }

    return getStatusServerResponse;
  }
}
