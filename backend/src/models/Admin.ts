import mongoose from "mongoose";
import { IUser } from "./User";

export interface IAdmin {
  userId: IUser;
  position: string;
  permissions?: string[];
  lastLogin?: Date;
}

const AdminSchema = new mongoose.Schema<IAdmin>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    position: {
      type: String,
      default: "Admin",
    },
    permissions: {
      type: [String],
      default: ["all"],
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Admin = mongoose.model<IAdmin>("Admin", AdminSchema);
export default Admin; 