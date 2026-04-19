import { connectToDatabase } from "@/config/db";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { Cart, CartType } from "@/models/cart";
import { Order } from "@/models/order";
import { addressSchema } from "@/schemas/order";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const POST = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    const { address } = await req.json();
    const userId = req.headers.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    try {
      const data = await z.parseAsync(addressSchema, address);
      const cart = await Cart.findOne({ userId }).populate("productId");
      if (!cart) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 404 });
      }

      const totalPrice = cart.items.map(
        (item) => Number(item?.product?.price) * item.quantity,
      );

      const order = await Order.create({
        userId,
        address: data,
        items: cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        totalPrice: totalPrice.reduce((a, b) => a + b, 0),
      });
      if (!order) {
        return NextResponse.json(
          { error: "Failed to create order" },
          { status: 500 },
        );
      }
      return NextResponse.json({ message: "Order placed successfully", order });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to create order" },
        { status: 500 },
      );
    }
  },
);

export const GET = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const userId = req.headers.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await connectToDatabase();
    if (
      status !== "pending" &&
      status !== "processing" &&
      status !== "shipped" &&
      status !== "delivered" &&
      status !== "cancelled"
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    try {
      const orders = await Order.find({
        userId,
        ...(status ? { status } : {}),
      }).populate("items.productId");
      if (!orders) {
        return NextResponse.json({ error: "No orders found" }, { status: 404 });
      }
      return NextResponse.json({ orders });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 },
      );
    }
  },
);
