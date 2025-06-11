import express from "express";
import {
  getAllPaymentSettings,
  getPaymentSettingByType,
  createPaymentSetting,
  updatePaymentSetting,
  deletePaymentSetting
} from "../controllers/paymentSettingsController.js";
import { protect } from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Public routes (accessible to all authenticated users)
router.get("/type/:type", getPaymentSettingByType);

// Admin-only routes
router.get("/", roleMiddleware.isAdmin, getAllPaymentSettings);
router.post("/", roleMiddleware.isAdmin, createPaymentSetting);
router.put("/:id", roleMiddleware.isAdmin, updatePaymentSetting);
router.delete("/:id", roleMiddleware.isAdmin, deletePaymentSetting);

export default router;
