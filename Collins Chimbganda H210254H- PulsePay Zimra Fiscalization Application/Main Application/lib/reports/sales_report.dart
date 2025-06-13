import 'dart:collection';

import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/rendering.dart';
import 'package:intl/intl.dart';
import 'package:pulsepay/SQLite/database_helper.dart';

class SalesReportPage extends StatefulWidget {
  const SalesReportPage({super.key});
  @override
  State<SalesReportPage> createState() => _SalesReportPageState();
}

class _SalesReportPageState extends State<SalesReportPage> {
  String selectedPeriod = "Daily"; // Default selection
  List<BarChartGroupData> salesData = [];
  double totalSales = 0.0;
  DatabaseHelper db = DatabaseHelper(); 

  
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context){
    return Scaffold(
      appBar: AppBar(
        title: const Text('7 Day Sales Report'),
        centerTitle: true,
        leading: BackButton(
          onPressed: () {
            Navigator.pop(context);
          },
        ),  
      ),
      body: Center(
        child: Container(
          width: 350,
          height: 400,
          child: SalesLineChart(),
          
        ),
      ),
    );
  }
}

// line chart widget

class SalesLineChart extends StatelessWidget{

  DatabaseHelper db = DatabaseHelper(); 
//   Future<Map<String, double>> getSalesDataForPastSevenDays() async {
//   List<Map<String, dynamic>> receipts = await db.getReceiptsByDate();
//   Map<String, double> salesData = HashMap();

//   DateTime today = DateTime.now();
//   for (int i = 0; i < 7; i++) {
//     DateTime date = today.subtract(Duration(days: i));
//     String abbreviatedDay = DateFormat('EEE').format(date); // Abbreviated day name
//     salesData[abbreviatedDay] = 0.0;
//   }

//   for (var receipt in receipts) {
//     String saleDay = receipt['sale_day'];
//     double totalSales = receipt['total_sales'] ?? 0.0;

//     DateTime saleDate = DateFormat('yyyy-MM-dd').parse(saleDay);
//     String abbreviatedDay = DateFormat('EEE').format(saleDate);

//     if (salesData.containsKey(abbreviatedDay)) {
//       salesData[abbreviatedDay] = totalSales;
//     }
//   }

//   return salesData;
// }
Future<Map<String, double>> getSalesDataForPastSevenDays() async {
  List<Map<String, dynamic>> receipts = await db.getReceiptsByDate();
  Map<String, double> salesData = HashMap();

  DateTime today = DateTime.now();
  List<String> daysOfWeek = [];
  for (int i = 0; i < 7; i++) {
    DateTime date = today.subtract(Duration(days: i));
    String abbreviatedDay = DateFormat('EEE').format(date); 
    daysOfWeek.add(abbreviatedDay);
    salesData[abbreviatedDay] = 0.0;
  }

  for (var receipt in receipts) {
    String saleDay = receipt['sale_day'];
    double totalSales = receipt['total_sales'] ?? 0.0;
    DateTime saleDate = DateFormat('yyyy-MM-dd').parse(saleDay);
    String abbreviatedDay = DateFormat('EEE').format(saleDate);

    if (salesData.containsKey(abbreviatedDay)) {
      salesData[abbreviatedDay] = totalSales;
    }
  }

  // Sort the map by keys to ensure the order is correct
  Map<String, double> sortedSalesData = Map.fromEntries(daysOfWeek.map((day) => MapEntry(day, salesData[day]!)));
  return sortedSalesData;
}
  @override
  Widget build(BuildContext context) {
    return FutureBuilder<Map<String, double>>(
      future: getSalesDataForPastSevenDays(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return Center(child: CircularProgressIndicator());
        } else if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        } else {
          Map<String, double> salesData = snapshot.data!;
          List<String> days = salesData.keys.toList();
          List<double> amounts = salesData.values.toList();

          return LineChart(
            LineChartData(
              gridData: FlGridData(show: true),
              titlesData: FlTitlesData(
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    getTitlesWidget: (value, meta) {
                      return Text(days[value.toInt()]);
                    },
                  ),
                ),
                leftTitles: AxisTitles(
                  sideTitles: SideTitles(showTitles: true),
                ),
                rightTitles: AxisTitles(
                  sideTitles: SideTitles(showTitles: true),
                ),
                topTitles: AxisTitles(
                  sideTitles: SideTitles(showTitles: false),
                ),
              ),
              borderData: FlBorderData(show: true),
              minY: 0,
              lineBarsData: [
                LineChartBarData(
                  spots: List.generate(
                    days.length,
                    (index) => FlSpot(index.toDouble(), amounts[index]),
                  ),
                  isCurved: true,
                  color: Colors.blue,
                  barWidth: 5,
                  dotData: FlDotData(show: false),
                  belowBarData: BarAreaData(show: false),
                ),
              ],
            ),
          );
        }
      },
    );
  }
}