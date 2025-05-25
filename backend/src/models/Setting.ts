import mongoose from "mongoose";

export interface ISetting {
  key: string;
  value: any;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  category: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new mongoose.Schema<ISetting>(
  {
    key: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true 
    },
    value: { 
      type: mongoose.Schema.Types.Mixed, 
      required: true 
    },
    type: {
      type: String,
      enum: ["string", "number", "boolean", "object", "array"],
      required: true
    },
    description: { 
      type: String, 
      default: "" 
    },
    category: { 
      type: String, 
      required: true,
      default: "general"
    },
    isPublic: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

// Indexes
settingSchema.index({ key: 1 });
settingSchema.index({ category: 1 });
settingSchema.index({ isPublic: 1 });

const Setting = mongoose.model<ISetting>("Setting", settingSchema);

export default Setting; 