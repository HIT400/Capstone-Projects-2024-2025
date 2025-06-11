import express from 'express';
import {
    getAllInspectionTypes,
    getInspectionTypeById,
    createInspectionType,
    updateInspectionType,
    deleteInspectionType
} from '../controllers/inspectionTypeController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Protected routes - require authentication
router.use(protect);

// Routes for all authenticated users
router.get('/', getAllInspectionTypes);
router.get('/:id', getInspectionTypeById);

// Routes for admins only
router.post('/', restrictTo('admin', 'superadmin'), createInspectionType);
router.put('/:id', restrictTo('admin', 'superadmin'), updateInspectionType);
router.delete('/:id', restrictTo('admin', 'superadmin'), deleteInspectionType);

export default router;
