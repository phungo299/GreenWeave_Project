import express from "express";
import {
  createPaymentIntent,
  handlePaymentSuccess,
  handlePaymentFailure
} from "../controllers/stripeController";
import { verifyToken } from "../middleware/auth";

const router = express.Router();

// Định tuyến cho thanh toán Stripe
router.post("/create-payment-intent", verifyToken, createPaymentIntent);
router.post("/payment-success", verifyToken, handlePaymentSuccess);
router.post("/payment-failure", verifyToken, handlePaymentFailure);

export default router; 