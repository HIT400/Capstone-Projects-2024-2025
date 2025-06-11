import express from 'express';
import {
    getInspectionStagesByApplicationId,
    getUserApplicationsWithStages,
    updateInspectionStage,
    createInspectionStage
} from '../controllers/inspectionStagesController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Routes for all authenticated users
router.get('/application/:applicationId', getInspectionStagesByApplicationId);
router.get('/user/applications', getUserApplicationsWithStages);

// Routes for inspectors and admins
router.put('/:stageId', restrictTo('inspector', 'admin'), updateInspectionStage);
router.post('/', restrictTo('inspector', 'admin'), createInspectionStage);

export default router;
