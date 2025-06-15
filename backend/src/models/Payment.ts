import mongoose, { Schema } from "mongoose";

export interface IPayment {
  orderId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: "CREDIT_CARD" | "PAYPAL" | "BANK_TRANSFER" | "COD" | "PAYOS";
  status: "pending" | "completed" | "failed" | "cancelled";
  transactionId?: string;
  payosOrderCode?: string; // For PayOS payment link cancellation
  createdAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { 
      type: Schema.Types.ObjectId, 
      ref: "Order", 
      required: true 
    },
    amount: { type: Number, required: true },
    paymentMethod: { 
      type: String, 
      enum: ["CREDIT_CARD", "PAYPAL", "BANK_TRANSFER", "COD", "PAYOS"], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["pending", "completed", "failed", "cancelled"], 
      default: "pending"
    },
    transactionId: { type: String },
    payosOrderCode: { type: String }, // For PayOS payment link cancellation
  },
  { timestamps: true }
);

// Tạo index cho orderId để tối ưu hóa truy vấn
paymentSchema.index({ orderId: 1 });

const Payment = mongoose.model<IPayment>("Payment", paymentSchema);

export default Payment; 