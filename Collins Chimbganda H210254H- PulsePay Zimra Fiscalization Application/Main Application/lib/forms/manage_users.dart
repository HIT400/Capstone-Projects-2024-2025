import 'package:flutter/material.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/custom_button.dart';

class ManageUsers extends StatefulWidget {
  const ManageUsers({super.key});
  @override
  State<ManageUsers> createState() => _ManageUsersState();
}

class _ManageUsersState extends State<ManageUsers> {
  final DatabaseHelper dbHelper = DatabaseHelper();
  List<Map<String, dynamic>> users = [];
  List<int> selectedUsers = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchUsers();
  }

  Future<void> fetchUsers() async {
    List<Map<String, dynamic>> data = await dbHelper.getAllUsers();
    setState(() {
      users = data;
      isLoading = false;
    });
  }

  void toggleSelection(int userId) {
    setState(() {
      if (selectedUsers.contains(userId)) {
        selectedUsers.remove(userId);
      } else {
        selectedUsers.add(userId);
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
          : Column(
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
                        DataColumn(label: Text('Real Name')),
                        DataColumn(label: Text('Username')),
                        DataColumn(label: Text('DateCreated')),
                        DataColumn(label: Text('IsActive')),
                      ],
                      rows: users
                          .map(
                            (user) {
                              final userId = user['userId'];
                              return DataRow(
                              cells: [
                                DataCell(
                                  Checkbox(
                                    value: selectedUsers.contains(userId),
                                    onChanged: (_) => toggleSelection(userId),
                                  ),
                                ),
                                DataCell(Text(user['realName'].toString())),
                                DataCell(Text(user['userName'].toString())),
                                DataCell(Text(user['dateCreated'].toString())),
                                DataCell(Text(user['isActive'].toString())),
                              ],
                            );
                          })
                          .toList(),
                    ),
                  ),
                ),
                const SizedBox(height: 50,),
                if (selectedUsers.isNotEmpty)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  CustomOutlineBtn(
                    width: 90,
                    height: 50,
                    text: "View",
                    color:const Color.fromARGB(255, 14, 19, 29),
                    color2: const Color.fromARGB(255, 14, 19, 29),
                    onTap: (){
                      //final i = selectedUsers.first;
                      //fetchSalesForInvoice(invoiceId);
                    },
                  ),
                  CustomOutlineBtn(
                    width: 90,
                    height: 50,
                    text: "Cancel",
                    color:const Color.fromARGB(255, 14, 19, 29),
                    color2: const Color.fromARGB(255, 14, 19, 29) ,
                    onTap: (){
                      //showPasswordPrompt();
                    },
                  ),
                  CustomOutlineBtn(
                    width: 90,
                    height: 50,
                    text: "Edit",
                    color:const Color.fromARGB(255, 14, 19, 29),
                    color2: const Color.fromARGB(255, 14, 19, 29),
                    onTap: (){
                    },
                  ),
                ],
              ),
            ],
          ),

    );
  }
}
