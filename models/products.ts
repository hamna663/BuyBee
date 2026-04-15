import mongoose, { Model, Schema } from "mongoose";

type ProductType = {
  name: string;
  description: string;
  price: number;
  stock: number;
  available: boolean;
  averageRating: number;
  createdAt?: Date;
  updatedAt?: Date;
};

const productSchema = new Schema<ProductType>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
    },
    available: {
      type: Boolean,
      default: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const Product: Model<ProductType> =
  mongoose.models.Product ||
  mongoose.model<ProductType>("Product", productSchema);
