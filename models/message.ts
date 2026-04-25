import mongoose, { Model, Schema } from "mongoose";

export type MessageType = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const messageSchema = new Schema<MessageType>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Message: Model<MessageType> =
  mongoose.models.Message ||
  mongoose.model<MessageType>("Message", messageSchema);
