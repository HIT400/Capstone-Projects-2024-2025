import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class Companysales extends StatefulWidget {
  const Companysales({super.key});

  @override
  State<Companysales> createState() => _CompanysalesState();
}

class _CompanysalesState extends State<Companysales> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: PreferredSize(
        preferredSize: Size.fromHeight(50)
        ,child: AppBar(
          centerTitle: true,
          title: const Text("Company Sales" , style: TextStyle(fontSize: 18, color: Colors.white, fontWeight:  FontWeight.bold),),
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
      body: SingleChildScrollView(
        scrollDirection: Axis.vertical,
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 10.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              SizedBox(height: 20,),
              Container(
                height: 100,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  color: Colors.blue
                ),
                child: Center(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Transactions", style: TextStyle(color: Colors.white, fontSize: 18), textAlign: TextAlign.center,),
                      SizedBox(height: 15,),
                      Text("2040403", style: TextStyle(color: Colors.white, fontSize: 25), textAlign: TextAlign.center,)
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 10,),
              Container(
                height: 100,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  color: Colors.blue
                ),
                child: Center(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text("Total Sales", style: TextStyle(color: Colors.white, fontSize: 18), textAlign: TextAlign.center,),
                      SizedBox(height: 15,),
                      Text("2040403", style: TextStyle(color: Colors.white, fontSize: 25), textAlign: TextAlign.center,)
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20,),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    height: 100,
                    width: 150,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      color: Colors.green
                    ),
                    child: Center(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("ZWG Sales", style: TextStyle(color: Colors.white, fontSize: 18), textAlign: TextAlign.center,),
                          SizedBox(height: 15,),
                          Text("2040403", style: TextStyle(color: Colors.white, fontSize: 25), textAlign: TextAlign.center,)
                        ],
                      ),
                    ),
                  ),
                  Container(
                    width: 150,
                    height: 100,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      color: Colors.green
                    ),
                    child: Center(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text("USD Sales", style: TextStyle(color: Colors.white, fontSize: 18), textAlign: TextAlign.center,),
                          SizedBox(height: 15,),
                          Text("2040403", style: TextStyle(color: Colors.white, fontSize: 25), textAlign: TextAlign.center,)
                        ],
                      ),
                    ),
                  ),  
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}