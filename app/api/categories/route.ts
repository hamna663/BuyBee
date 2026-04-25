import { connectToDatabase } from "@/config/db";
import { withAdmin } from "@/lib/middlewares/admin";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { Category } from "@/models/category";
import { categorySchema } from "@/schemas/category";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const GET = async (): Promise<NextResponse> => {
  await connectToDatabase();
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "categoryId",
          as: "products",
        },
      },
      {
        $addFields: {
          productsCount: { $size: "$products" },
        },
      },
      {
        $project: {
          products: 0,
        },
      },
    ]);

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Category fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 },
    );
  }
};

export const POST = withAuthenticatedUser(
  withAdmin(async (req: NextRequest): Promise<NextResponse> => {
    const { name, description, images } = await req.json();
    await connectToDatabase();
    try {
      const data = await categorySchema.parseAsync({
        name,
        description,
        images,
      });
      const category = new Category({
        name: data.name,
        description: data.description,
        images: data.images,
      });
      if (!category) {
        return NextResponse.json(
          { error: "Failed to create category" },
          { status: 400 },
        );
      }
      await category.save();
      return NextResponse.json({ category });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.issues.map((e) => e.message).join(", ") },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: "Failed to create category" },
        { status: 400 },
      );
    }
  }),
);
