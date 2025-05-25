import mongoose from "mongoose";

export interface IUser {
  username: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: "admin" | "user" | "staff";
  address: any; // Có thể là string, object hoặc array
  rewardPoints: number;
  avatar: string;
  isVerified: boolean;
  isDisabled?: boolean;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  fullName?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: "" },
    role: {
      type: String,
      enum: ["admin", "user", "staff"],
      default: "user",
    },
    address: { 
      type: mongoose.Schema.Types.Mixed, 
      default: "" 
    }, // Hỗ trợ string, object hoặc array
    rewardPoints: { type: Number, default: 0 },
    avatar: { type: String, default: "" },
    fullName: { type: String, default: "" },
    isVerified: { 
      type: Boolean, 
      default: false 
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// Tạo index cho username và email để tối ưu hóa truy vấn
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model<IUser>("User", userSchema);

export default User;