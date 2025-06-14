import { Request, Response } from "express";
import payosService from "../services/payosService";
import { Order, Payment } from "../models";

export const createPaymentLink = async (req: Request, res: Response) => {
  try {
    const { orderId, amount, description, returnUrl, cancelUrl } = req.body;

    if (!orderId || !amount || !description) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: orderId, amount, description",
        data: null
      });
    }

    const result = await payosService.createPaymentLink({
      orderId,
      amount,
      description,
      returnUrl: returnUrl || `${process.env.FRONTEND_URL}/payment/success`,
      cancelUrl: cancelUrl || `${process.env.FRONTEND_URL}/payment/cancel`
    });

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Payment link created successfully",
        data: result.data
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error,
        data: null
      });
    }
  } catch (error: any) {
    console.error("Create payment link error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      data: null
    });
  }
};

export const getPaymentInfo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
        data: null
      });
    }

    const result = await payosService.getPaymentInfo(id);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Payment info retrieved successfully",
        data: result.data
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error,
        data: null
      });
    }
  } catch (error: any) {
    console.error("Get payment info error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      data: null
    });
  }
};

export const cancelPaymentLink = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Payment ID is required",
        data: null
      });
    }

    const result = await payosService.cancelPaymentLink(id);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Payment link cancelled successfully",
        data: result.data
      });
    } else {
      return res.status(400).json({
        success: false,
        message: result.error,
        data: null
      });
    }
  } catch (error: any) {
    console.error("Cancel payment link error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
      data: null
    });
  }
};

export const handleWebhook = async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-payos-signature'] as string;
    const webhookBody = JSON.stringify(req.body);

    // Verify webhook signature
    if (!payosService.verifyWebhookSignature(webhookBody, signature)) {
      console.error("Invalid PayOS webhook signature");
      return res.status(401).json({
        success: false,
        message: "Invalid signature"
      });
    }

    const { data } = req.body;
    const { orderCode, status, amount } = data;

    console.log(`PayOS Webhook received: orderCode=${orderCode}, status=${status}, amount=${amount}`);

    // Find order by orderCode (we need to map this back to our orderId)
    // Since we used orderId.slice(-8) to generate orderCode, we need to find the order
    const orders = await Order.find({ status: "pending" }).populate("paymentId");
    
    let targetOrder = null;
    for (const order of orders) {
      const generatedOrderCode = parseInt(order._id.toString().slice(-8), 16);
      if (generatedOrderCode === orderCode) {
        targetOrder = order;
        break;
      }
    }

    if (!targetOrder) {
      console.error(`Order not found for orderCode: ${orderCode}`);
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    // Update order and payment status based on PayOS status
    if (status === "PAID") {
      // Update order status
      targetOrder.status = "confirmed";
      await targetOrder.save();

      // Update payment status if exists
      if (targetOrder.paymentId) {
        const payment = await Payment.findById(targetOrder.paymentId);
        if (payment) {
          payment.status = "completed";
          payment.transactionId = orderCode.toString();
          await payment.save();
        }
      }

      console.log(`Order ${targetOrder._id} marked as confirmed (PAID)`);
    } else if (status === "CANCELLED") {
      targetOrder.status = "cancelled";
      await targetOrder.save();

      if (targetOrder.paymentId) {
        const payment = await Payment.findById(targetOrder.paymentId);
        if (payment) {
          payment.status = "failed";
          await payment.save();
        }
      }

      console.log(`Order ${targetOrder._id} marked as cancelled`);
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully"
    });
  } catch (error: any) {
    console.error("PayOS webhook error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
}; 