import 'package:flutter/material.dart';
import 'package:pulsepay/SQLite/database_helper.dart';


class Customerslist extends StatefulWidget {
  const Customerslist({super.key});

  @override
  _CustomerslistState createState() => _CustomerslistState();
}

class _CustomerslistState extends State<Customerslist> {
  final DatabaseHelper dbHelper = DatabaseHelper();
  List<Map<String, dynamic>> customersData = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchSalesData();
  }

  Future<void> fetchSalesData() async {
    List<Map<String, dynamic>> data = await dbHelper.getAllCustomers();
    setState(() {
      customersData = data;
      isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Customers List'),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: SingleChildScrollView(
                child: DataTable(
                  columns: const [
                    DataColumn(label: Text('Customer ID')),
                    DataColumn(label: Text('TradeName')),
                    DataColumn(label: Text('TIN')),
                    DataColumn(label: Text('VAT')),
                    DataColumn(label: Text('Address')),
                    DataColumn(label: Text('Email')),
                  ],
                  rows: customersData
                      .map(
                        (customer) => DataRow(
                          cells: [
                            DataCell(Text(customer['customerID'].toString())),
                            DataCell(Text(customer['tradeName'].toString())),
                            DataCell(Text(customer['tinNumber'].toString())),
                            DataCell(Text(customer['vatNumber'].toString())),
                            DataCell(Text(customer['address'].toString())),
                            DataCell(Text(customer['email'].toString())),
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
