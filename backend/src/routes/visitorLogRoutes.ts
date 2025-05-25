import express from "express";
import {
    cleanupOldLogs,
    createVisitorLog,
    getAllVisitorLogs,
    getVisitorStats
} from "../controllers/visitorLogController";
import { authMiddleware } from "../middleware";

const router = express.Router();

// Public routes
router.post("/", createVisitorLog);

// Admin routes
router.get("/", authMiddleware, getAllVisitorLogs);
router.get("/stats", authMiddleware, getVisitorStats);
router.delete("/cleanup", authMiddleware, cleanupOldLogs);

export default router; 