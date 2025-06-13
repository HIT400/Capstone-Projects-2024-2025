import 'package:flutter/material.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/app_bar.dart';
import 'package:pulsepay/common/custom_button.dart';

class OpenDayTable extends StatefulWidget {
  const OpenDayTable({super.key});
  @override
  State<OpenDayTable> createState() => _openDayTableState();
}

class _openDayTableState extends State<OpenDayTable> {
  final DatabaseHelper dbHelper = DatabaseHelper();
  List<Map<String, dynamic>> days = [];
  List<int> selectedDay = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchUsers();
  }

  Future<void> fetchUsers() async {
    List<Map<String, dynamic>> data = await dbHelper.getOpenDay();
    setState(() {
      days = data;
      isLoading = false;
    });
  }

  void toggleSelection(int dayId) {
    setState(() {
      if (selectedDay.contains(dayId)) {
        selectedDay.remove(dayId);
      } else {
        selectedDay.add(dayId);
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
          title: const Text("Open Day Table" , style: TextStyle(fontSize: 20, color: Colors.white, fontWeight:  FontWeight.bold),),
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
                const SizedBox(height: 20),
                SingleChildScrollView(
                    scrollDirection: Axis.vertical,
                    child: SingleChildScrollView(
                      scrollDirection: Axis.horizontal,
                      child: DataTable(
                        headingTextStyle: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                        headingRowColor: MaterialStateProperty.all(Colors.blue),
                        columns: const [
                          DataColumn(label: Text('Select')),
                          DataColumn(label: Text('ID')),
                          DataColumn(label: Text('FiscalDayNumber')),
                          DataColumn(label: Text('StatusOfFirst')),
                          DataColumn(label: Text('FiscalDayOpened')),
                          DataColumn(label: Text('FiscalDayClosed')),
                          DataColumn(label: Text('TaxExempt')),
                          DataColumn(label: Text('TaxZero')),
                          DataColumn(label: Text('Tax15')),
                          DataColumn(label: Text('TaxWT')),
                        ],
                        rows: days
                            .map(
                              (day) {
                                final dayId = day['ID'];
                                return DataRow(
                                cells: [
                                  DataCell(
                                    Checkbox(
                                      value: selectedDay.contains(dayId),
                                      onChanged: (_) => toggleSelection(dayId),
                                    ),
                                  ),
                                  DataCell(Text(day['ID'].toString())),
                                  DataCell(Text(day['FiscalDayNo'].toString())),
                                  DataCell(Text(day['StatusOfFirstReceipt'].toString())),
                                  DataCell(Text(day['FiscalDayOpened'].toString())),
                                  DataCell(Text(day['FiscalDayClosed'].toString())),
                                  DataCell(Text(day['TaxExempt'].toString())),
                                  DataCell(Text(day['TaxZero'].toString())),
                                  DataCell(Text(day['Tax15'].toString())),
                                  DataCell(Text(day['TaxWT'].toString())),
                                ],
                              );
                            })
                            .toList(),
                      ),
                    ),
                  ),
                  const SizedBox(height: 50,),
                  if (selectedDay.isNotEmpty)
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
