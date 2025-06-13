import 'package:flutter/material.dart';

class FindInvoicefield extends StatelessWidget {
  const FindInvoicefield({super.key , required this.controller , this.onChanged});

  final TextEditingController controller;
  final void Function(String)? onChanged;

  @override
  Widget build(BuildContext context){
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20.0),
        color: Colors.grey.shade200,
      ),
      height: 40,
      width: 250,
      padding: const EdgeInsets.only(bottom: 5.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.only(top: 20.0),
            width:  200,
            child: TextFormField(
              decoration: InputDecoration(
              hintText: "Put Invoice Number",
              hintStyle: TextStyle(fontSize: 14,color:  Colors.grey.shade800, fontWeight:  FontWeight.w500),
              errorBorder: const OutlineInputBorder(
                borderRadius: BorderRadius.zero,
                borderSide: BorderSide(color: Colors.red , width: 0.5)
              ),
              focusedBorder: const OutlineInputBorder(
                borderRadius: BorderRadius.zero,
                borderSide: BorderSide(color: Colors.transparent , width: 0.5)
              ),
              focusedErrorBorder: const OutlineInputBorder(
                borderRadius: BorderRadius.zero,
                borderSide: BorderSide(color: Colors.red , width: 0.5)
              ),
              disabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.zero,
                borderSide: BorderSide(color: Colors.grey.shade800 , width: 0.5)
              ),
              enabledBorder: const OutlineInputBorder(
                borderRadius: BorderRadius.zero,
                borderSide: BorderSide(color: Colors.transparent , width: 0.5)
              ),
              border: InputBorder.none
              ),
              controller: controller,
              cursorHeight: 25,
              style: const TextStyle(fontSize:  14, color: Colors.black , fontWeight:FontWeight.w500),
            ),
          ),
          
        ],
      ),
    
    );
  }
}