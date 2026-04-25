import { connectToDatabase } from "@/config/db";
import { withAdmin } from "@/lib/middlewares/admin";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { Product, ProductType } from "@/models/products";
import { CategoryType } from "@/models/category";
import "@/models/category";
import { productSchema } from "@/schemas/product";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import z from "zod";

type PopulatedProduct = Omit<ProductType, "categoryId"> & {
  categoryId: CategoryType;
};

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> => {
  const { id: productId } = await params;
  if (!productId || productId.trim() === "") {
    return NextResponse.json(
      { error: "Product ID is required" },
      { status: 400 },
    );
  }
  await connectToDatabase();
  try {
    const product = await Product.findById(
      new mongoose.Types.ObjectId(productId),
    )
      .select(
        "name price description stock images available averageRating categoryId",
      )
      .populate("categoryId");
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof Error && error.name === "CastError") {
      return NextResponse.json(
        { error: "Invalid product ID format" },
        { status: 400 },
      );
    }
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 },
    );
  }
};

export const PUT = withAuthenticatedUser(
  withAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
    const { id: productId } = await params;
    if (!productId || productId.trim() === "") {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }
    const { name, price, description, images, stock, category } =
      await req.json();

    await connectToDatabase();
    try {
      const data = await productSchema.parseAsync({
        name,
        price,
        description,
        stock,
        images,
        category,
      });
      const product = (await Product.findByIdAndUpdate(
        productId,
        {
          name: data.name,
          price: data.price,
          description: data.description,
          stock: data.stock,
          images: data.images,
          categoryId: data.category,
        },
        { new: true },
      ).populate("categoryId", "name")) as unknown as PopulatedProduct;
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({
        message: "Product updated successfully",
        product: {
          id: product._id,
          name: product.name,
          price: product.price,
          description: product.description,
          stock: product.stock,
          images: product.images,
          available: product.available,
          averageRating: product.averageRating,
          category: product.categoryId.name,
        },
      });
    } catch (error) {
      if (error instanceof Error && error.name === "CastError") {
        return NextResponse.json(
          { error: "Invalid product ID format" },
          { status: 400 },
        );
      }
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid input data", details: error.message },
          { status: 400 },
        );
      }
      return NextResponse.json(
        { error: "Failed to update product" },
        { status: 500 },
      );
    }
  }),
);

export const DELETE = withAuthenticatedUser(
  withAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
    const { id: productId } = await params;
    if (!productId || productId.trim() === "") {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 },
      );
    }
    await connectToDatabase();
    try {
      const product = await Product.findByIdAndDelete(productId);
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Product deletion error:", error);
      return NextResponse.json(
        { error: "Failed to delete product" },
        { status: 500 },
      );
    }
  }),
);
