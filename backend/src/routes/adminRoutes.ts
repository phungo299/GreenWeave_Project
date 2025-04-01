import express from "express";
import {
    getAdminById,
    getAllAdmins,
    getTotalAdmins,
    updateAdminById,
} from "../controllers/adminController";
import { verifyAdmin, verifyToken } from "../middleware/auth";

const router = express.Router();

// Lấy tất cả admin
router.get("/", verifyToken, verifyAdmin, getAllAdmins);

// Lấy admin theo ID
router.get("/:adminId", verifyToken, verifyAdmin, getAdminById);

// Cập nhật admin theo ID
router.put("/:adminId", verifyToken, verifyAdmin, updateAdminById);

// Lấy tổng số admin
router.get("/count/total", verifyToken, verifyAdmin, getTotalAdmins);

export default router; 