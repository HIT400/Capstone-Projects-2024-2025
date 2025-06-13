// import 'package:flutter/cupertino.dart';
// import 'package:blue_thermal_printer/blue_thermal_printer.dart';
// import 'package:flutter/material.dart';

// class PrinterSettings extends StatefulWidget {
//   const PrinterSettings({super.key});

//   @override
//   State<PrinterSettings> createState() => _PrinterSettingsState();
// }

// class _PrinterSettingsState extends State<PrinterSettings> {

//   BlueThermalPrinter bluetooth = BlueThermalPrinter.instance;
//   List<BluetoothDevice> _devices = [];
//   BluetoothDevice? _selectedDevice;
//   bool _connected = false;

//   @override
//   void initState() {
//     super.initState();
//     initBluetooth();
//   }

//   Future<void> initBluetooth() async {
//     bool? isConnected = await bluetooth.isConnected;
//     List<BluetoothDevice> devices = [];

//     try {
//       devices = await bluetooth.getBondedDevices();
//     } catch (e) {
//       print("Error getting bonded devices: $e");
//     }

//     setState(() {
//       _devices = devices;
//       _connected = isConnected ?? false;
//     });
//   }

//   void _connectToDevice(BluetoothDevice device) async {
//     await bluetooth.connect(device);
//     setState(() {
//       _selectedDevice = device;
//       _connected = true;
//     });
//   }

//   void _disconnect() async {
//     await bluetooth.disconnect();
//     setState(() {
//       _connected = false;
//       _selectedDevice = null;
//     });
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: Text('Bluetooth Printer Setup'),
//         backgroundColor: Colors.blueAccent,
//       ),
//       body: _devices.isEmpty
//           ? Center(child: Text("No paired devices found"))
//           : ListView(
//               children: _devices.map((device) {
//                 return ListTile(
//                   title: Text(device.name ?? "Unknown"),
//                   subtitle: Text(device.address ?? ""),
//                   trailing: _selectedDevice?.address == device.address && _connected
//                       ? Icon(Icons.check_circle, color: Colors.green)
//                       : ElevatedButton(
//                           onPressed: () => _connectToDevice(device),
//                           child: Text('Connect'),
//                         ),
//                 );
//               }).toList(),
//             ),
//       bottomNavigationBar: _connected
//           ? Padding(
//               padding: const EdgeInsets.all(12.0),
//               child: ElevatedButton(
//                 onPressed: _disconnect,
//                 style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
//                 child: Text("Disconnect Printer"),
//               ),
//             )
//           : null,
//     );
//   }
// }


// import 'package:flutter/material.dart';
// import 'package:blue_thermal_printer/blue_thermal_printer.dart';

// class PrinterConnectPage extends StatefulWidget {
//   @override
//   _PrinterConnectPageState createState() => _PrinterConnectPageState();
// }

// class _PrinterConnectPageState extends State<PrinterConnectPage> {
//   BlueThermalPrinter bluetooth = BlueThermalPrinter.instance;
//   List<BluetoothDevice> _devices = [];
//   BluetoothDevice? _selectedDevice;
//   bool _connected = false;
//   bool _isPrinting = false;

//   @override
//   void initState() {
//     super.initState();
//     initBluetooth();
//   }

//   Future<void> initBluetooth() async {
//     bool? isConnected = await bluetooth.isConnected;
//     List<BluetoothDevice> devices = [];
//     try {
//       devices = await bluetooth.getBondedDevices();
//     } catch (e) {
//       print("Error getting bonded devices: $e");
//     }
//     setState(() {
//       _devices = devices;
//       _connected = isConnected ?? false;
//     });
//   }

//   void _connectToDevice(BluetoothDevice device) async {
//     try {
//       await bluetooth.connect(device);
//       setState(() {
//         _selectedDevice = device;
//         _connected = true;
//       });
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text('Connected to ${device.name}')),
//       );
//     } catch (e) {
//       print("Connection error: $e");
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text('Failed to connect to ${device.name}')),
//       );
//     }
//   }

//   void _disconnect() async {
//     try {
//       await bluetooth.disconnect();
//       setState(() {
//         _connected = false;
//         _selectedDevice = null;
//       });
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text('Disconnected from printer')),
//       );
//     } catch (e) {
//       print("Disconnection error: $e");
//     }
//   }

//   Future<void> _printTestPage() async {
//     if (!_connected) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text('Please connect to a printer first')),
//       );
//       return;
//     }

