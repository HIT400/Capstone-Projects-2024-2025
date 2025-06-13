import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pulsepay/JsonModels/json_models.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/constants.dart';
import 'package:pulsepay/common/custom_button.dart';

class PaymentMethods extends StatefulWidget {
  const PaymentMethods({super.key});

  @override
  State<PaymentMethods> createState() => _PaymentMethodsState();
}

class _PaymentMethodsState extends State<PaymentMethods> {
  final formKey = GlobalKey<FormState>();
  final DatabaseHelper dbHelper = DatabaseHelper();
  List<Map<String, dynamic>> payMethods = [];
  List<int> selectedMethod = [];
  bool isLoading = true;
  final descriptionController = TextEditingController();
  final rateController = TextEditingController();
  final fiscGroupController = TextEditingController();
  final currencyController = TextEditingController();
  final vatNumberController = TextEditingController();
  final tinController = TextEditingController();

  @override
  void initState() {
    super.initState();
    fetchPayMethods();
  }

  Future<void> fetchPayMethods() async {
    List<Map<String, dynamic>> data = await dbHelper.getPaymentMethods();
    setState(() {
      payMethods = data;
      isLoading = false;
    });
  }

  void toggleSelection(int productId) {
    setState(() {
      if (selectedMethod.contains(productId)) {
        selectedMethod.remove(productId);
      } else {
        selectedMethod.add(productId);
      }
    });
  }

  void deleteByID() async{
    int payMethodID = 9999;
    payMethodID = selectedMethod[0];
    //String methodName = selectedMethod[1].toString();
    if(payMethodID != 9999){
      await  dbHelper.deletePayMethod(payMethodID);
      Get.snackbar("Delete Message", " deleted successfully!!",
        snackPosition: SnackPosition.TOP,
        colorText: Colors.white,
        backgroundColor: Colors.green,
        icon: const Icon(Icons.message_outlined)
      );
    }
  }

