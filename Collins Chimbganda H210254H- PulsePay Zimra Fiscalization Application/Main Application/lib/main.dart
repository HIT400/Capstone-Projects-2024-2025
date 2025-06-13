import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:pulsepay/authentication/login.dart';
//import 'package:flutter_screenutil/flutter_screenutil.dart';

void main() {
  runApp(const GetMaterialApp(
    home: MyApp(),
    debugShowCheckedModeBanner: false,
  ));
}

const MethodChannel _channel = MethodChannel('flutter/kotlin');

Future<Map<String, String>> signData(String filePath, String password, String data) async {
  try {
    final Map<String, String> signedDataMap = Map<String, String>.from(await _channel.invokeMethod('signData', {
      'filePath': filePath,
      'password': password,
      'data': data,
    }));

    return signedDataMap;
  } on PlatformException catch (e) {
    print(e.message);
    return {
      "error": "Error: ${e.message}",
    };
  }
}

Future<void> verifySignatureAndShowResult(
  BuildContext context,
  String filePath,
  String password,
  String data,
  String base64Signature,
) async {
  const platform = MethodChannel('flutter/kotlin');

  try {
    final result = await platform.invokeMethod('verifySignature', {
      'filePath': filePath,
      'password': password,
      'data': data,
      'signature': base64Signature,
    });

    final isValid = result == true;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          isValid ? '✅ Signature is valid' : '❌ Signature is invalid',
        ),
        backgroundColor: isValid ? Colors.green : Colors.red,
        duration: const Duration(seconds: 3),
      ),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('⚠️ Error verifying signature'),
        backgroundColor: Colors.orange,
        duration: Duration(seconds: 3),
      ),
    );
  }
}

Future<void> verifySignatureAndShowResult2(
  BuildContext context,
  String filePath,
  String password,
  String localHash,
  String base64Signature,
)async{
  const platform = MethodChannel('flutter/kotlin');

  try {
    final String? decryptedHash = await platform.invokeMethod('decryptSignatureToHash', {
      'filePath': filePath,
      'password': password,
      //'data': data,
      'signature': base64Signature,
    });

    final isValid = decryptedHash?.toLowerCase() == localHash.toLowerCase();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          isValid ? '✅ Signature is valid' : '❌ Signature is invalid',
        ),
        backgroundColor: isValid ? Colors.green : Colors.red,
        duration: const Duration(seconds: 3),
      ),
    );
  } catch (e) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('⚠️ Error verifying signature'),
        backgroundColor: Colors.orange,
        duration: Duration(seconds: 3),
      ),
    );
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Pulse Pay',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: const Color.fromARGB(255, 243, 243, 243)),
        useMaterial3: true,
      ),
      home: const Login(),
    );
  }
}