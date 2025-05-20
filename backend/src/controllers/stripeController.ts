import { Request, Response } from "express";
import Stripe from "stripe";
import Order from "../models/Order";
import Payment from "../models/Payment";
import Notification from "../models/Notification";
import mongoose from "mongoose";
import { ValidationError } from "../errors/validationError";

// Khởi tạo stripe với secret key từ biến môi trường
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

/**
 * Tạo Stripe payment intent 
 */
export const createPaymentIntent = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { orderId, amount } = req.body;
    
    if (!orderId || !amount) {
      throw new ValidationError({ message: "Missing required fields: orderId, amount" });
    }
    
    // Xác thực orderId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ValidationError({ message: "Invalid order ID format" });
    }
    
    // Kiểm tra đơn hàng
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      throw new ValidationError({ message: "Order not found" });
    }
    
    // Kiểm tra xem đơn hàng có thanh toán hoàn tất chưa
    if (order.paymentId) {
      const existingPayment = await Payment.findById(order.paymentId).session(session);
      if (existingPayment && existingPayment.status === "completed") {
        throw new ValidationError({ message: "Order is already paid" });
      }
    }
    
    // Tạo payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Stripe yêu cầu số nguyên
      currency: "vnd", // Đơn vị tiền tệ Việt Nam
      metadata: {
        orderId: orderId,
      },
      // Không cần confirm ngay lập tức, sẽ confirm ở phía client
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    // Tạo thanh toán tạm thời trong DB
    const newPayment = new Payment({
      orderId,
      amount,
      paymentMethod: "credit_card",
      status: "pending"
    });
    
    const savedPayment = await newPayment.save({ session });
    
    // Cập nhật paymentId trong order
    order.paymentId = savedPayment._id;
    await order.save({ session });
    
    await session.commitTransaction();
    
    // Trả về client id và secret để xác thực thanh toán
    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentId: savedPayment._id
    });
    
  } catch (error: any) {
    await session.abortTransaction();
    
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error("Stripe payment intent error:", error);
    return res.status(500).json({ 
      error: "Failed to create payment intent",
      details: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * Xử lý khi thanh toán thành công
 */
export const handlePaymentSuccess = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { paymentIntentId, paymentId } = req.body;
    
    if (!paymentIntentId || !paymentId) {
      throw new ValidationError({ message: "Missing required fields: paymentIntentId, paymentId" });
    }
    
    // Kiểm tra payment intent với Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status !== "succeeded") {
      throw new ValidationError({ message: "Payment intent not succeeded" });
    }
    
    // Cập nhật payment trong DB
    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) {
      throw new ValidationError({ message: "Payment not found" });
    }
    
    payment.status = "completed";
    await payment.save({ session });
    
    // Cập nhật order
    const order = await Order.findById(payment.orderId).session(session);
    if (order) {
      order.status = "pending";
      await order.save({ session });
      
      // Tạo thông báo
      const notification = new Notification({
        userId: order.userId,
        orderId: order._id,
        type: "order_update",
        message: `Your order #${order._id} has been paid successfully and is being processed.`,
        status: "unread"
      });
      
      await notification.save({ session });
    }
    
    await session.commitTransaction();
    
    return res.status(200).json({ 
      success: true,
      message: "Payment processed successfully"
    });
    
  } catch (error: any) {
    await session.abortTransaction();
    
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error("Payment success handling error:", error);
    return res.status(500).json({ 
      error: "Failed to process payment success",
      details: error.message
    });
  } finally {
    session.endSession();
  }
};

/**
 * Xử lý khi thanh toán thất bại
 */
export const handlePaymentFailure = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { paymentIntentId, paymentId, errorMessage } = req.body;
    
    if (!paymentId) {
      throw new ValidationError({ message: "Missing required field: paymentId" });
    }
    
    // Cập nhật payment trong DB
    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) {
      throw new ValidationError({ message: "Payment not found" });
    }
    
    payment.status = "failed";
    await payment.save({ session });
    
    // Tạo thông báo
    const order = await Order.findById(payment.orderId).session(session);
    if (order) {
      const notification = new Notification({
        userId: order.userId,
        orderId: order._id,
        type: "order_update",
        message: `Payment for order #${order._id} failed. ${errorMessage || 'Please try again.'}`,
        status: "unread"
      });
      
      await notification.save({ session });
    }
    
    await session.commitTransaction();
    
    return res.status(200).json({ 
      success: true,
      message: "Payment failure recorded"
    });
    
  } catch (error: any) {
    await session.abortTransaction();
    
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error("Payment failure handling error:", error);
    return res.status(500).json({ 
      error: "Failed to process payment failure",
      details: error.message
    });
  } finally {
    session.endSession();
  }
}; 