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
  title: string;
  description: string;
  price: number;
  stock: string;
  quantity: number;
  category: string;
  slug: string;
  productCode: string;
  images: string[];
  selectedColor: string;
  selectedSize: string;
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
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    stock: { type: String, default: "Còn hàng" },
    quantity: { type: Number, default: 0 },
    category: { type: String, default: "" },
    slug: { type: String, unique: true, required: true },
    productCode: { type: String, unique: true, required: true },
    images: [{ type: String }],
    selectedColor: { type: String, default: "" },
    selectedSize: { type: String, default: "" },
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
productSchema.index({ name: "text", description: "text", title: "text" });
// Tạo index cho slug và productCode
productSchema.index({ slug: 1 });
productSchema.index({ productCode: 1 });

const Product = mongoose.model<IProduct>("Product", productSchema);

export default Product; 