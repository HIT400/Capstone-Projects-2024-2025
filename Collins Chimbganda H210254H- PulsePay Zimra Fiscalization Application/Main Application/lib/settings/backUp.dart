import 'dart:io';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:path/path.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/custom_button.dart';
import 'package:sqflite/sqflite.dart';

class DatabaseBackup extends StatefulWidget {
  const DatabaseBackup({super.key});

  @override
  State<DatabaseBackup> createState() => _DatabaseBackupState();
}

class _DatabaseBackupState extends State<DatabaseBackup> {

  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(50)
        ,child: AppBar(
          centerTitle: true,
          title: const Text("Database Backup" , style: TextStyle(fontSize: 16, color: Colors.white, fontWeight:  FontWeight.bold),),
          iconTheme: const IconThemeData(color: Colors.white),
          backgroundColor: Colors.blue,
          shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(25),
                  bottomRight: Radius.circular(25)
                )
              ),
        )
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          scrollDirection: Axis.vertical,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 10.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20,),
                Center(
                  child: Container(
                    height: 75,
                    width: 75,
                    decoration: BoxDecoration(
                      //color: Colors.blue,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.blue, width: 2),
                      image: const DecorationImage(
                        image: AssetImage("assets/backup.png"),
                        fit: BoxFit.fitHeight,
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20,),
                Center(
                  child: Text("Backup your database to prevent data loss in case of device failure or accidental deletion.", 
                    style: TextStyle(fontSize: 14, color: Colors.grey[700]),
                    textAlign: TextAlign.center,
                  ),
                ),
                const SizedBox(height: 20,),
                CustomOutlineBtn(
                  text: "Create BackUp",
                  color: Colors.green,
                  color2: Colors.green,
                  height: 50,
                  onTap: () async{
                    try {
                      DatabaseBackupService backupService = DatabaseBackupService();
    
                      // Request permissions first
                      bool hasPermission = await backupService.requestStoragePermission();
                      if (!hasPermission) {
                        print('Storage permission denied');
                        return;
                      }
                      Database db = await openDatabase('pulse.db');
                      //createDatabaseFileBackup();
                      String? fileCopyPath = await backupService.createDatabaseFileBackup();
                      if (fileCopyPath != null) {
                        print('File backup created at: $fileCopyPath');
                      }
                      //exportDatabaseAsSQL(db);
                      String? sqlPath = await backupService.exportDatabaseAsSQL(db);
                      if (sqlPath != null) {
                        print('SQL backup created at: $sqlPath');
                }
                      Get.snackbar(
                        "Backup Created", 
                        "Database backup created successfully.",
                        snackPosition: SnackPosition.TOP,
                        backgroundColor: Colors.green,
                        colorText: Colors.white,
                        icon: const Icon(Icons.check_circle, color: Colors.white),
                      );
                    } catch (e) {
                      Get.snackbar(
                        "Create Creating Backups", 
                        "$e",
                        snackPosition: SnackPosition.TOP,
                        backgroundColor: Colors.red,
                        colorText: Colors.white,
                        icon: const Icon(Icons.error, color: Colors.white),
                      );
                    }
                  },
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class DatabaseBackupService{
  Future<String?> createDatabaseFileBackup() async{
    try {
      String databasePath  = await getDatabasesPath();
      String dbPath = join(databasePath, "pulse.db");
      if(!await File(dbPath).exists()){
        Get.snackbar(
          "Error", 
          "Database Not Found",
          snackPosition: SnackPosition.TOP,
          backgroundColor: Colors.red,
          colorText: Colors.white,
          icon: const Icon(Icons.error, color: Colors.white),
        );
      }
      String backupDir = '/storage/emulated/0/Pulse/DatabaseBackups';
      await Directory(backupDir).create(recursive: true);

      //create a backup file name with timestamp
      String timestamp = DateTime.now().toIso8601String().replaceAll(':', '_');
      String backupPath = '$backupDir/backup_$timestamp.db';

      await File(dbPath).copy(backupPath);
      // Get.snackbar(
      //   "Backup Created", 
      //   "Database backup created successfully at $backupPath",
      //   snackPosition: SnackPosition.TOP,
      //   backgroundColor: Colors.green,
      //   colorText: Colors.white,
      //   icon: const Icon(Icons.check_circle, color: Colors.white),
      // );
      return backupPath;
    } catch (e) {
      Get.snackbar(
          "Error Creating File Backup", 
          "$e",
          snackPosition: SnackPosition.TOP,
          backgroundColor: Colors.red,
          colorText: Colors.white,
          icon: const Icon(Icons.error, color: Colors.white),
      );
      return '';
    }
  }

  // Method 2: Export as SQL statements
  Future<String?> exportDatabaseAsSQL(Database database) async {
    try {
      // Get all table names
      List<Map<String, dynamic>> tables = await database.rawQuery(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );
      
      StringBuffer sqlBuffer = StringBuffer();
      sqlBuffer.writeln('-- Database Backup Generated: ${DateTime.now()}');
      sqlBuffer.writeln('-- Begin Transaction');
      sqlBuffer.writeln('BEGIN TRANSACTION;');
      sqlBuffer.writeln();
      
      for (Map<String, dynamic> table in tables) {
        String tableName = table['name'];
        
        // Get table schema
        List<Map<String, dynamic>> schema = await database.rawQuery(
          "SELECT sql FROM sqlite_master WHERE type='table' AND name='$tableName'"
        );
        
        if (schema.isNotEmpty) {
          sqlBuffer.writeln('-- Table: $tableName');
          sqlBuffer.writeln('DROP TABLE IF EXISTS $tableName;');
          sqlBuffer.writeln('${schema[0]['sql']};');
          sqlBuffer.writeln();
          
          // Get table data
          List<Map<String, dynamic>> rows = await database.query(tableName);
          
          if (rows.isNotEmpty) {
            // Get column names
            List<String> columns = rows[0].keys.toList();
            String columnsList = columns.join(', ');
            
            sqlBuffer.writeln('-- Data for table: $tableName');
            
            for (Map<String, dynamic> row in rows) {
              List<String> values = [];
              for (String column in columns) {
                dynamic value = row[column];
                if (value == null) {
                  values.add('NULL');
                } else if (value is String) {
                  // Escape single quotes
                  String escapedValue = value.replaceAll("'", "''");
                  values.add("'$escapedValue'");
                } else {
                  values.add(value.toString());
                }
              }
              
              String valuesList = values.join(', ');
              sqlBuffer.writeln('INSERT INTO $tableName ($columnsList) VALUES ($valuesList);');
            }
            sqlBuffer.writeln();
          }
        }
      }
      
      sqlBuffer.writeln('-- End Transaction');
      sqlBuffer.writeln('COMMIT;');
      
      
      String backupDir = '/storage/emulated/0/Pulse/DatabaseBackups';
      await Directory(backupDir).create(recursive: true);
      
      String timestamp = DateTime.now().toIso8601String().replaceAll(':', '_');
      String backupPath = '$backupDir/backup_$timestamp.sql';
      
      File backupFile = File(backupPath);
      await backupFile.writeAsString(sqlBuffer.toString());
      
      print('SQL backup created: $backupPath');
      return backupPath;
      
    } catch (e) {
      Get.snackbar(
        "Error Creating SQL Backup", 
        "$e",
        snackPosition: SnackPosition.TOP,
        colorText: Colors.white,
        backgroundColor: Colors.red,
        icon: const Icon(Icons.error, color: Colors.white),
      );
      //print('Error creating SQL backup: $e');
      return null;
    }
  }

  Future<bool> requestStoragePermission() async {
    if (Platform.isAndroid) {
      var status = await Permission.storage.status;
      if (!status.isGranted) {
        status = await Permission.storage.request();
      }
      return status.isGranted;
    }
    return true; // iOS doesn't need explicit storage permission for app documents
  }


}