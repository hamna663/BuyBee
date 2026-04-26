import { connectToDatabase } from "@/config/db";
import { withAdmin } from "@/lib/middlewares/admin";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { Product, ProductType } from "@/models/products";
import { CategoryType } from "@/models/category";
import "@/models/category";
import { productQuerySchema, productSchema } from "@/schemas/product";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

type PopulatedProduct = Omit<ProductType, "categoryId"> & {
  categoryId: CategoryType;
};

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const offset = Number(searchParams.get("page") || "0");
  const limit = Number(searchParams.get("limit") || "10");
  const category = searchParams.get("category") || "";
  const ratingParam = searchParams.get("rating");
  const rating =
    ratingParam === null || ratingParam === ""
      ? undefined
      : Number(ratingParam);
  const minPrice = Number(searchParams.get("minPrice"));
  const maxPrice = Number(searchParams.get("maxPrice"));
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  await connectToDatabase();
  try {
    const data = await productQuerySchema.parseAsync({
      search,
      offset,
      limit,
      category,
      rating,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
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
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },

      {
        $match: {
          ...(data.search && {
            name: { $regex: data.search, $options: "i" },
          }),

          ...(data.minPrice && {
            price: { $gte: Number(data.minPrice) },
          }),

          ...(data.maxPrice && {
            price: {
              ...(data.minPrice && { $gte: Number(data.minPrice) }),
              $lte: Number(data.maxPrice),
            },
          }),

          ...(data.rating !== undefined &&
            !isNaN(Number(data.rating)) && {
              averageRating: { $gte: Number(data.rating) },
            }),

          ...(data.category && {
            "category.name": {
              $regex: escapeRegex(data.category),
              $options: "i",
            },
          }),
        },
      },

      { $sort: { [data.sortBy]: data.sortOrder === "asc" ? 1 : -1 } },
      { $skip: Math.max(0, data.offset || 0) },
      { $limit: Math.min(data.limit || 10, 1000) },

      {
        $project: {
          name: 1,
          price: 1,
          description: 1,
          images: 1,
          stock: 1,
          createdAt: 1,
          updatedAt: 1,
          averageRating: 1,
          categoryId: { _id: "$category._id", name: "$category.name" },
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
      const populatedProduct = product as unknown as PopulatedProduct;
      return NextResponse.json({
        message: "Product created successfully",
        product: {
          id: populatedProduct._id,
          name: populatedProduct.name,
          price: populatedProduct.price,
          description: populatedProduct.description,
          images: populatedProduct.images,
          stock: populatedProduct.stock,
          category: populatedProduct.categoryId?.name,
          available: populatedProduct.available,
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
