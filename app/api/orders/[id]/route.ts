import { connectToDatabase } from "@/config/db";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { Order } from "@/models/order";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuthenticatedUser(
  async (
    req: NextRequest,
    { params }: { params: { id: string } },
  ): Promise<NextResponse> => {
    const userId = req.headers.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const orderId = params.id;
    await connectToDatabase();
    try {
      const orders = await Order.find({ userId, _id: orderId }).populate(
        "items.productId",
      );
      if (!orders || orders.length === 0) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json(orders);
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch orders" },
        { status: 500 },
      );
    }
  },
);

export const PUT = withAuthenticatedUser(
  async (
    req: NextRequest,
    { params }: { params: { id: string } },
  ): Promise<NextResponse> => {
    const userId = req.headers.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const orderId = params.id;
    await connectToDatabase();
    try {
      const order = await Order.findOneAndUpdate(
        { _id: orderId, userId },
        { status: "cancelled" },
        { new: true },
      );
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }
      return NextResponse.json({
        message: "Order cancelled successfully",
        order,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to cancel order" },
        { status: 500 },
      );
    }
  },
);
