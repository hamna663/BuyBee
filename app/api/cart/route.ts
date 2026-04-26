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
      console.error("Cart fetch error:", error);
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
      const { productId, quantity = 1 } = await req.json();
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = new Cart({ userId, items: [] });
      }
      const existingItemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId,
      );
      if (existingItemIndex !== -1) {
        // Increment quantity if already in cart
        cart.items[existingItemIndex].quantity = (cart.items[existingItemIndex].quantity || 0) + quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
      await cart.save();
      return NextResponse.json({ cart }, { status: 200 });
    } catch (error) {
      console.error("Cart update error:", error);
      return NextResponse.json(
        { error: "Failed to update cart" },
        { status: 500 },
      );
    }
  },
);
export const PATCH = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    await connectToDatabase();
    try {
      const userId = req.headers.get("userId");
      const { productId, quantity } = await req.json();
      if (!productId || typeof quantity !== "number") {
        return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
      }
      // Find cart
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        // If no cart, create one (optional) – but normally should exist
        cart = new Cart({ userId, items: [] });
      }
      // Find item index
      const itemIdx = cart.items.findIndex((i) => i.productId.toString() === productId);
      if (itemIdx === -1) {
        // If not present, add new item
        cart.items.push({ productId, quantity });
      } else {
        if (quantity <= 0) {
          // Remove item if quantity zero or negative
          cart.items.splice(itemIdx, 1);
        } else {
          cart.items[itemIdx].quantity = quantity;
        }
      }
      await cart.save();
      return NextResponse.json({ cart }, { status: 200 });
    } catch (error) {
      console.error("Cart quantity update error:", error);
      return NextResponse.json({ error: "Failed to update cart quantity" }, { status: 500 });
    }
  }
);
