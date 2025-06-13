// package com.example.pulsepay
// import org.bouncycastle.jce.provider.BouncyCastleProvider
// import android.os.Bundle
// import java.security.Security
// import android.util.Base64
// import io.flutter.embedding.android.FlutterActivity
// import io.flutter.embedding.engine.FlutterEngine
// import io.flutter.plugin.common.MethodCall
// import io.flutter.plugin.common.MethodChannel
// import java.io.FileInputStream
// import java.security.KeyFactory
// import java.security.KeyStore
// import java.security.PrivateKey
// import java.security.Signature
// import java.security.spec.PKCS8EncodedKeySpec

// class MainActivity : FlutterActivity() {
//     private val CHANNEL = "flutter/kotlin"

//     override fun onCreate(savedInstanceState: Bundle?) {
//         super.onCreate(savedInstanceState)
//         ensureBouncyCastleProvider()
//     }
//     private fun ensureBouncyCastleProvider() {
//         val provider = Security.getProvider("BC")
//         if (provider == null) {
//             Security.addProvider(BouncyCastleProvider())  // Add BouncyCastle if not present
//         } else {
//             Security.removeProvider("BC")
//             Security.addProvider(BouncyCastleProvider())  // Refresh provider
//         }
//     }

//     override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
//         super.configureFlutterEngine(flutterEngine)
//         MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
//             when (call.method) {
//                 "signData" -> {
//                     val filePath: String? = call.argument("filePath")
//                     val password: String? = call.argument("password")
//                     val data: String? = call.argument("data")
//                     if (filePath != null && password != null && data != null) {
//                         val signedData = signData(filePath, password, data)
//                         result.success(signedData)
//                     } else {
//                         result.error("INVALID_ARGS", "File path, password, or data is null", null)
//                     }
//                 }
//                 else -> result.notImplemented()
//             }
//         }
//     }

//     private fun signData(filePath: String, password: String, data: String): String {
//         return try {
//             // Load the PKCS#12 keystore
//             val fis = FileInputStream(filePath)
//             val keystore = KeyStore.getInstance("PKCS12" ,"BC")
//             keystore.load(fis, password.toCharArray())

//             // Extract the private key (assuming the first alias contains it)
//             val alias = keystore.aliases().nextElement()
//             val privateKey = keystore.getKey(alias, password.toCharArray()) as PrivateKey

//             // Sign data using SHA256withRSA
//             val signature = Signature.getInstance("SHA256withRSA")
//             signature.initSign(privateKey)
//             signature.update(data.toByteArray(Charsets.UTF_8))
//             val signedBytes = signature.sign()

//             val md = MessageDigest.getInstance("MD5")
//             val digest = md.digest(signedBytes)
//             val hexString = digest.joinToString("") { "%02x".format(it) }
//             // Convert signed bytes to Base64 for easy transmission
//             //Base64.encodeToString(signedBytes, Base64.NO_WRAP)
//             mapOf(
//             "receiptDeviceSignature_signature_hex" to hexString,
//             "receiptDeviceSignature_signature" to Base64.encodeToString(signedBytes, Base64.NO_WRAP)
//             )
//         } catch (e: Exception) {
//             return "Error: ${e.message}"
//             //println("Error: ${e.message}")
//         }
//     }
// }

//second code////////

package com.example.pulsepay

import org.bouncycastle.jce.provider.BouncyCastleProvider
import android.os.Bundle
import java.security.Security
import java.security.MessageDigest
import android.util.Base64
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import java.io.FileInputStream
import java.security.KeyFactory
import java.security.KeyStore
import java.security.PrivateKey
import java.security.Signature
import java.security.spec.PKCS8EncodedKeySpec
import java.security.cert.X509Certificate
import java.security.interfaces.RSAPublicKey
import javax.crypto.Cipher

