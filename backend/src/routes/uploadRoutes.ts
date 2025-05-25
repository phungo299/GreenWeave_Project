import express from "express";
import {
    uploadImage,
    uploadAvatar,
    uploadProductImage,
    uploadMultipleImages,
    deleteImage,
    uploadMiddleware
} from "../controllers/uploadController";
import { authMiddleware } from "../middleware";

const router = express.Router();

// Single image upload
router.post("/image", uploadMiddleware.single, uploadImage);

// Avatar upload
router.post("/avatar", uploadMiddleware.single, uploadAvatar);

// Product image upload
router.post("/product-image", uploadMiddleware.single, uploadProductImage);

// Multiple images upload
router.post("/multiple-images", uploadMiddleware.multiple, uploadMultipleImages);

// Delete image
router.delete("/delete-image", deleteImage);

export default router; 