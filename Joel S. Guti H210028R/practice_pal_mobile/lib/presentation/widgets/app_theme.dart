import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:practice_pal_mobile/consts/colors.dart';
import 'package:practice_pal_mobile/consts/values.dart';

import '../../consts/styles.dart';

class AppTheme extends StatelessWidget {
  final Widget page;

  const AppTheme(this.page, {super.key});

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      showSemanticsDebugger: false,
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: AppColors.tertiary),
          useMaterial3: true,
          shadowColor: Get.theme.scaffoldBackgroundColor,
          appBarTheme: AppBarTheme(
              iconTheme: IconThemeData(color: Colors.white),
              actionsIconTheme: IconThemeData(color: AppColors.secondary),
              backgroundColor: AppColors.primary,
              titleTextStyle: GoogleFonts.poppins(
                  textStyle:
                      TextStyle(fontWeight: FontWeight.w700, fontSize: 30))),
          textTheme: TextTheme(
            displayLarge: Styles.displayLarge,
            displayMedium: Styles.displayMedium,
            displaySmall: Styles.displaySmall,
            headlineLarge: Styles.headlineLarge,
            headlineMedium: Styles.headlineMedium,
            headlineSmall: Styles.headlineSmall,
            titleLarge: Styles.titleLarge,
            titleMedium: Styles.titleMedium,
            titleSmall: Styles.titleSmall,
            bodyLarge: Styles.bodyLarge,
            bodyMedium: Styles.bodyMedium,
            bodySmall: Styles.bodySmall,
            labelLarge: Styles.labelLarge,
            labelMedium: Styles.labelMedium,
            labelSmall: Styles.labelSmall,
          ),
          inputDecorationTheme: InputDecorationTheme(
            floatingLabelStyle: const TextStyle(color: AppColors.secondary),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          ),
          navigationBarTheme: NavigationBarThemeData(
              labelBehavior:
                  NavigationDestinationLabelBehavior.onlyShowSelected,
              iconTheme: WidgetStatePropertyAll(
                  IconThemeData(color: AppColors.primary))),
          bottomNavigationBarTheme: BottomNavigationBarThemeData(
            elevation: 10,
            unselectedIconTheme: const IconThemeData(color: Colors.grey),
            selectedIconTheme: IconThemeData(color: AppColors.primary),
            showSelectedLabels: true,
          ),
          floatingActionButtonTheme: FloatingActionButtonThemeData(
              shape: const CircleBorder(),
              backgroundColor: AppColors.secondary,
              foregroundColor: Colors.white),
          listTileTheme: ListTileThemeData(
              iconColor: Colors.grey[700],
              tileColor: Colors.transparent,
              titleTextStyle: Styles.titleMedium),
          iconTheme: IconThemeData(color: Colors.black87),
          bottomSheetTheme:
              const BottomSheetThemeData(backgroundColor: Colors.transparent),
          popupMenuTheme: PopupMenuThemeData(
              color: Colors.white,
              labelTextStyle: WidgetStatePropertyAll(Styles.bodyMedium)),
          filledButtonTheme: FilledButtonThemeData(
              style: FilledButton.styleFrom(
                  backgroundColor: AppColors.secondary,
                  shape: AppValues.shape)),
          elevatedButtonTheme: ElevatedButtonThemeData(
              style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  iconColor: Colors.white,
                  foregroundColor: Colors.white,
                  shape: AppValues.shape)),
          outlinedButtonTheme: OutlinedButtonThemeData(
              style: OutlinedButton.styleFrom(shape: AppValues.shape)),
          textButtonTheme: TextButtonThemeData(
              style: TextButton.styleFrom(shape: AppValues.shape)),
          dialogTheme: DialogThemeData(shape: AppValues.shape),
          cardTheme: CardTheme(color: Colors.white),
          tabBarTheme: TabBarTheme(
            unselectedLabelColor: Colors.grey,
            unselectedLabelStyle: Styles.bodySmall,
            labelColor: AppColors.primary,
            indicatorColor: AppColors.primary,
            // dividerHeight: 10,
            labelStyle: Styles.bodySmall.copyWith(fontWeight: FontWeight.w700),
          )),
      home: page,
    );
  }
}
