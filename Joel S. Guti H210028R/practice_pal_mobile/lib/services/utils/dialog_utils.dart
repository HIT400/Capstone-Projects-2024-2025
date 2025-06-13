import 'package:get/get.dart';
import 'package:practice_pal_mobile/presentation/widgets/dialogs/scores_info_dialog.dart';

import '../../presentation/widgets/dialogs/loading_dialog.dart';

void showLoading({String message = "Please wait"}) {
  Get.focusScope!.unfocus();
  Get.dialog(LoadingDialog(message: message));
}

void closeLoading() {
  if(Get.isDialogOpen!) {
    Get.back();
  }
}

void showScoresInfo() {
  Get.dialog(ScoresInfoDialog());
}