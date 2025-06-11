import express from "express";
import {
    getAllDistricts,
    getDistrictById,
    createDistrict,
    updateDistrict,
    deleteDistrict
} from "../controllers/districtController.js";
import { protect } from "../middlewares/authMiddleware.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Public route - no authentication required
router.get("/", getAllDistricts);
router.get("/:id", getDistrictById);

// Protected routes - require authentication and admin role
router.use(protect);
router.use(roleMiddleware.isAdmin);

router.post("/", createDistrict);
router.put("/:id", updateDistrict);
router.delete("/:id", deleteDistrict);

export default router;