//     setState(() {
//       _isPrinting = true;
//     });

//     try {
//       // Print test page content
//       bluetooth.isConnected.then((isConnected) {
//         if (isConnected == true) {
//           bluetooth.printNewLine();
//           bluetooth.printCustom("PRINTER TEST PAGE", 3, 1); // Size 3, Center alignment
//           bluetooth.printNewLine();
//           bluetooth.printCustom("================================", 1, 1);
//           bluetooth.printNewLine();
//           bluetooth.printCustom("Device: ${_selectedDevice?.name ?? 'Unknown'}", 1, 0);
//           bluetooth.printCustom("Address: ${_selectedDevice?.address ?? 'Unknown'}", 1, 0);
//           bluetooth.printNewLine();
//           bluetooth.printCustom("Date: ${DateTime.now().toString().split('.')[0]}", 1, 0);
//           bluetooth.printNewLine();
//           bluetooth.printCustom("--------------------------------", 1, 1);
//           bluetooth.printCustom("Sample Receipt Format", 2, 1);
//           bluetooth.printCustom("--------------------------------", 1, 1);
//           bluetooth.printNewLine();
//           bluetooth.printLeftRight("Item 1", "10.00", 1);
//           bluetooth.printLeftRight("Item 2", "15.50", 1);
//           bluetooth.printLeftRight("Item 3", "8.25", 1);
//           bluetooth.printCustom("--------------------------------", 1, 1);
//           bluetooth.printLeftRight("TOTAL", "33.75", 2);
//           bluetooth.printCustom("--------------------------------", 1, 1);
//           bluetooth.printNewLine();
//           bluetooth.printCustom("Thank you for testing!", 1, 1);
//           bluetooth.printCustom("Printer is working correctly", 1, 1);
//           bluetooth.printNewLine();
//           bluetooth.printNewLine();
//           bluetooth.printNewLine();
//           bluetooth.paperCut();
//         }
//       });

//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text('Test page sent to printer')),
//       );
//     } catch (e) {
//       print("Print error: $e");
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text('Failed to print test page: $e')),
//       );
//     } finally {
//       setState(() {
//         _isPrinting = false;
//       });
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: Text('Bluetooth Printer Setup'),
//         backgroundColor: Colors.blueAccent,
//       ),
//       body: Column(
//         children: [
//           // Connection status banner
//           if (_connected)
//             Container(
//               width: double.infinity,
//               padding: EdgeInsets.all(12),
//               color: Colors.green.shade100,
//               child: Row(
//                 children: [
//                   Icon(Icons.check_circle, color: Colors.green),
//                   SizedBox(width: 8),
//                   Text(
//                     'Connected to: ${_selectedDevice?.name ?? "Unknown Device"}',
//                     style: TextStyle(color: Colors.green.shade800, fontWeight: FontWeight.bold),
//                   ),
//                 ],
//               ),
//             ),
          
//           // Device list
//           Expanded(
//             child: _devices.isEmpty
//                 ? Center(child: Text("No paired devices found"))
//                 : ListView(
//                     children: _devices.map((device) {
//                       return ListTile(
//                         title: Text(device.name ?? "Unknown"),
//                         subtitle: Text(device.address ?? ""),
//                         trailing: _selectedDevice?.address == device.address && _connected
//                             ? Icon(Icons.check_circle, color: Colors.green)
//                             : ElevatedButton(
//                                 onPressed: () => _connectToDevice(device),
//                                 child: Text('Connect'),
//                               ),
//                       );
//                     }).toList(),
//                   ),
//           ),
          
//           // Action buttons
//           if (_connected)
//             Padding(
//               padding: const EdgeInsets.all(12.0),
//               child: Column(
//                 children: [
//                   // Test print button
//                   SizedBox(
//                     width: double.infinity,
//                     child: ElevatedButton.icon(
//                       onPressed: _isPrinting ? null : _printTestPage,
//                       icon: _isPrinting 
//                           ? SizedBox(
//                               width: 20,
//                               height: 20,
//                               child: CircularProgressIndicator(strokeWidth: 2),
//                             )
//                           : Icon(Icons.print),
//                       label: Text(_isPrinting ? 'Printing...' : 'Print Test Page'),
//                       style: ElevatedButton.styleFrom(
//                         backgroundColor: Colors.blueAccent,
//                         padding: EdgeInsets.symmetric(vertical: 12),
//                       ),
//                     ),
//                   ),
//                   SizedBox(height: 8),
//                   // Disconnect button
//                   SizedBox(
//                     width: double.infinity,
//                     child: ElevatedButton(
//                       onPressed: _disconnect,
//                       style: ElevatedButton.styleFrom(
//                         backgroundColor: Colors.redAccent,
//                         padding: EdgeInsets.symmetric(vertical: 12),
//                       ),
//                       child: Text("Disconnect Printer"),
//                     ),
//                   ),
//                 ],
//               ),
//             ),
//         ],
//       ),
//     );
//   }
// }

