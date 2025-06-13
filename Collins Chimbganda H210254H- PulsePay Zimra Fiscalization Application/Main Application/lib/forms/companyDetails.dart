import 'dart:ffi';

import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:pulsepay/JsonModels/json_models.dart';
import 'package:pulsepay/SQLite/database_helper.dart';
import 'package:pulsepay/common/constants.dart';
import 'package:pulsepay/common/custom_button.dart';
import 'package:pulsepay/common/reusable_text.dart';

class Companydetails extends StatefulWidget {
  const Companydetails({super.key});

  @override
  State<Companydetails> createState() => _CompanydetailsState();
}

class _CompanydetailsState extends State<Companydetails> {

  @override
  void initState() {
    super.initState();
    fetchCompanyDetails();
  }
  final companyID = TextEditingController();
  final company = TextEditingController();
  final logo = TextEditingController();
  final address = TextEditingController();
  final tel = TextEditingController();
  final branchName = TextEditingController();
  final tel2 = TextEditingController();
  final email = TextEditingController();
  final tinNumber = TextEditingController();
  final vatNumber = TextEditingController();
  final vendorNumber = TextEditingController();
  final website = TextEditingController();
  final bank = TextEditingController();
  final bankBranch = TextEditingController();
  final bankAcntName = TextEditingController();
  final bankAcntNo  = TextEditingController();
  final baseCurreny = TextEditingController();
  final backUpLocation = TextEditingController();
  final baseTaxPercentage = TextEditingController();
  final DatabaseHelper dbHelper  = DatabaseHelper();

  List<Map<String, dynamic>> companyDetails = [];

  final db = DatabaseHelper();
  final formKey = GlobalKey<FormState>();

  void clearFields(){
    company.clear();
    logo.clear();
    address.clear();
    tel.clear();
    branchName.clear();
    tel2.clear();
    email.clear();
    tinNumber.clear();
    vatNumber.clear();
    vendorNumber.clear();
    website.clear();
    bank.clear();
    bankBranch.clear();
    bankAcntName.clear();
    bankAcntNo.clear();
    baseCurreny.clear();
    backUpLocation.clear();
    baseTaxPercentage.clear();
  }

  Future<void> fetchCompanyDetails() async {
    List<Map<String, dynamic>> data = await dbHelper.getCompanyDetails();
    setState(() {
      companyDetails = data;
    });
  }

