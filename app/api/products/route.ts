import { connectToDatabase } from "@/config/db";
import { withAdmin } from "@/lib/middlewares/admin";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { Product } from "@/models/products";
import "@/models/category";
import { productQuerySchema, productSchema } from "@/schemas/product";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const offset = Number(searchParams.get("page") || "0");
  const limit = Number(searchParams.get("limit") || "10");
  const category = searchParams.get("category") || "";

  await connectToDatabase();
  try {
    const data = await z.parseAsync(productQuerySchema, {
      search,
      offset,
      limit,
      category,
    });

    const escapeRegex = (str: string) =>
      str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const products = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },

      {
        $match: {
          ...(data.search && {
            name: { $regex: data.search, $options: "i" },
          }),

          ...(data.category && {
            "category.name": {
              $regex: escapeRegex(data.category),
              $options: "i",
            },
          }),
        },
      },

      { $sort: { createdAt: -1 } },
      { $skip: Math.max(0, data.offset || 0) },
      { $limit: Math.min(data.limit || 10, 50) },

      {
        $project: {
          name: 1,
          price: 1,
          description: 1,
          images: 1,
          stock: 1,
          createdAt: 1,
          updatedAt: 1,
          category: { name: 1 },
        },
      },
    ]);

    return NextResponse.json({ products });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 },
    );
  }
};

export const POST = withAuthenticatedUser(
  withAdmin(async (req: NextRequest): Promise<NextResponse> => {
    const { name, price, description, images, stock, category } =
      await req.json();

    await connectToDatabase();
    try {
      const data = await z.parseAsync(productSchema, {
        name,
        price,
        description,
        stock,
        images,
        category,
      });

      const product = await Product.create({
        name: data.name,
        price: data.price,
        description: data.description,
        images: data.images,
        stock: data.stock,
        categoryId: data.category,
      });
      if (!product) {
        return NextResponse.json(
          { error: "Failed to create product" },
          { status: 500 },
        );
      }
      await product.populate("categoryId");
      return NextResponse.json({
        message: "Product created successfully",
        product: {
          id: product._id,
          name: product.name,
          price: product.price,
          description: product.description,
          images: product.images,
          stock: product.stock,
          category: (product.categoryId as any)?.name,
          available: product.available,
        },
      });
    } catch (error) {
      console.error("Error creating product:", error);
      return NextResponse.json(
        { error: "Failed to create product" },
        { status: 500 },
      );
    }
  }),
);
