import 'package:flutter/material.dart';
import 'package:pulsepay/SQLite/database_helper.dart';

class InvoicesPage extends StatefulWidget {
  const InvoicesPage({super.key});
  @override
  _InvoicesPageState createState() => _InvoicesPageState();
}

class _InvoicesPageState extends State<InvoicesPage> {
  final DatabaseHelper dbHelper = DatabaseHelper();
  List<Map<String, dynamic>> invoices = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchInvoices();
  }

  Future<void> fetchInvoices() async {
    List<Map<String, dynamic>> data = await dbHelper.getAllInvoices();
    setState(() {
      invoices = data;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Invoices Summary'),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: SingleChildScrollView(
                child: DataTable(
                  columns: const [
                    DataColumn(label: Text('Invoice ID')),
                    DataColumn(label: Text('Date')),
                    DataColumn(label: Text('Total Items')),
                    DataColumn(label: Text('Total Price')),
                    DataColumn(label: Text('Total Tax')),
                  ],
                  rows: invoices
                      .map(
                        (invoice) => DataRow(
                          cells: [
                            DataCell(Text(invoice['invoiceId'].toString())),
                            DataCell(Text(invoice['date'].toString())),
                            DataCell(Text(invoice['totalItems'].toString())),
                            DataCell(Text(invoice['totalPrice'].toString())),
                            DataCell(Text(invoice['totalTax'].toString())),
                          ],
                        ),
                      )
                      .toList(),
                ),
              ),
            ),
    );
  }
}
