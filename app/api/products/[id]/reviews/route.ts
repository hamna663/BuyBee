import { connectToDatabase } from "@/config/db";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { Product } from "@/models/products";
import { Review } from "@/models/reviews";
import { reviewSchema } from "@/schemas/reviews";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const GET = async (req: NextRequest): Promise<NextResponse> => {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("id");

  await connectToDatabase();
  try {
    const product = await Product.findById(productId).select(
      "name price image averageRating description isAvailable",
    );
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const reviews = await Review.find({ product: productId }).populate(
      "user",
      "name",
    );
    if (!reviews) {
      return NextResponse.json({ error: "No reviews found" }, { status: 404 });
    }
    return NextResponse.json({ product, reviews });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
};

export const POST = withAuthenticatedUser(
  async (req: NextRequest): Promise<NextResponse> => {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("id");
    const { rating, comment } = await req.json();
    const userId = req.headers.get("userId");
    if (userId === null || userId.trim() === "") {
      return NextResponse.json({ error: "Unauthorized" });
    }
    const data = await z.safeParseAsync(reviewSchema, { rating, comment });
    await connectToDatabase();
    try {
      if (!data.success) {
        return NextResponse.json(
          { error: "Invalid review data" },
          { status: 400 },
        );
      }
      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }
      const existingReview = await Review.findOne({
        product: productId,
        user: userId,
      });
      if (existingReview) {
        return NextResponse.json(
          { error: "You have already reviewed this product" },
          { status: 400 },
        );
      }
      const review = new Review({
        user: userId,
        product: productId,
        rating,
        comment,
      });
      await review.save();
      const reviews = await Review.find({ product: productId }).populate(
        "user",
        "name",
      );
      return NextResponse.json({ reviews });
    } catch (error) {
      return NextResponse.json(
        { error: "Failed to submit review" },
        { status: 500 },
      );
    }
  },
);
