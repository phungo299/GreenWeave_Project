import mongoose, { Schema } from "mongoose";

interface IVariant {
  variantId: string;
  color: string;
  imageUrl: string;
  stock: number;
}

interface IPriceHistory {
  price: number;
  updatedAt: Date;
}

export interface IProduct {
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  stock: number;
  variants: IVariant[];
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  priceHistory: IPriceHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const variantSchema = new Schema<IVariant>({
  variantId: { type: String, required: true },
  color: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  stock: { type: Number, default: 0 },
});

const priceHistorySchema = new Schema<IPriceHistory>({
  price: { type: Number, required: true },
  updatedAt: { type: Date, default: Date.now },
});

const productSchema = new Schema<IProduct>(
  {
    categoryId: { 
      type: Schema.Types.ObjectId, 
      ref: "Category", 
      required: true 
    },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    variants: [variantSchema],
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    priceHistory: [priceHistorySchema],
  },
  { timestamps: true }
);

// Tạo index cho categoryId để tối ưu hóa truy vấn
productSchema.index({ categoryId: 1 });
// Tạo index cho tìm kiếm theo tên sản phẩm
productSchema.index({ name: "text", description: "text" });

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product; 