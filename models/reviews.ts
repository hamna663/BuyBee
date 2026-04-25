import mongoose, { Model, Schema } from "mongoose";

export type ReviewType = {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
};

const reviewSchema = new Schema<ReviewType>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    comment: {
      type: String,
      minlength: 10,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Review: Model<ReviewType> =
  mongoose.models.Review || mongoose.model<ReviewType>("Review", reviewSchema);