  ///=====Add Paymethods=====//////////
  //////////////////////////////////////
  addPaymethods(){
    return showModalBottomSheet(
      isScrollControlled: true,
      isDismissible: false,
      context: context,
      builder: (context){
        return Container(
          height: 600,
          child: Padding(
            padding:  EdgeInsets.only(
              left: 16.0,
              right: 16.0,
              top: 16.0,
              bottom: MediaQuery.of(context).viewInsets.bottom
            ),
            child: Form(
              key: formKey,
              child: ListView(
                scrollDirection: Axis.vertical,
                  children: [
                    Center(
                      child: Container(
                        height: 5,
                        width: 100,
                        decoration: BoxDecoration(
                          color: kDark,
                          borderRadius: BorderRadius.circular(20), 
                        ),
                      ),
                    ),
                    const SizedBox(height: 10,),
                    Row(
                      children: [
                        IconButton(onPressed: (){
                          Navigator.pop(context);
                        }, icon:const Icon(Icons.arrow_circle_left_sharp, size: 40, color: kDark,)),
                        const Center(child: const Text("Customer Details" , style: TextStyle(color: Colors.black,fontSize: 18, fontWeight: FontWeight.w500),)),
                      ],
                    ),
                    SizedBox(height: 10,),
                    TextFormField(
                      controller: descriptionController,
                      decoration: InputDecoration(
                          labelText: 'Description',
                          labelStyle: TextStyle(color:Colors.grey.shade600 ),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12.0),
                              borderSide: BorderSide.none
                          )
                      ),
                    ),
                    const SizedBox(height: 10,),
                    TextFormField(
                      controller: rateController,
                      decoration: InputDecoration(
                          labelText: 'Rate',
                          labelStyle: TextStyle(color:Colors.grey.shade600 ),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12.0),
                              borderSide: BorderSide.none
                          )
                      ),
                      validator: (value){
                          if(value!.isEmpty){
                            return "Rate Required";
                          }return null;
                        },
                    ),
                    const SizedBox(height: 10,),
                    TextFormField(
                      controller: fiscGroupController,
                      decoration: InputDecoration(
                          labelText: 'Fiscal Group',
                          labelStyle: TextStyle(color:Colors.grey.shade600 ),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12.0),
                              borderSide: BorderSide.none
                          )
                      ),
                      validator: (value){
                          if(value!.isEmpty){
                            return "Group Required";
                          }return null;
                        },
                    ),
                    const SizedBox(height: 10,),
                    TextFormField(
                      controller: currencyController,
                      decoration: InputDecoration(
                          labelText: 'Currency',
                          labelStyle: TextStyle(color:Colors.grey.shade600 ),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12.0),
                              borderSide: BorderSide.none
                          )
                      ),
                      validator: (value){
                          if(value!.isEmpty){
                            return "Currency Required";
                          }return null;
                        },
                    ),
                    const SizedBox(height: 10,),
                    TextFormField(
                      controller: vatNumberController ,
                      decoration: InputDecoration(
                          labelText: 'Vat Number',
                          labelStyle: TextStyle(color:Colors.grey.shade600 ),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12.0),
                              borderSide: BorderSide.none
                          )
                      ),
                    ),
                    const SizedBox(height: 10,),
                    
                    TextFormField(
                      controller: tinController ,
                      decoration: InputDecoration(
                          labelText: 'Tin Number',
                          labelStyle: TextStyle(color:Colors.grey.shade600 ),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12.0),
                              borderSide: BorderSide.none
                          )
                      ),
                    ),
                    const SizedBox(height: 10,),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () async{
                          try {
                            if(formKey.currentState!.validate()){
                            final db = DatabaseHelper();
                            await db.addPayMethod(PaymentMethod(
                              description: descriptionController.text,
                              rate: double.parse(rateController.text.trim()),
                              fiscalGroup: int.parse(fiscGroupController.text.trim()),
                              currency: currencyController.text.trim(),
                              vatNumber: vatNumberController.text.trim(),
                              tinNumber: tinController.text.trim(),
                            ));
                            Navigator.pop(context);
                            Get.snackbar(
                              'Success',
                              'Payment Method Saved',
                              snackPosition: SnackPosition.TOP,
                              backgroundColor: Colors.green,
                              colorText: Colors.white
                            );
                            fetchPayMethods();
                          }
                          } catch (e) {
                            Get.snackbar(
                              "Error Saving", "$e",
                              icon:const Icon(Icons.error),
                              colorText: Colors.white,
                              backgroundColor: Colors.red,
                              snackPosition: SnackPosition.TOP
                            );
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.green,
                          padding:const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12.0),
                          ),
                        ),
                        child: const Text(
                          'Save Customer',
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                
              ),
            ),
          ),
        );
      }
    );
  }

  void setDefaultCurrency(int methodId){
    int defaultTag =1;
    try {
      dbHelper.setDefaultCurrency(methodId, defaultTag);
      Get.snackbar(
        "Success", "Default Currency Set",
        icon:const Icon(Icons.check),
        colorText: Colors.white,
        backgroundColor: Colors.green,
        snackPosition: SnackPosition.TOP,
        showProgressIndicator: true,
      );
    } catch (e) {
      Get.snackbar(
        "Error", "$e",
        icon: Icon(Icons.error),
        colorText: Colors.white,
        backgroundColor: Colors.red,
        snackPosition: SnackPosition.TOP
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: const Text("Payment Methods" , style: TextStyle(fontWeight: FontWeight.w500, fontSize: 16 ),),
        centerTitle: true,
        leading: IconButton(onPressed: (){Get.back();}, icon: const Icon(Icons.arrow_back)),
        backgroundColor: Colors.white,
        automaticallyImplyLeading: false,
      ),
      body: SingleChildScrollView(
        scrollDirection: Axis.vertical,
        child: SafeArea(
          child:Padding(
            padding: EdgeInsets.symmetric(horizontal: 10.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CustomOutlineBtn(text: "Add Payment Method", color: Colors.green ,color2: Colors.green, height: 50, onTap: (){addPaymethods();},),
                const SizedBox(height: 25,),
                const Center(child: Text("Available Pay Methods" , style: TextStyle(fontWeight: FontWeight.w500),)),
                const SizedBox(height: 10,),
                isLoading? const Center(child: CircularProgressIndicator(),)
                : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SingleChildScrollView(
                      scrollDirection: Axis.vertical,
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: DataTable(
                          columns: const[
                            DataColumn(label: Text("Select")),
                            DataColumn(label: Text("Description")),
                            DataColumn(label: Text("Rate")),
                            DataColumn(label: Text("Fiscal Group")),
                            DataColumn(label: Text("Currency")),
                            DataColumn(label: Text("VAT Number")),
                            DataColumn(label: Text("TIN Number")),
                            DataColumn(label: Text("default"))
                          ],
                          rows: payMethods.map((paymentMethod){
                            final methodId = paymentMethod['payMethodId'];
                            return DataRow(
                              cells: [
                                DataCell(
                                  Checkbox(
                                    value: selectedMethod.contains(methodId),
                                    onChanged: (_)=> toggleSelection(methodId),
                                  )
                                ),
                                DataCell(Text(paymentMethod['description'].toString())),
                                DataCell(Text(paymentMethod['rate'].toString())),
                                DataCell(Text(paymentMethod['fiscalGroup'].toString())),
                                DataCell(Text(paymentMethod['currency'].toString())),
                                DataCell(Text(paymentMethod['vatNumber'].toString())),
                                DataCell(Text(paymentMethod['tinNumber'].toString())),
                                DataCell(Text(paymentMethod['defaultMethod'].toString()))
                              ]
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                    const SizedBox(height: 50,),
                if (selectedMethod.isNotEmpty)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  CustomOutlineBtn(
                    width: 100,
                    height: 45,
                    text: "Edit",
                    color:const Color.fromARGB(255, 14, 19, 29),
                    color2: const Color.fromARGB(255, 14, 19, 29),
                    onTap: (){
                      //final i = selectedUsers.first;
                      //fetchSalesForInvoice(invoiceId);
                    },
                  ),
                  CustomOutlineBtn(
                    width: 100,
                    height: 45,
                    text: "Delete",
                    color:const Color.fromARGB(255, 14, 19, 29),
                    color2: const Color.fromARGB(255, 14, 19, 29) ,
                    onTap: (){
                      deleteByID();
                    },
                  ),
                  CustomOutlineBtn(
                    width: 100,
                    height: 45,
                    text: "Set Default",
                    color:const Color.fromARGB(255, 14, 19, 29),
                    color2: const Color.fromARGB(255, 14, 19, 29),
                    onTap: (){
                      final methodId = selectedMethod[0];
                      setDefaultCurrency(methodId);
                    },
                  ),
                ],
              ),
                  ],
                )
              ],
            ),
          )
        ),
      ),
    );
  }
}