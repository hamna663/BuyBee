import { connectToDatabase } from "@/config/db";
import { withAdmin } from "@/lib/middlewares/admin";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { Order } from "@/models/order";
import { NextRequest, NextResponse } from "next/server";

export const GET = withAuthenticatedUser(
  withAdmin(async (req: NextRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(req.url);
    const offset = parseInt(searchParams.get("offset") || "0");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status") || "all";
    const sort = searchParams.get("sort") || "createdAt";
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    await connectToDatabase();
    try {
      const orders = await Order.find({
        ...(status !== "all" && { status }),
        ...(from && { createdAt: { $gte: new Date(from) } }),
        ...(to && { createdAt: { $lte: new Date(to) } }),
      })
        .sort({ [sort]: -1 })
        .skip(offset)
        .limit(limit)
        .populate("user", "name email");
      const total = await Order.countDocuments({
        ...(status !== "all" && { status }),
        ...(from && { createdAt: { $gte: new Date(from) } }),
        ...(to && { createdAt: { $lte: new Date(to) } }),
      });
      return NextResponse.json({ orders, total });
    } catch (error) {
      return NextResponse.json({ error }, { status: 500 });
    }
  }),
);
