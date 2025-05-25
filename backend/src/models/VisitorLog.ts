import mongoose from "mongoose";

export interface IVisitorLog {
  ipAddress: string;
  userAgent: string;
  referer?: string;
  path: string;
  method: string;
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
  visitedAt: Date;
}

const visitorLogSchema = new mongoose.Schema<IVisitorLog>(
  {
    ipAddress: { 
      type: String, 
      required: true 
    },
    userAgent: { 
      type: String, 
      required: true 
    },
    referer: { 
      type: String, 
      default: "" 
    },
    path: { 
      type: String, 
      required: true 
    },
    method: { 
      type: String, 
      required: true,
      enum: ["GET", "POST", "PUT", "DELETE", "PATCH"]
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",
      default: null 
    },
    sessionId: { 
      type: String, 
      default: "" 
    },
    country: { 
      type: String, 
      default: "" 
    },
    city: { 
      type: String, 
      default: "" 
    },
    device: { 
      type: String, 
      default: "" 
    },
    browser: { 
      type: String, 
      default: "" 
    },
    os: { 
      type: String, 
      default: "" 
    },
    visitedAt: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true }
);

// Indexes
visitorLogSchema.index({ ipAddress: 1 });
visitorLogSchema.index({ userId: 1 });
visitorLogSchema.index({ visitedAt: -1 });
visitorLogSchema.index({ path: 1 });
visitorLogSchema.index({ country: 1 });

const VisitorLog = mongoose.model<IVisitorLog>("VisitorLog", visitorLogSchema);

export default VisitorLog; 