import express from "express";
import {
    getAllStages,
    getStageById,
    getStageRequirements,
    getApplicationProgress,
    getCurrentStage,
    getRequirementCompletion,
    checkStageCompletion,
    updateRequirementStatus,
    moveToNextStage,
    getUserApplicationsWithStages,
    getApplicationDetails
} from "../controllers/applicationStageController.js";
import { protect } from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Protect all routes
router.use(protect);

// Public routes (accessible to all authenticated users)
router.get("/stages", getAllStages);
router.get("/stages/:id", getStageById);
router.get("/stages/:stageId/requirements", getStageRequirements);

// Application-specific routes
router.get("/applications/:applicationId/progress", getApplicationProgress);
router.get("/applications/:applicationId/current-stage", getCurrentStage);
router.get("/applications/:applicationId/requirements", getRequirementCompletion);
router.get("/applications/:applicationId/stages/:stageId/completion", checkStageCompletion);
router.get("/applications/:applicationId/details", getApplicationDetails);

// User-specific routes
router.get("/user/applications", getUserApplicationsWithStages);
router.get("/user/:userId/applications", roleMiddleware.isAdmin, getUserApplicationsWithStages);

// Routes that modify data
router.patch("/applications/:applicationId/requirements/:requirementId", updateRequirementStatus);
router.post("/applications/:applicationId/next-stage", roleMiddleware.isAdmin, moveToNextStage);

export default router;
