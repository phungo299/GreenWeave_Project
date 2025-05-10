import mongoose, { Schema } from "mongoose";

interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  variantId: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

export interface IOrder {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  totalAmount: number;
  status: "pending" | "shipped" | "delivered" | "cancelled";
  shippingAddress: string;
  paymentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: { 
    type: Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  variantId: { type: String, default: "" },
  color: { type: String, default: "" },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
});

const orderSchema = new Schema<IOrder>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ["pending", "shipped", "delivered", "cancelled"], 
      default: "pending"
    },
    shippingAddress: { type: String, required: true },
    paymentId: { 
      type: Schema.Types.ObjectId, 
      ref: "Payment" 
    },
  },
  { timestamps: true }
);

// Tạo index cho userId để tối ưu hóa truy vấn
orderSchema.index({ userId: 1 });

const Order = mongoose.model<IOrder>("Order", orderSchema);

export default Order; 