class MainActivity : FlutterActivity() {
    private val CHANNEL = "flutter/kotlin"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        ensureBouncyCastleProvider()
    }

    private fun ensureBouncyCastleProvider() {
        val provider = Security.getProvider("BC")
        if (provider == null) {
            Security.addProvider(BouncyCastleProvider())  // Add BouncyCastle if not present
        } else {
            Security.removeProvider("BC")
            Security.addProvider(BouncyCastleProvider())  // Refresh provider
        }
    }

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
            when (call.method) {
                "signData" -> {
                    val filePath: String? = call.argument("filePath")
                    val password: String? = call.argument("password")
                    val data: String? = call.argument("data")
                    if (filePath != null && password != null && data != null) {
                        val signedData: Map<String, String> = signData(filePath, password, data)
                        result.success(signedData) // ✅ Correct return type
                    } else {
                        result.error("INVALID_ARGS", "File path, password, or data is null", null)
                    }
                }

                "verifySignature" -> {
                    val filePath: String? = call.argument("filePath")
                    val password: String? = call.argument("password")
                    val data: String? = call.argument("data")
                    val signature: String? = call.argument("signature")
                    if (filePath != null && password != null && data != null && signature != null) {
                        val isValid: Boolean = verifySignature(filePath, password, data, signature)
                        result.success(isValid)
                    } else {
                        result.error("INVALID_ARGS", "File path, password, data, or signature is null", null)
                    }
                }

                "decryptSignatureToHash" ->{
                    val filePath = call.argument<String>("filePath")!!
                    val password = call.argument<String>("password")!!
                    val base64Signature = call.argument<String>("signature")!!

                    try {
                        val decryptedHash = decryptSignatureToHash(filePath, password, base64Signature)
                        result.success(decryptedHash)
                    }
                    catch(e: Exception) {
                        e.printStackTrace()
                    }
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun verifySignature(filePath: String, password: String, data: String, base64Signature: String): Boolean {
        return try {
            val fis = FileInputStream(filePath)
            val keystore = KeyStore.getInstance("PKCS12", "BC")
            keystore.load(fis, password.toCharArray())

            val alias = keystore.aliases().nextElement()
            val cert = keystore.getCertificate(alias)
            val publicKey = cert.publicKey

            val signedBytes = Base64.decode(base64Signature, Base64.NO_WRAP)

            val signature = Signature.getInstance("SHA256withRSA")
            signature.initVerify(publicKey)
            signature.update(data.toByteArray(Charsets.UTF_8))

            signature.verify(signedBytes)
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    private fun decryptSignatureToHash(filePath: String, password: String, base64Signature: String): String {
    val fis = FileInputStream(filePath)
    val keystore = KeyStore.getInstance("PKCS12")
    keystore.load(fis, password.toCharArray())

    val alias = keystore.aliases().nextElement()
    val cert = keystore.getCertificate(alias) as X509Certificate
    val publicKey = cert.publicKey as RSAPublicKey

    val signatureBytes = Base64.decode(base64Signature, Base64.NO_WRAP)

    val cipher = Cipher.getInstance("RSA/ECB/PKCS1Padding")
    cipher.init(Cipher.DECRYPT_MODE, publicKey)
    val decryptedHashBytes = cipher.doFinal(signatureBytes)

    return decryptedHashBytes.joinToString("") { "%02x".format(it) }
}


    private fun getFirst16CharsOfSignature(signature: String): String {
        if (signature.isBlank()) {
            throw IllegalArgumentException("Input must be a non-empty string.")
        }
        return try {
            // Decode Base64 string to bytes
            val byteArray = Base64.decode(signature, Base64.DEFAULT)
            // Convert bytes to hex string
            val hexStr = byteArray.joinToString("") { "%02x".format(it) }
            // Convert hex string back to badminaytes (like bytes.fromhex in Python)
            val hexBytes = hexStr.chunked(2).map { it.toInt(16).toByte() }.toByteArray()
            // Hash with MD5
            val md5Hash = MessageDigest.getInstance("MD5").digest(hexBytes)
            // Return first 16 hex characters
            md5Hash.joinToString("") { "%02x".format(it) }.substring(0, 16)
    
        } catch (e: IllegalArgumentException) {
            throw IllegalArgumentException("Invalid Base64 string.", e)
        }
    }
    private fun signData(filePath: String, password: String, data: String): Map<String, String> {
        return try {
            // Load the PKCS#12 keystore
            val fis = FileInputStream(filePath)
            val keystore = KeyStore.getInstance("PKCS12", "BC")
            keystore.load(fis, password.toCharArray())
            // Extract the private key (assuming the first alias contains it)
            val alias = keystore.aliases().nextElement()
            val privateKey = keystore.getKey(alias, password.toCharArray()) as PrivateKey
             // **Pre-hash the data with SHA-256**
            val messageDigest = MessageDigest.getInstance("SHA-256")
            val hashedData = messageDigest.digest(data.toByteArray(Charsets.UTF_8))
            val signature = Signature.getInstance("SHA256withRSA") // Uses raw RSA signing
            signature.initSign(privateKey)
            //signature.update(hashedData)
            signature.update(data.toByteArray(Charsets.UTF_8))
            val signedBytes = signature.sign()
            // Compute MD5 hash
            val md = MessageDigest.getInstance("MD5")
            val digest = md.digest(signedBytes)
            val hexString = digest.joinToString("") { byte -> "%02x".format(byte) }
            // Convert signedBytes to Base64 string
            val base64Signature = Base64.encodeToString(signedBytes, Base64.NO_WRAP)
            //val base64SignatureString = Base64.decode()
            // Compute first 16 chars of the MD5 hash from Base64 signature
            val first16Chars = getFirst16CharsOfSignature(base64Signature)
            // Return a Map instead of a string
            mapOf(
                "receiptDeviceSignature_signature_hex" to hexString,
                "receiptDeviceSignature_signature" to base64Signature,
                "receiptDeviceSignature_signature_md5_first16" to first16Chars
            )
        } catch (e: Exception) {
            mapOf("error" to e.message.orEmpty()) // ✅ Return an error in Map format
        }
    }
}


// package com.example.yourapp

// import android.os.Bundle
// import io.flutter.embedding.android.FlutterActivity
// import io.flutter.plugin.common.MethodChannel
// import java.security.*

// class MainActivity : FlutterActivity() {
//     private val CHANNEL = "com.example.pulsepay/signature"

//     override fun onCreate(savedInstanceState: Bundle?) {
//         super.onCreate(savedInstanceState)

//         MethodChannel(flutterEngine!!.dartExecutor.binaryMessenger, CHANNEL).setMethodCallHandler { call, result ->
//             when (call.method) {
//                 "SignatureHash" -> {
//                     val input = call.argument<String>("data")
//                     try {
//                         val hash = InvoiceSigner.SignatureHash(input!!)
//                         result.success(hash)
//                     } catch (e: NoSuchAlgorithmException) {
//                         result.error("HASH_ERROR", "Error generating hash", e.message)
//                     }
//                 }
//                 "SignatureSignature" -> {
//                     val input = call.argument<String>("data")
//                     try {
//                         val signatureResult = InvoiceSigner.SignatureSignature(input!!)
//                         result.success(signatureResult)
//                     } catch (e: Exception) {
//                         result.error("SIGN_ERROR", "Error signing data", e.message)
//                     }
//                 }
//                 else -> result.notImplemented()
//             }
//         }
//     }
// }


