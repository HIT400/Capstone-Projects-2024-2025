class ReceiptResponse {
  final int receiptID;
  final String receiptServerSignature;
  final int statusCode;
  final String message;

  ReceiptResponse({
    required this.receiptID,
    required this.receiptServerSignature,
    required this.statusCode,
    required this.message,
  });

  factory ReceiptResponse.fromJson(Map<String, dynamic> json, int statusCode) {
    return ReceiptResponse(
      receiptID: json["receiptID"] ?? -1,
      receiptServerSignature: json["receiptServerSignature"] ?? "",
      statusCode: statusCode,
      message: statusCode == 200 ? "Success" : "Error",
    );
  }
}
