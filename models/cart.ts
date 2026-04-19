import mongoose, { Model, Schema } from "mongoose";

export type CartType = {
  userId: mongoose.Types.ObjectId;
  items: [
    {
      productId: mongoose.Types.ObjectId;
    },
  ];
  createdAt?: Date;
  updatedAt?: Date;
};

const cartSchema = new Schema<CartType>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Cart: Model<CartType> =
  mongoose.models.Cart || mongoose.model<CartType>("Cart", cartSchema);
