import express from "express";
import {
    createSetting,
    deleteSetting,
    getAllSettings,
    getPublicSettings,
    getSettingByKey,
    getSettingCategories,
    updateSetting
} from "../controllers/settingController";
import { authMiddleware } from "../middleware";

const router = express.Router();

// Public routes
router.get("/public", getPublicSettings);

// Admin routes
router.get("/", authMiddleware, getAllSettings);
router.get("/categories", authMiddleware, getSettingCategories);
router.get("/:key", authMiddleware, getSettingByKey);
router.post("/", authMiddleware, createSetting);
router.put("/:key", authMiddleware, updateSetting);
router.delete("/:key", authMiddleware, deleteSetting);

export default router; 