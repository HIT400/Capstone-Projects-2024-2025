import express from "express";
import {
  getAllSchedules,
  getSchedulesByApplication,
  getSchedulesByInspector,
  getScheduleById,
  findAvailableInspector,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  getSchedulesByUser,
  completeInspection
} from "../controllers/inspectionScheduleController.js";
import { protect } from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Routes accessible to all authenticated users
router.get("/find-available-inspector", findAvailableInspector);
router.get("/user/applications", getSchedulesByUser);

// Application-specific routes
router.get("/application/:applicationId", getSchedulesByApplication);

// Inspector-specific routes
router.get("/inspector/:inspectorId", getSchedulesByInspector);
router.post("/:id/complete", roleMiddleware.isInspector, completeInspection);

// Individual schedule routes
router.get("/:id", getScheduleById);

// Routes that modify data
router.post("/", createSchedule);
router.put("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);

// Admin-only routes
router.get("/", roleMiddleware.isAdmin, getAllSchedules);

export default router;
