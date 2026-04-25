import { connectToDatabase } from "@/config/db";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { Cart } from "@/models/cart";
import { NextRequest, NextResponse } from "next/server";

export const PUT = withAuthenticatedUser(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ itemId: string }> },
  ): Promise<NextResponse> => {
    await connectToDatabase();
    const { itemId } = await params;
    try {
      const userId = req.headers.get("userId");
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const { quantity } = await req.json();
      
      const cart = await Cart.findOneAndUpdate(
        { userId, "items.productId": itemId },
        { $set: { "items.$.quantity": quantity } },
        { new: true }
      ).populate("items.productId", "name price images");

      if (!cart) {
        return NextResponse.json(
          { message: "Cart item not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ cart }, { status: 200 });
    } catch (error) {
      console.error("Cart update error:", error);
      return NextResponse.json(
        { error: "Failed to update cart item" },
        { status: 500 },
      );
    }
  },
);

export const DELETE = withAuthenticatedUser(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ itemId: string }> },
  ): Promise<NextResponse> => {
    const { itemId } = await params;
    await connectToDatabase();
    try {
      const userId = req.headers.get("userId");
      const cart = await Cart.findOneAndUpdate(
        { userId },
        { $pull: { items: { productId: itemId } } },
        { new: true }
      ).populate("items.productId", "name price images");

      if (!cart) {
        return NextResponse.json(
          { message: "Cart not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ cart }, { status: 200 });
    } catch (error) {
      console.error("Cart delete error:", error);
      return NextResponse.json(
        { error: "Failed to delete cart item" },
        { status: 500 },
      );
    }
  },
);
