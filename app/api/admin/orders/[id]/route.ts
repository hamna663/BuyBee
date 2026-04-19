import { connectToDatabase } from "@/config/db";
import { withAdmin } from "@/lib/middlewares/admin";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { Order } from "@/models/order";
import { NextRequest, NextResponse } from "next/server";

export const PUT = withAuthenticatedUser(
  withAdmin(
    async (req: NextRequest, params: { id: string }): Promise<NextResponse> => {
      const { id } = params;
      const { status } = await req.json();
      if (
        status !== "pending" &&
        status !== "shipped" &&
        status !== "processing" &&
        status !== "delivered" &&
        status !== "cancelled"
      ) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }
      await connectToDatabase();
      try {
        const order = await Order.findByIdAndUpdate(
          id,
          { status },
          { new: true },
        );
        return NextResponse.json({ message: "Order status updated", order });
      } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
      }
    },
  ),
);