// import 'package:flutter/material.dart';
// import 'package:sunmi_printer_plus/core/enums/enums.dart';
// import 'package:sunmi_printer_plus/core/sunmi/sunmi_printer.dart';
// import 'package:sunmi_printer_plus/sunmi_printer_plus.dart';

// class SunmiPrinterPage extends StatefulWidget {
//   @override
//   _SunmiPrinterPageState createState() => _SunmiPrinterPageState();
// }

// class _SunmiPrinterPageState extends State<SunmiPrinterPage> {
//   bool _isConnected = false;
//   bool _isPrinting = false;
//   String _printerStatus = 'Checking...';

//   @override
//   void initState() {
//     super.initState();
//     _checkPrinterStatus();
//   }

//   Future<void> _checkPrinterStatus() async {
//     try {
//       // Check if Sunmi printer is available
//       bool isConnected = await SunmiPrinter.bindingPrinter() ?? false;
      
//       setState(() {
//         _isConnected = isConnected;
//         _printerStatus = isConnected ? 'Sunmi Printer Ready' : 'Sunmi Printer Not Available';
//       });
//     } catch (e) {
//       setState(() {
//         _isConnected = false;
//         _printerStatus = 'Error: $e';
//       });
//     }
//   }

//   Future<void> _printTestPage() async {
//     if (!_isConnected) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text('Printer not available')),
//       );
//       return;
//     }

//     setState(() {
//       _isPrinting = true;
//     });

//     try {
//       // Initialize printer
//       await SunmiPrinter.initPrinter();
      
//       // Print test page
//       await SunmiPrinter.startTransactionPrint(true);
      
//       // Header
//       await SunmiPrinter.setAlignment(SunmiPrintAlign.CENTER);
//       await SunmiPrinter.printText('SUNMI PRINTER TEST');
//       //await SunmiPrinter.setFontSize(SunmiFontSize.LG);
//       await SunmiPrinter.printText('TEST PAGE');
//       await SunmiPrinter.lineWrap(2);
      
//       // Reset font size
//       await SunmiPrinter.resetFontSize();
      
//       // Divider
//       await SunmiPrinter.printText('================================');
//       await SunmiPrinter.lineWrap(1);
      
//       // Device info
//       await SunmiPrinter.setAlignment(SunmiPrintAlign.LEFT);
//       await SunmiPrinter.printText('Device: Sunmi V2 Pro');
//       await SunmiPrinter.printText('Date: ${DateTime.now().toString().split('.')[0]}');
//       await SunmiPrinter.lineWrap(1);
      
//       // Sample receipt
//       await SunmiPrinter.printText('--------------------------------');
//       await SunmiPrinter.setAlignment(SunmiPrintAlign.CENTER);
//       await SunmiPrinter.printText('Sample Receipt');
//       await SunmiPrinter.printText('--------------------------------');
      
//       // Items
//       await SunmiPrinter.setAlignment(SunmiPrintAlign.LEFT);
//       await SunmiPrinter.printText('Item 1                    10.00');
//       await SunmiPrinter.printText('Item 2                    15.50');
//       await SunmiPrinter.printText('Item 3                     8.25');
      
//       // Total
//       await SunmiPrinter.printText('--------------------------------');
//       await SunmiPrinter.printText('TOTAL                     33.75');
//       await SunmiPrinter.printText('--------------------------------');
//       await SunmiPrinter.lineWrap(1);
      
//       // Footer
//       await SunmiPrinter.setAlignment(SunmiPrintAlign.CENTER);
//       await SunmiPrinter.printText('Thank you for testing!');
//       await SunmiPrinter.printText('Sunmi printer is working correctly');
      
//       // QR Code (optional)
//       await SunmiPrinter.lineWrap(1);
//       await SunmiPrinter.printQRCode('https://sunmi.com');
      
//       // Cut paper
//       await SunmiPrinter.lineWrap(3);
//       await SunmiPrinter.cutPaper();
      
