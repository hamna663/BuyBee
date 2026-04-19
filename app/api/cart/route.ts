import { connectToDatabase } from "@/config/db";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { Cart } from "@/models/cart";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    await connectToDatabase();
    try {
      const userId = req.headers.get("userId");
      const cart = await Cart.findOne({ userId }).populate(
        "items.productId",
        "name price images",
      );
      if (!cart) {
        return NextResponse.json(
          { message: "Cart not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ cart }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to fetch cart" },
        { status: 500 },
      );
    }
  },
);
export const POST = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    await connectToDatabase();
    try {
      const userId = req.headers.get("userId");
      const { productId } = await req.json();
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId,
      );
      if (existingItemIndex !== -1) {
        return NextResponse.json(
          { message: "Product already in cart" },
          { status: 400 },
        );
      }
      cart.items.push({ productId });
      await cart.save();
      return NextResponse.json({ cart }, { status: 200 });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to update cart" },
        { status: 500 },
      );
    }
  },
);
