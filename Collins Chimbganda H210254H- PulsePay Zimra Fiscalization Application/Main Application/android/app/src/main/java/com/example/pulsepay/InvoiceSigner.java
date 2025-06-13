// package com.example.yourapp;

// import android.util.Base64;
// import java.io.File;
// import java.io.FileInputStream;
// import java.io.IOException;
// import java.io.InputStream;
// import java.nio.charset.StandardCharsets;
// import java.security.*;
// import java.security.cert.CertificateException;

// public class InvoiceSigner {
//     private static final String keyStorePath = "/storage/emulated/0/Pulse/Configurations/mindTest_T_certificate.p12"; // Set correct path
//     private static final String keyStorePassword = "mindTest123"; // Set correct password

//     public static String SignatureHash(String signature_raw) throws NoSuchAlgorithmException {
//         MessageDigest digest = MessageDigest.getInstance("SHA-256");
//         byte[] signature_hash = digest.digest(signature_raw.getBytes(StandardCharsets.UTF_8));
//         return Base64.encodeToString(signature_hash, Base64.NO_WRAP);
//     }

//     public static String[] SignatureSignature(String Signature_raw) throws KeyStoreException, UnrecoverableKeyException, NoSuchAlgorithmException, InvalidKeyException, SignatureException {
//         String[] Signaturehex_SignatureSignature = new String[2];
//         KeyStore keyStore = KeyStore.getInstance("PKCS12");

//         try (InputStream is = new FileInputStream(new File(keyStorePath))) {
//             keyStore.load(is, keyStorePassword.toCharArray());
//         } catch (IOException | CertificateException e) {
//             e.printStackTrace();
//             return null;
//         }

//         String alias = keyStore.aliases().nextElement();
//         PrivateKey privateKey = (PrivateKey) keyStore.getKey(alias, keyStorePassword.toCharArray());

//         Signature signatureInstance = Signature.getInstance("SHA256withRSA");
//         signatureInstance.initSign(privateKey);
//         byte[] bytesToSign = Signature_raw.getBytes(StandardCharsets.UTF_8);
//         signatureInstance.update(bytesToSign);
//         byte[] digitalSignature = signatureInstance.sign();

//         // Generate MD5 hash
//         MessageDigest md = MessageDigest.getInstance("MD5");
//         byte[] thedigest = md.digest(digitalSignature);
//         StringBuilder sb = new StringBuilder();
//         for (byte b : thedigest) {
//             sb.append(String.format("%02x", b));
//         }

//         // Convert to Base64
//         String receiptDeviceSignature_signature_hex = sb.toString();
//         String receiptDeviceSignature_signature = Base64.encodeToString(digitalSignature, Base64.NO_WRAP);

//         Signaturehex_SignatureSignature[0] = receiptDeviceSignature_signature_hex;
//         Signaturehex_SignatureSignature[1] = receiptDeviceSignature_signature;
//         return Signaturehex_SignatureSignature;
//     }
// }
