import mongoose, { Model, Schema } from "mongoose";

type CartType = {
  userId: mongoose.Types.ObjectId;
  items: [
    {
      productId: mongoose.Types.ObjectId;
      quantity: number;
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
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Cart: Model<CartType> =
  mongoose.models.Cart || mongoose.model<CartType>("", cartSchema);
