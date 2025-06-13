import 'package:flutter/material.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/app_bar.dart';
import 'package:pulsepay/common/custom_button.dart';

class SubmittedReceiptsTable extends StatefulWidget {
  const SubmittedReceiptsTable({super.key});
  @override
  State<SubmittedReceiptsTable> createState() => _submittedReceiptsTableState();
}

class _submittedReceiptsTableState extends State<SubmittedReceiptsTable> {
  final DatabaseHelper dbHelper = DatabaseHelper();
  List<Map<String, dynamic>> submittedReceipts= [];
  List<int> selectedReceipt = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchUsers();
  }

  Future<void> fetchUsers() async {
    List<Map<String, dynamic>> data = await dbHelper.getSubmittedReceipts();
    setState(() {
      submittedReceipts = data;
      isLoading = false;
    });
  }

  void toggleSelection(int receiptGlobalNo) {
    setState(() {
      if (selectedReceipt.contains(receiptGlobalNo)) {
        selectedReceipt.remove(receiptGlobalNo);
      } else {
        selectedReceipt.add(receiptGlobalNo);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(50)
        ,child: AppBar(
          centerTitle: true,
          title: const Text("Submitted Receipts" , style: TextStyle(fontSize: 20, color: Colors.white, fontWeight:  FontWeight.bold),),
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
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
            scrollDirection: Axis.vertical,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20,),
                SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: SingleChildScrollView(
                      child: DataTable(
                        headingTextStyle: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                        headingRowColor: MaterialStateProperty.all(Colors.blue),
                        columns: const [
                          DataColumn(label: Text('Select')),
                          DataColumn(label: Text('ReceiptGlobalNo')),
                          DataColumn(label: Text('ReceiptCounter')),
                          DataColumn(label: Text('FiscalDayNo')),
                          DataColumn(label: Text('InvoiceNo')),
                          DataColumn(label: Text('ReceiptID')),
                          DataColumn(label: Text('ReceiptType')),
                          DataColumn(label: Text('ReceiptCurrency')),
                          DataColumn(label: Text('MoneyType')),
                          DataColumn(label: Text('ReceiptDate')),
                          DataColumn(label: Text('ReceiptTime')),
                          DataColumn(label: Text('ReceiptTotal')),
                          DataColumn(label: Text('TaxCode')),
                          DataColumn(label: Text('taxPercent')),
                          DataColumn(label:Text('taxAmount')),
                          DataColumn(label:Text('salesAmountwithTax')),
                          DataColumn(label:Text('receiptHash')),
                          DataColumn(label:Text('receiptJsonbody')),
                          DataColumn(label:Text('statustoFdms')),
                          DataColumn(label:Text('qrurl')),
                          DataColumn(label:Text('receiptServerSignature')),
                          DataColumn(label:Text('submitReceiptServerresponseJson')),
                          DataColumn(label:Text('total15Vat')),
                          DataColumn(label:Text('totalNonVat')),
                          DataColumn(label:Text('totalExempt')),
                          DataColumn(label:Text('totalWT')),
                        ],
                        rows: submittedReceipts
                            .map(
                              (receipt) {
                                final receiptID = receipt['receiptGlobalNo'];
                                return DataRow(
                                cells: [
                                  DataCell(
                                    Checkbox(
                                      value: selectedReceipt.contains(receiptID),
                                      onChanged: (_) => toggleSelection(receiptID),
                                    ),
                                  ),
                                  DataCell(Text(receipt['receiptGlobalNo'].toString())),
                                  DataCell(Text(receipt['receiptCounter'].toString())),
                                  DataCell(Text(receipt['FiscalDayNo'].toString())),
                                  DataCell(Text(receipt['InvoiceNo'].toString())),
                                  DataCell(Text(receipt['receiptID'].toString())),
                                  DataCell(Text(receipt['receiptType'].toString())),
                                  DataCell(Text(receipt['receiptCurrency'].toString())),
                                  DataCell(Text(receipt['moneyType'].toString())),
                                  DataCell(Text(receipt['receiptDate'].toString())),
                                  DataCell(Text(receipt['receiptTime'].toString())),
                                  DataCell(Text(receipt['receiptTotal'].toString())),
                                  DataCell(Text(receipt['taxCode'].toString())),
                                  DataCell(Text(receipt['taxPercent'].toString())),
                                  DataCell(Text(receipt['taxAmount'].toString())),
                                  DataCell(Text(receipt['SalesAmountwithTax'].toString())),
                                  DataCell(Text(receipt['receiptHash'].toString())),
                                  DataCell(Text(receipt['receiptJsonbody'].toString())),
                                  DataCell(Text(receipt['StatustoFDMS'].toString())),
                                  DataCell(Text(receipt['qrurl'].toString())),
                                  DataCell(Text(receipt['receiptServerSignature'].toString())),
                                  DataCell(Text(receipt['submitReceiptServerresponseJSON'].toString())),
                                  DataCell(Text(receipt['Total15VAT'].toString())),
                                  DataCell(Text(receipt['TotalNonVAT'].toString())),
                                  DataCell(Text(receipt['TotalExempt'].toString())),
                                  DataCell(Text(receipt['TotalWT'].toString())),
                                ],
                              );
                            })
                            .toList(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 50,),
                  if (selectedReceipt.isNotEmpty)
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
