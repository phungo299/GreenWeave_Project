import mongoose, { Schema } from "mongoose";

interface ICartItem {
  _id?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantId: string;
  color: string;
  quantity: number;
}

export interface ICart {
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>({
  productId: { 
    type: Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  variantId: { type: String, default: "" },
  color: { type: String, default: "" },
  quantity: { type: Number, required: true, min: 1 },
});

const cartSchema = new Schema<ICart>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    items: [cartItemSchema],
  },
  { timestamps: true }
);

// Tạo index cho userId để tối ưu hóa truy vấn
cartSchema.index({ userId: 1 });

const Cart = mongoose.model<ICart>("Cart", cartSchema);

export default Cart; 