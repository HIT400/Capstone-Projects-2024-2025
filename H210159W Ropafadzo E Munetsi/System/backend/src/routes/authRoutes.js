
import express from "express";
import {
    register,
    login,
    getUserProfile,
    getAllUsers, 
    updateUserRole,
    deleteUser,
    changePassword,
    forgotPassword,
    resetPassword,
    refreshToken,
    protect
} from "../controllers/authController.js";
import roleMiddleware from "../middlewares/roleMiddleware.js";

const router = express.Router();

// Public routes (no authentication required)
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Protected routes (require authentication)
router.use(protect); // All routes after this middleware require authentication

// Routes accessible to all authenticated users
router.get("/me", getUserProfile);
router.patch("/change-password", changePassword);

// Admin-only routes
router.get("/users", roleMiddleware.isAdmin, getAllUsers);
router.patch("/users/:id/role", roleMiddleware.isAdmin, updateUserRole);
router.delete("/users/:id", roleMiddleware.isAdmin, deleteUser);

export default router;
