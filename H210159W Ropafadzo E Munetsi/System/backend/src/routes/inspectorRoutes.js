import express from "express";
import {getAllInspectors, createInspector, getInspector, deleteInspector, updateInspector} from "../controllers/inspectorController.js";
import { protect } from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Admin-only routes
router.post("/", roleMiddleware.isAdmin, createInspector);
router.put("/inspector/:id", roleMiddleware.isAdmin, updateInspector);
router.delete("/:id", roleMiddleware.isAdmin, deleteInspector);

// Public routes (accessible to all authenticated users)
router.get("/", getAllInspectors);
router.get("/:id", getInspector);

export default router;