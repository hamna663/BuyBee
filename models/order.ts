import { Address } from "cluster";
import mongoose, { Schema, Model } from "mongoose";

type AddressType = {
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
};

type OrderType = {
  userId: mongoose.Types.ObjectId;
  items: [
    {
      productId: mongoose.Types.ObjectId;
      quantity: number;
    },
  ];
  address: AddressType;
  status: string;
  totalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
};

const addressSchema = new Schema<AddressType>({
  street: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  zipcode: {
    type: String,
    required: true,
  },
});

const orderSchema = new Schema<OrderType>(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    address: {
      type: addressSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Order: Model<OrderType> =
  mongoose.models.Order || mongoose.model<OrderType>("Order", orderSchema);
