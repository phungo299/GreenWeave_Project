import Order from "../models/Order";
import payosService from "../services/payosService";

export const startOrderExpiryJob = () => {
  // Chạy mỗi phút
  setInterval(async () => {
    try {
      const now = new Date();
      const expiredOrders = await Order.find({ status: "pending", expiresAt: { $lte: now } });

      for (const order of expiredOrders) {
        order.status = "expired" as any;
        await order.save();

        // Huỷ link PayOS nếu có
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (order.paymentLinkId) {
          try {
            // order.paymentLinkId chưa lưu, ta sử dụng orderCode sliced from _id as fallback
            const orderCode = parseInt(order._id.toString().slice(-8), 16);
            await payosService.cancelPaymentLink(orderCode.toString());
          } catch (err) {
            console.error("Cancel PayOS link error", err);
          }
        }
        console.log(`Order ${order._id} marked expired at ${now.toISOString()}`);
      }
    } catch (err) {
      console.error("Order expiry job error", err);
    }
  }, 60 * 1000);
}; 