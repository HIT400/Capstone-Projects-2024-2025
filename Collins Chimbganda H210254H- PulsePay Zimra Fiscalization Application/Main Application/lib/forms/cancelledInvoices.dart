import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/app_bar.dart';
import 'package:pulsepay/common/custom_button.dart';

class Cancelledinvoices extends StatefulWidget {
  const Cancelledinvoices({super.key});

  @override
  State<Cancelledinvoices> createState() => _CancelledinvoicesState();
}

class _CancelledinvoicesState extends State<Cancelledinvoices> {
  final DatabaseHelper dbHelper = DatabaseHelper();
  List<Map<String, dynamic>> cancelledInvoices= [];
  List<int> selectedInvoice = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchAllCreditNotes();
  }

  Future<void> fetchAllCreditNotes() async{
    List<Map<String, dynamic>> data = await dbHelper.getAllCancelledInvoices();
    setState(() {
      cancelledInvoices = data;
      isLoading = false;
    });
  }

  void toggleSelection(int invoiceId) {
    setState(() {
      if (selectedInvoice.contains(invoiceId)) {
        selectedInvoice.remove(invoiceId);
      } else {
        selectedInvoice.add(invoiceId);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(50),
        child: CustomAppBar(
          text:'Credit Notes',
          child: GestureDetector(
            onTap: () {
              Navigator.pop(context);
            },
            child: const Icon(Icons.arrow_back),
          ),
        ),
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
            scrollDirection: Axis.vertical,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: SingleChildScrollView(
                      child: DataTable(
                        columns: const [
                          DataColumn(label: Text('Select')),
                          DataColumn(label: Text('ReceiptGlobalNo')),
                          DataColumn(label: Text('ReceiptID')),
                          DataColumn(label: Text('Date')),
                          DataColumn(label: Text('Total')),
                          DataColumn(label: Text('Note')),
                          DataColumn(label: Text('CreditNote Number')),
                        ],
                        rows: cancelledInvoices
                            .map(
                              (receipt) {
                                final receiptID = receipt['id'];
                                return DataRow(
                                cells: [
                                  DataCell(
                                    Checkbox(
                                      value: selectedInvoice.contains(receiptID),
                                      onChanged: (_) => toggleSelection(receiptID),
                                    ),
                                  ),
                                  DataCell(Text(receipt['receiptGlobalNo'].toString())),
                                  DataCell(Text(receipt['receiptID'].toString())),
                                  DataCell(Text(receipt['receiptDate'].toString())),
                                  DataCell(Text(receipt['receiptTotal'].toString())),
                                  DataCell(Text(receipt['receiptNotes'].toString())),
                                  DataCell(Text(receipt['creditNoteNumber'].toString())),
                                ],
                              );
                            })
                            .toList(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 50,),
                  if (selectedInvoice.isNotEmpty)
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    CustomOutlineBtn(
                      width: 150,
                      height: 50,
                      text: "View Day Sales",
                      color:const Color.fromARGB(255, 14, 19, 29),
                      color2: const Color.fromARGB(255, 14, 19, 29),
                      onTap: (){
                        //final i = selectedUsers.first;
                        //fetchSalesForInvoice(invoiceId);
                      },
                    ),
                    
                    CustomOutlineBtn(
                      width: 150,
                      height: 50,
                      text: "Day Details",
                      color:const Color.fromARGB(255, 14, 19, 29),
                      color2: const Color.fromARGB(255, 14, 19, 29),
                      onTap: (){
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),

    );
  }
}