 addCompanyDetails(){
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
                                          const SizedBox(height: 24,),
                      //email address field
                      TextFormField(
                        controller: company,
                        decoration: InputDecoration(
                            labelText: 'Company',
                            labelStyle: TextStyle(color:Colors.grey.shade600 ),
                            filled: true,
                            fillColor: Colors.grey.shade300,
                            border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12.0),
                                borderSide: BorderSide.none
                            )
                        ),
                        style: const TextStyle(color: Colors.black),
                        validator: (value){
                          if(value!.isEmpty){
                            return "Company name is required";
                          }return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      // Password Field
                      TextFormField(
                        controller: logo,
                        decoration: InputDecoration(
                          labelText: 'Logo',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: address,
                        decoration: InputDecoration(
                          labelText: 'Address',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                        
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: tel,
                        decoration: InputDecoration(
                          labelText: 'Tel1',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: branchName,
                        decoration: InputDecoration(
                          labelText: 'Branch Name',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                        validator: (value){
                          if(value!.isEmpty){
                            return "Branch Name Required";
                          }return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: tel2,
                        decoration: InputDecoration(
                          labelText: 'Tel 2',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: email,
                        decoration: InputDecoration(
                          labelText: 'Email',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: tinNumber,
                        decoration: InputDecoration(
                          labelText: 'Tin Number',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                        validator: (value){
                          if(value!.isEmpty){
                            return "Put 1234567890 If N/A";
                          }return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller:vatNumber,
                        decoration: InputDecoration(
                          labelText: 'Vat Number',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                        validator: (value){
                          if(value!.isEmpty){
                            return "Put 123456789 If N/A";
                          }return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: vendorNumber,
                        decoration: InputDecoration(
                          labelText: 'Vendor Number',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: website,
                        decoration: InputDecoration(
                          labelText: 'Website',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: bank,
                        decoration: InputDecoration(
                          labelText: 'Bank',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: bankBranch,
                        decoration: InputDecoration(
                          labelText: 'Bank Branch',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: bankAcntName,
                        decoration: InputDecoration(
                          labelText: 'Bank Account Name',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: baseCurreny,
                        decoration: InputDecoration(
                          labelText: 'Base Currency',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                        validator: (value){
                          if(value!.isEmpty){
                            return "dont leave blank";
                          }return null;
                        },
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: backUpLocation,
                        decoration: InputDecoration(
                          labelText: 'Bank Up Location',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: baseTaxPercentage,
                        decoration: InputDecoration(
                          labelText: 'Base Tax',
                          labelStyle:  TextStyle(color: Colors.grey.shade600),
                          filled: true,
                          fillColor: Colors.grey.shade300,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(12.0),
                            borderSide: BorderSide.none,
                          ),
                        ),
                        style: const TextStyle(color: Colors.black),
                        validator: (value){
                          if(value!.isEmpty){
                            return "dont leave blank";
                          }return null;
                        },
                      ),
                      const SizedBox(height: 20,),
                      // Signup Button
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: () async {
                            if (formKey.currentState!.validate()) {
                              try {
                                final db = DatabaseHelper();
                                await db.addCompanyDetails(CompanyDetails(
                                  company: company.text,
                                  logo: logo.text,
                                  address: address.text,
                                  tel: tel.text,
                                  branchName: branchName.text,
                                  email: email.text,
                                  tinNumber: tinNumber.text,
                                  vatNumber: vatNumber.text,
                                  vendorNumber: vendorNumber.text ,
                                  website: website.text ,
                                  bank:bank.text ,
                                  bankBranch: bankBranch.text,
                                  bankAcntName: bankAcntName.text ,
                                  bankAcntNo: bankAcntNo.text ,
                                  baseCurreny: baseCurreny.text,
                                  backUpLocation: backUpLocation.text,
                                  baseTaxPercentage: baseTaxPercentage.text ,
                                ));
                                // Navigate to the HomePage after successful product addition
                                clearFields();
                                Navigator.pop(context);
                                 Get.snackbar(
                                  "Success",
                                  "Product added successfully",
                                  icon:const Icon(Icons.check),
                                  colorText: Colors.white,
                                  backgroundColor: Colors.green,
                                  snackPosition: SnackPosition.TOP
                                );
                                } catch (e) {
                                  Get.snackbar(
                                    "Error",
                                    "Error adding product: $e",
                                    icon:const Icon(Icons.error),
                                    colorText: Colors.white,
                                    backgroundColor: Colors.red,
                                    snackPosition: SnackPosition.TOP
                                  );
                                }
                            }

                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.blue,
                            padding:const EdgeInsets.symmetric(vertical: 16),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12.0),
                            ),
                          ),
                          child: const Text(
                            'Add Product',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                        ),
                      
                      ),
                      const SizedBox(height: 20,)
                  ],
                
              ),
            ),
          ),
        );
      }
    );
  }
  
  
  Widget build(BuildContext context) {
return Scaffold(
      backgroundColor: const Color.fromARGB(255,255,255,255),
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.white,
        shadowColor: Colors.grey.shade800,
        centerTitle: true,
        title: const ReusableText(text: "Company Details", style: TextStyle(fontWeight: FontWeight.w500 , color: Colors.black)),
        leading: IconButton(onPressed: (){Get.back();}, icon: const Icon(Icons.arrow_back)),
      ),
      body: SingleChildScrollView(
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              child: Padding(
                padding:  const EdgeInsets.symmetric(horizontal: 10.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Image.asset(
                          'assets/Pay.png',
                          height: 50,
                        ),
                      ),
                      const SizedBox(height: 15),
                      const SizedBox(height: 8,),
                      Text(
                        "Enter Details Below To Register Product",
                        style: TextStyle(
                          color: Colors.grey.shade800,
                          fontSize: 16,
                        ),
                      ),
                      const SizedBox(height: 15,),
                      Container(
                        height:350,
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          color: kDark,
                        ) ,
                        child: Padding(
                          padding: const EdgeInsets.only(left: 10.0 ,top: 10.0),
                          child: ListView(
                            children: [
                              Text("COMPNAY NAME: ${companyDetails.isEmpty?"N/A" : companyDetails[0]['company'] } " , style: TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16),),
                              const SizedBox(height: 6,),
                              Text("BRANCH: ${companyDetails.isEmpty? "N/A" : companyDetails[0]['branchName']}" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                              const SizedBox(height: 6,),
                              Text("ADDRESS: ${companyDetails.isEmpty? "N/A" : companyDetails[0]['address'] }" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                              const SizedBox(height: 6,),
                              Text("TEL: ${companyDetails.isEmpty? "N/A" : companyDetails[0]['tel'] } " , style: TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                              const SizedBox(height: 6,),
                              Text("EMAIL: ${companyDetails.isEmpty? "N/A" : companyDetails[0]['email']}" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                              const SizedBox(height: 6,),
                              Text("TIN: ${companyDetails.isEmpty? "N/A" : companyDetails[0]['tinNumber']}" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                              const SizedBox(height: 6,),
                              Text("VAT: ${companyDetails.isEmpty? "N/A" : companyDetails[0]['vatNumber']}" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                              const SizedBox(height: 6,),
                              Text("BANK: ${companyDetails.isEmpty? "N/A" : companyDetails[0]['bank']}" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                              const SizedBox(height: 6,),
                              Text("BRANCH: ${companyDetails.isEmpty? "N/A" : companyDetails[0]['bankBranch']}" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                              const SizedBox(height: 6,),
                              Text("BASE CURRENCY: ${companyDetails.isEmpty? "N/A" : companyDetails[0]['baseCurreny'] }" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                              const SizedBox(height: 6,),
                              Text("BASE TAX: ${companyDetails.isEmpty? "N/A" : companyDetails[0]['baseTaxPercentage']}" , style: TextStyle(color: Colors.white , fontWeight: FontWeight.w500 , fontSize: 16)),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 25,),
                      CustomOutlineBtn(
                        text: "Enter Company Details",
                        height: 50,
                        color: Colors.green,
                        color2: Colors.green,
                        onTap: (){
                          addCompanyDetails();
                        },
                      ),
                      SizedBox(height: 20,),
                      CustomOutlineBtn(
                        text: "Update Company Details",
                        height: 50,
                        color: Colors.green,
                        color2: Colors.green,
                        onTap: (){
                          //Get.to(()=> const Companydetails());
                        },
                      ),
                    ],
                  ),
              ),
            ),
          ),
        ),
      ),
      // floatingActionButton: FloatingActionButton(
      //   onPressed: (){clearFields();},
      //   backgroundColor: kDark,
      //   elevation: 4.0,
      //   child: const Icon(Icons.refresh_rounded , color: Colors.white,),
      // ),
    ); 
  }
}