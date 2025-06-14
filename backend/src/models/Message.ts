import mongoose, { Schema } from "mongoose";

export interface IMessage {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  phone?: string;
  subject?: string;
}

const messageSchema = new Schema<IMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    phone: { type: String },
    subject: { type: String },
  },
  { timestamps: true }
);

const Message = mongoose.model<IMessage>("Message", messageSchema);

export default Message; 