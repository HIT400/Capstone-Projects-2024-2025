import 'package:flutter/material.dart';
import 'package:pulsepay/SQLite/database_helper.dart';


class SalesPage extends StatefulWidget {
  const SalesPage({super.key});

  @override
  _SalesPageState createState() => _SalesPageState();
}

class _SalesPageState extends State<SalesPage> {
  final DatabaseHelper dbHelper = DatabaseHelper();
  List<Map<String, dynamic>> salesData = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchSalesData();
  }

  Future<void> fetchSalesData() async {
    List<Map<String, dynamic>> data = await dbHelper.getAllSales();
    setState(() {
      salesData = data;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Sales Summary'),
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
                    DataColumn(label: Text('Product')),
                    DataColumn(label: Text('Quantity')),
                    DataColumn(label: Text('Selling Price')),
                    DataColumn(label: Text('Total Price')),
                    DataColumn(label: Text('Tax')),
                  ],
                  rows: salesData
                      .map(
                        (sale) => DataRow(
                          cells: [
                            DataCell(Text(sale['invoiceId'].toString())),
                            DataCell(Text(sale['date'].toString())),
                            DataCell(Text(sale['productName'].toString())),
                            DataCell(Text(sale['quantity'].toString())),
                            DataCell(Text(sale['sellingPrice'].toString())),
                            DataCell(Text(sale['totalPrice'].toString())),
                            DataCell(Text(sale['tax'].toString())),
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
