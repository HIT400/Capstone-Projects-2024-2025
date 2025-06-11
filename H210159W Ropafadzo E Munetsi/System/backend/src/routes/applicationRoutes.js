import express from "express";
import { createApplication, deleteApplication, getAllApplications, getApplicationById } from "../controllers/applicationController.js";
import validateRequest from "../middlewares/inputValidatorMiddleware.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Application routes
router.post("/", createApplication);
router.get("/", getAllApplications);
router.get("/:id", getApplicationById);
router.delete("/:id", deleteApplication);

export default router;