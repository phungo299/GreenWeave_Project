import { Router } from "express";
import {
    cancelOrder,
    createOrder,
    createTestOrder,
    getAllOrders,
    getOrderById,
    getOrderStats,
    getUserOrders,
    searchOrders,
    updateOrderStatus,
    retryPayment
} from "../controllers/orderController";
import { verifyToken } from "../middleware/auth";

const router = Router();

// GET /api/orders - Lấy tất cả đơn hàng (cho admin)
router.get("/", getAllOrders);

// GET /api/orders/stats - Lấy thống kê đơn hàng (cho admin)
router.get("/stats", getOrderStats);

// GET /api/orders/search - Tìm kiếm đơn hàng
router.get("/search", searchOrders);

// GET /api/orders/user/:userId - Lấy đơn hàng của người dùng
router.get("/user/:userId", getUserOrders);

// GET /api/orders/:id - Lấy chi tiết đơn hàng
router.get("/:id", getOrderById);

// POST /api/orders/create - Tạo đơn hàng mới (unified endpoint)
router.post("/create", createOrder);

// POST /api/orders/user/:userId - Tạo đơn hàng mới (legacy endpoint)
router.post("/user/:userId", createOrder);

// POST /api/orders/create-test - Tạo đơn hàng test (không validate products)
router.post("/create-test", createTestOrder);

// PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng
router.put("/:id/status", updateOrderStatus);

// 🚀 NEW: PUT /api/orders/:orderId/cancel - Hủy đơn hàng với atomic transaction
router.put("/:orderId/cancel", cancelOrder);

// POST /api/orders/:id/retry-payment - Tạo link thanh toán lại cho đơn hết hạn
router.post("/:id/retry-payment", verifyToken, retryPayment);

export default router; 