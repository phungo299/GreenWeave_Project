import express from "express";
import {
    changePassword,
    changeUserRole,
    checkEmailWithPhoneNumber,
    checkPhoneNumber,
    createUser,
    forgotPassword,
    getAllUsers,
    getUser,
    resetPassword,
    searchUsers,
    toggleUserStatus,
    updateProfile,
    updateUser,
} from "../controllers/userController";
import { authMiddleware } from "../middleware";

const router = express.Router();

router.get("/", authMiddleware, getUser);
router.get("/all", authMiddleware, getAllUsers);
router.get("/search", authMiddleware, searchUsers);
router.post("/check-phoneNumber", checkPhoneNumber);
router.post("/check-email-with-phoneNumber", checkEmailWithPhoneNumber);

// User management (Admin only)
router.post("/create", authMiddleware, createUser);
router.put("/:userId", authMiddleware, updateUser);
router.patch("/:userId/role", authMiddleware, changeUserRole);

router.patch("/update-profile", authMiddleware, updateProfile);
router.patch("/toggle-status/:userId", authMiddleware, toggleUserStatus);
router.patch("/change-password", authMiddleware, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
