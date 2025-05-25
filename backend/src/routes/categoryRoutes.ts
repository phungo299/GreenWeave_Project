import express from "express";
import {
    createCategory,
    deleteCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    searchCategories,
    getProductsByCategory
} from "../controllers/categoryController";
import { verifyToken, verifyAdmin } from "../middleware/auth";

const router = express.Router();

// GET /api/categories - Lấy tất cả danh mục (public)
router.get("/", getAllCategories);

// GET /api/categories/search - Tìm kiếm danh mục (public)
router.get("/search", searchCategories);

// GET /api/categories/:id/products - Lấy sản phẩm theo danh mục (public)
router.get("/:id/products", getProductsByCategory);

// GET /api/categories/:id - Lấy chi tiết danh mục (public)
router.get("/:id", getCategoryById);

// POST /api/categories - Tạo danh mục mới (admin only)
router.post("/", verifyToken, verifyAdmin, createCategory);

// PUT /api/categories/:id - Cập nhật danh mục (admin only)
router.put("/:id", verifyToken, verifyAdmin, updateCategory);

// DELETE /api/categories/:id - Xóa danh mục (admin only)
router.delete("/:id", verifyToken, verifyAdmin, deleteCategory);

export default router; 