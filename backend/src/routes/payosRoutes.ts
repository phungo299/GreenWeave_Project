import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { createPaymentLink, getPaymentInfo, cancelPaymentLink, handleWebhook } from "../controllers/payosController";

const router = Router();

// POST /api/payos/create-payment-link - Tạo link thanh toán PayOS
router.post("/create-payment-link", verifyToken, createPaymentLink);

// GET /api/payos/payment-info/:id - Lấy thông tin thanh toán PayOS
router.get("/payment-info/:id", getPaymentInfo);

// POST /api/payos/cancel-payment/:id - Hủy link thanh toán PayOS
router.post("/cancel-payment/:id", verifyToken, cancelPaymentLink);

// Test routes (no auth for testing)
router.post("/test/create-payment-link", createPaymentLink);

// POST /api/payos/webhook - Webhook PayOS
router.post("/webhook", handleWebhook);

export default router; 