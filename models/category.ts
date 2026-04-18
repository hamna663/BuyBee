import mongoose, { Model, Schema } from "mongoose";

type CategoryType = {
  name: string;
  description: string;
  images: string[];
  createdAt?: Date;
  updatedAt?: Date;
};
const categorySchema = new Schema<CategoryType>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);
export const Category: Model<CategoryType> =
  mongoose.models.Category ||
  mongoose.model<CategoryType>("Category", categorySchema);
