import express from "express";
import {
    createProduct,
    deleteProduct,
    getFeaturedProducts,
    getProductById,
    getProducts,
    searchProducts,
    updateProduct,
    getProductBySlug
} from "../controllers/productController";
import { verifyToken, verifyAdmin } from "../middleware/auth";

const router = express.Router();

// GET /api/products - Lấy tất cả sản phẩm (public)
router.get("/", getProducts);

// GET /api/products/search - Tìm kiếm sản phẩm (public)
router.get("/search", searchProducts);

// GET /api/products/featured - Lấy sản phẩm nổi bật (public)
router.get("/featured", getFeaturedProducts);

// GET /api/products/slug/:slug - Lấy sản phẩm theo slug (public)
router.get("/slug/:slug", getProductBySlug);

// GET /api/products/:id - Lấy chi tiết sản phẩm (public)
router.get("/:id", getProductById);

// POST /api/products - Tạo sản phẩm mới (admin only)
router.post("/", verifyToken, verifyAdmin, createProduct);

// PUT /api/products/:id - Cập nhật sản phẩm (admin only)
router.put("/:id", verifyToken, verifyAdmin, updateProduct);

// DELETE /api/products/:id - Xóa sản phẩm (admin only)
router.delete("/:id", verifyToken, verifyAdmin, deleteProduct);

export default router; 