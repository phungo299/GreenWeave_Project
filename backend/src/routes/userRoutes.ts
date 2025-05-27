import express from "express";
import {
    changePassword,
    changeUserRole,
    checkEmailWithPhoneNumber,
    checkPhoneNumber,
    createUser,
    forgotPassword,
    getAllUsers,
    getAllUsersIncludingAdmin,
    getUser,
    getUserProfile,
    getUserAddresses,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress,
    setDefaultAddress,
    resetPassword,
    searchUsers,
    toggleUserStatus,
    updateProfile,
    updateUser,
} from "../controllers/userController";
import { authMiddleware } from "../middleware";

const router = express.Router();

// Profile routes
router.get("/", authMiddleware, getUser);
router.get("/profile", authMiddleware, getUserProfile);
router.patch("/update-profile", authMiddleware, updateProfile);

// Address routes
router.get("/addresses", authMiddleware, getUserAddresses);
router.post("/addresses", authMiddleware, addUserAddress);
router.put("/addresses/:addressId", authMiddleware, updateUserAddress);
router.delete("/addresses/:addressId", authMiddleware, deleteUserAddress);
router.patch("/addresses/:addressId/default", authMiddleware, setDefaultAddress);

// Admin routes
router.get("/all", authMiddleware, getAllUsers);
router.get("/all-with-admin", authMiddleware, getAllUsersIncludingAdmin);
router.get("/search", authMiddleware, searchUsers);

// Utility routes
router.post("/check-phoneNumber", checkPhoneNumber);
router.post("/check-email-with-phoneNumber", checkEmailWithPhoneNumber);

// User management (Admin only)
router.post("/create", authMiddleware, createUser);
router.put("/:userId", authMiddleware, updateUser);
router.patch("/:userId/role", authMiddleware, changeUserRole);
router.patch("/toggle-status/:userId", authMiddleware, toggleUserStatus);

// Password routes
router.patch("/change-password", authMiddleware, changePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