//       await SunmiPrinter.exitTransactionPrint(true);

//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text('Test page printed successfully!')),
//       );
//     } catch (e) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text('Print failed: $e')),
//       );
//     } finally {
//       setState(() {
//         _isPrinting = false;
//       });
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       appBar: AppBar(
//         title: Text('Sunmi V2 Pro Printer'),
//         backgroundColor: Colors.orange,
//       ),
//       body: Padding(
//         padding: EdgeInsets.all(16),
//         child: Column(
//           crossAxisAlignment: CrossAxisAlignment.stretch,
//           children: [
//             // Status Card
//             Card(
//               color: _isConnected ? Colors.green.shade100 : Colors.red.shade100,
//               child: Padding(
//                 padding: EdgeInsets.all(16),
//                 child: Column(
//                   children: [
//                     Icon(
//                       _isConnected ? Icons.print : Icons.print_disabled,
//                       size: 48,
//                       color: _isConnected ? Colors.green : Colors.red,
//                     ),
//                     SizedBox(height: 8),
//                     Text(
//                       _printerStatus,
//                       style: TextStyle(
//                         fontSize: 18,
//                         fontWeight: FontWeight.bold,
//                         color: _isConnected ? Colors.green.shade800 : Colors.red.shade800,
//                       ),
//                     ),
//                   ],
//                 ),
//               ),
//             ),
            
//             SizedBox(height: 20),
            
//             // Refresh button
//             ElevatedButton.icon(
//               onPressed: _checkPrinterStatus,
//               icon: Icon(Icons.refresh),
//               label: Text('Check Printer Status'),
//               style: ElevatedButton.styleFrom(
//                 backgroundColor: Colors.blue,
//                 padding: EdgeInsets.symmetric(vertical: 12),
//               ),
//             ),
            
//             SizedBox(height: 12),
            
//             // Test print button
//             ElevatedButton.icon(
//               onPressed: _isConnected && !_isPrinting ? _printTestPage : null,
//               icon: _isPrinting 
//                   ? SizedBox(
//                       width: 20,
//                       height: 20,
//                       child: CircularProgressIndicator(strokeWidth: 2),
//                     )
//                   : Icon(Icons.print),
//               label: Text(_isPrinting ? 'Printing...' : 'Print Test Page'),
//               style: ElevatedButton.styleFrom(
//                 backgroundColor: Colors.orange,
//                 padding: EdgeInsets.symmetric(vertical: 12),
//               ),
//             ),
            
//             SizedBox(height: 20),
            
//             // Info text
//             Card(
//               child: Padding(
//                 padding: EdgeInsets.all(16),
//                 child: Column(
//                   crossAxisAlignment: CrossAxisAlignment.start,
//                   children: [
//                     Text(
//                       'Sunmi V2 Pro Information:',
//                       style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
//                     ),
//                     SizedBox(height: 8),
//                     Text('• Built-in thermal printer'),
//                     Text('• No Bluetooth connection needed'),
//                     Text('• Uses Sunmi proprietary APIs'),
//                     Text('• Supports text, QR codes, and images'),
//                   ],
//                 ),
//               ),
//             ),
//           ],
//         ),
//       ),
//     );
//   }
// }

import 'package:flutter/material.dart';
import 'package:sunmi_printer_plus/core/enums/enums.dart';
import 'package:sunmi_printer_plus/core/sunmi/sunmi_printer.dart';
import 'package:sunmi_printer_plus/sunmi_printer_plus.dart';

class SunmiPrinterPage extends StatefulWidget {
  @override
  _SunmiPrinterPageState createState() => _SunmiPrinterPageState();
}

class _SunmiPrinterPageState extends State<SunmiPrinterPage> {
  bool _isConnected = false;
  bool _isPrinting = false;
  String _printerStatus = 'Checking...';

  @override
  void initState() {
    super.initState();
    _initializePrinter();
  }

  Future<void> _initializePrinter() async {
    try {
      // Initialize the printer first
      await SunmiPrinter.initPrinter();
      
      // Check if printer is available
      await SunmiPrinter.bindingPrinter();
      
      setState(() {
        _isConnected = true;
        _printerStatus = 'Sunmi Printer Ready';
      });
    } catch (e) {
      print('Printer initialization error: $e');
      setState(() {
        _isConnected = false;
        _printerStatus = 'Printer initialization failed: ${e.toString()}';
      });
    }
  }

  Future<void> _checkPrinterStatus() async {
    setState(() {
      _printerStatus = 'Checking...';
    });
    
    await _initializePrinter();
  }

  Future<void> _printTestPage() async {
    if (!_isConnected) {
      _showMessage('Printer not available');
      return;
    }

    setState(() {
      _isPrinting = true;
    });

    try {
      // Simple test print without complex formatting
      await SunmiPrinter.printText('SUNMI PRINTER TEST');
      await SunmiPrinter.lineWrap(1);
      
      await SunmiPrinter.setAlignment(SunmiPrintAlign.CENTER);
      //await SunmiPrinter.setFontSize(SunmiFontSize.LG);
      await SunmiPrinter.printText('TEST PAGE');
      await SunmiPrinter.resetFontSize();
      await SunmiPrinter.lineWrap(2);
      
      await SunmiPrinter.setAlignment(SunmiPrintAlign.LEFT);
      await SunmiPrinter.printText('================================');
      await SunmiPrinter.printText('Device: Sunmi V2 Pro');
      await SunmiPrinter.printText('Date: ${DateTime.now().toString().split('.')[0]}');
      await SunmiPrinter.printText('================================');
      await SunmiPrinter.lineWrap(1);
      
      await SunmiPrinter.setAlignment(SunmiPrintAlign.CENTER);
      await SunmiPrinter.printText('Sample Receipt');
      await SunmiPrinter.setAlignment(SunmiPrintAlign.LEFT);
      await SunmiPrinter.printText('--------------------------------');
      
      await SunmiPrinter.printText('Item 1                    10.00');
      await SunmiPrinter.printText('Item 2                    15.50');
      await SunmiPrinter.printText('Item 3                     8.25');
      await SunmiPrinter.printText('--------------------------------');
      await SunmiPrinter.printText('TOTAL                     33.75');
      await SunmiPrinter.printText('--------------------------------');
      await SunmiPrinter.lineWrap(1);
      
      await SunmiPrinter.setAlignment(SunmiPrintAlign.CENTER);
      await SunmiPrinter.printText('Thank you for testing!');
      await SunmiPrinter.printText('Sunmi printer is working');
      await SunmiPrinter.lineWrap(3);
      
      // Cut paper
      await SunmiPrinter.cutPaper();

      _showMessage('Test page printed successfully!');
    } catch (e) {
      print('Print error: $e');
      _showMessage('Print failed: ${e.toString()}');
    } finally {
      setState(() {
        _isPrinting = false;
      });
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(50)
        ,child: AppBar(
          centerTitle: true,
          title: const Text("Inner Printer Setup" , style: TextStyle(fontSize: 16, color: Colors.white, fontWeight:  FontWeight.bold),),
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
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Status Card
            Card(
              color: _isConnected ? Colors.green.shade100 : Colors.red.shade100,
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  children: [
                    Icon(
                      _isConnected ? Icons.print : Icons.print_disabled,
                      size: 48,
                      color: _isConnected ? Colors.green : Colors.red,
                    ),
                    SizedBox(height: 8),
                    Text(
                      _printerStatus,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: _isConnected ? Colors.green.shade800 : Colors.red.shade800,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            ),
            
            SizedBox(height: 20),
            
            // Refresh button
            ElevatedButton.icon(
              onPressed: _checkPrinterStatus,
              icon: Icon(Icons.refresh),
              label: Text('Check Printer Status'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: 12),
              ),
            ),
            
            SizedBox(height: 12),
            
            // Test print button
            ElevatedButton.icon(
              onPressed: _isConnected && !_isPrinting ? _printTestPage : null,
              icon: _isPrinting 
                  ? SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : Icon(Icons.print),
              label: Text(_isPrinting ? 'Printing...' : 'Print Test Page'),
              style: ElevatedButton.styleFrom(
                backgroundColor: _isConnected ? Colors.green: Colors.grey,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: 12),
              ),
            ),
            
            SizedBox(height: 20),
            
            // Info text
            Card(
              child: Padding(
                padding: EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Sunmi V2 Pro Information:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    SizedBox(height: 8),
                    Text('• Built-in thermal printer'),
                    Text('• No Bluetooth connection needed'),
                    Text('• Uses Sunmi proprietary APIs'),
                    Text('• Supports text, QR codes, and images'),
                    SizedBox(height: 8),
                    Text(
                      'Troubleshooting:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text('• Make sure paper is loaded'),
                    Text('• Check printer tray is closed'),
                    Text('• Restart app if initialization fails'),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}