import { connectToDatabase } from "@/config/db";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { Cart } from "@/models/cart";
import { NextRequest, NextResponse } from "next/server";

export const PUT = withAuthenticatedUser(
  async (
    req: NextRequest,
    { params }: { params: { itemId: string } },
  ): Promise<NextResponse> => {
    await connectToDatabase();
    const { itemId } = await params;
    try {
      const userId = req.headers.get("userId");
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      console.log(itemId);
      const cart = await Cart.findOne({
        userId,
        items: { $elemMatch: { productId: itemId } },
      });
      if (!cart) {
        return NextResponse.json(
          { message: "Cart item not found" },
          { status: 404 },
        );
      }
      const item = cart.items.find((i) => i.productId.toString() === itemId);
      if (item) {
        await cart.save();
        return NextResponse.json({ cart }, { status: 200 });
      } else {
        return NextResponse.json(
          { message: "Cart item not found" },
          { status: 404 },
        );
      }
    } catch (error) {
      console.log(error);
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
    { params }: { params: { itemId: string } },
  ): Promise<NextResponse> => {
    const { itemId } = await params;
    await connectToDatabase();
    try {
      const userId = req.headers.get("userId");
      const cart = await Cart.findOne({
        userId,
        "items.productId": itemId,
      });
      if (!cart) {
        return NextResponse.json(
          { message: "Cart item not found" },
          { status: 404 },
        );
      }
      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== itemId,
      ) as typeof cart.items;
      await cart.save();
      return NextResponse.json({ cart }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to delete cart item" },
        { status: 500 },
      );
    }
  },
);
