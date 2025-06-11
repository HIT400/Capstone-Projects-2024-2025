import express from "express";
import {
  getAllPayments,
  getUserPayments,
  getApplicationPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
  downloadInvoice,
  deletePayment,
  initiatePaynow,
  handlePaynowUpdate,
  checkPaynowStatus
} from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";
import upload from "../config/multerConfig.js";

const router = express.Router();

// PayNow update route (no auth required - called by PayNow)
router.post("/paynow/update", handlePaynowUpdate);

// Protect all other routes
router.use(protect);

// User routes
router.get("/user", getUserPayments);
router.get("/application/:applicationId", getApplicationPayments);
router.get("/:id", getPaymentById);
router.post("/", upload.single('invoice'), createPayment);
router.get("/:id/invoice", downloadInvoice);

// PayNow routes (protected)
router.post("/paynow/initiate", initiatePaynow);
router.get("/paynow/status/:id", checkPaynowStatus);

// Admin routes
router.get("/", roleMiddleware.isAdmin, getAllPayments);
router.put("/:id/status", roleMiddleware.isAdmin, updatePaymentStatus);
router.delete("/:id", roleMiddleware.isAdmin, deletePayment);

export default router;
