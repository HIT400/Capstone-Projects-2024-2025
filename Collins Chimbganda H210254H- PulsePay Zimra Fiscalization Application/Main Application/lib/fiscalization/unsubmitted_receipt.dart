class UnsubmittedReceipt {
  int receiptGlobalNo;
  String jsonBody;

  UnsubmittedReceipt({required this.receiptGlobalNo, required this.jsonBody});

  factory UnsubmittedReceipt.fromMap(Map<String, dynamic> map) {
    return UnsubmittedReceipt(
      receiptGlobalNo: map["receiptGlobalNo"],
      jsonBody: map["receiptJsonBody"],
    );
  }

  String getReceiptJsonBody() {
    return jsonBody;
  }
}