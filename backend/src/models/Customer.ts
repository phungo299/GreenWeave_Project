import mongoose from "mongoose";
import { IUser } from "./User";

export interface ICustomer {
  userId: IUser;
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiresAt?: Date;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
  detailAddress?: string;
}

const CustomerSchema = new mongoose.Schema<ICustomer>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpiresAt: Date,
    address: { type: String, default: "" },
    city: { type: String, default: "" },
    district: { type: String, default: "" },
    ward: { type: String, default: "" },
    detailAddress: { type: String, default: "" },
  },
  { timestamps: true }
);

const Customer = mongoose.model<ICustomer>("Customer", CustomerSchema);
export default Customer;
