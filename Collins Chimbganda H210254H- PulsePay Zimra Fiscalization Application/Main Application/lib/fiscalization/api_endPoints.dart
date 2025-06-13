class  ApiEndpoints {
  final String deviceID;

  ApiEndpoints(this.deviceID);

  String get apiEndpointGetConfig =>
      "https://fdmsapitest.zimra.co.zw/Device/v1/$deviceID/GetConfig";

  String get apiEndpointGetStatus =>
      "https://fdmsapitest.zimra.co.zw/Device/v1/$deviceID/GetStatus";

  String get apiEndpointOpenDay =>
      "https://fdmsapitest.zimra.co.zw/Device/v1/$deviceID/OpenDay";

  String get apiEndpointCloseDay =>
      "https://fdmsapitest.zimra.co.zw/Device/v1/$deviceID/CloseDay";

  String get apiEndpointPing =>
      "https://fdmsapitest.zimra.co.zw/Device/v1/$deviceID/Ping";

  String get apiEndpointSubmitReceipt =>
      "https://fdmsapitest.zimra.co.zw/Device/v1/$deviceID/SubmitReceipt";
}