import { connectToDatabase } from "@/config/db";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { Cart } from "@/models/cart";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    await connectToDatabase();
    try {
      const userId = req.headers.get("userId");
      await Cart.findOneAndUpdate({ userId }, { items: [] });
      return NextResponse.json({ message: "Cart cleared" }, { status: 200 });
    } catch (error) {
      console.error("Cart clear error:", error);
      return NextResponse.json(
        { error: "Failed to clear cart" },
        { status: 500 },
      );
    }
  },
);
