import { connectToDatabase } from "@/config/db";
import { withAdmin } from "@/lib/middlewares/admin";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { Order } from "@/models/order";
import { Product } from "@/models/products";
import { NextResponse } from "next/server";

export const GET = withAuthenticatedUser(
  withAdmin(async (): Promise<NextResponse> => {
    await connectToDatabase();

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Aggregate revenue and orders by day for the last 30 days
      const dailyStats = await Order.aggregate([
        {
          $match: {
            createdAt: { $gte: thirtyDaysAgo },
            status: { $nin: ["pending", "cancelled"] },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);

      // Format for recharts
      const chartData = dailyStats.map((stat) => ({
        date: stat._id,
        revenue: stat.revenue,
        orders: stat.orders,
      }));

      // Top selling products
      const topProductsData = await Order.aggregate([
        {
          $match: {
            status: { $nin: ["pending", "cancelled"] },
          },
        },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.productId",
            totalSold: { $sum: "$items.quantity" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]);

      // Populate product names
      const topProducts = await Promise.all(
        topProductsData.map(async (item) => {
          const product = await Product.findById(item._id).select("name");
          return {
            name: product ? product.name : "Unknown Product",
            sales: item.totalSold,
          };
        }),
      );

      return NextResponse.json({
        chartData,
        topProducts,
      });
    } catch (error) {
      console.error("Analytics fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 },
      );
    }
  }),
);
