import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { createPaymentLink, getPaymentInfo, cancelPaymentLink, handleWebhook } from "../controllers/payosController";

const router = Router();

// PayOS routes (with auth)
router.post("/create-payment-link", verifyToken, createPaymentLink);
router.get("/payment-info/:id", verifyToken, getPaymentInfo);
router.post("/cancel-payment/:id", verifyToken, cancelPaymentLink);

// Test routes (no auth for testing)
router.post("/test/create-payment-link", createPaymentLink);

// Webhook (no auth)
router.post("/webhook", handleWebhook);

export default router; 