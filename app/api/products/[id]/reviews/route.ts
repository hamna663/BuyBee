import { connectToDatabase } from "@/config/db";
import { withAuthenticatedUser } from "@/lib/middlewares/auth";
import { Product } from "@/models/products";
import { Review } from "@/models/reviews";
import { reviewSchema } from "@/schemas/reviews";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> => {
  const { id: productId } = await params;

  await connectToDatabase();
  try {
    const product = await Product.findById(productId).select(
      "name price image averageRating description isAvailable",
    );
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    const reviews = await Review.find({ productId }).populate("userId", "name");
    if (!reviews) {
      return NextResponse.json({ error: "No reviews found" }, { status: 404 });
    }
    return NextResponse.json({ product, reviews });
  } catch (error) {
    console.error("Review fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
};

export const POST = withAuthenticatedUser(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> },
  ): Promise<NextResponse> => {
    const { id: productId } = await params;
    const { rating, comment } = await req.json();
    const userId = req.headers.get("userId");
    if (userId === null || userId.trim() === "") {
      return NextResponse.json({ error: "Unauthorized" });
    }
    await connectToDatabase();
    try {
      const data = await reviewSchema.parseAsync({ rating, comment });
      const product = await Product.findById(productId);
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 },
        );
      }
      const existingReview = await Review.findOne({
        productId,
        userId,
      });
      if (existingReview) {
        return NextResponse.json(
          { error: "You have already reviewed this product" },
          { status: 400 },
        );
      }
      const review = new Review({
        userId,
        productId,
        rating: data.rating,
        comment: data.comment,
      });
      await review.save();
      const reviews = await Review.find({ productId }).populate("userId", "name");
      await Product.findByIdAndUpdate(
        { _id: productId },
        {
          averageRating:
            reviews.reduce((acc, review) => acc + review.rating, 0) /
            reviews.length,
        },
        { new: true },
      );
      return NextResponse.json({ reviews });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Invalid review data", details: error.message },
          { status: 400 },
        );
      }
      console.log(error);
      return NextResponse.json(
        { error: "Failed to submit review" },
        { status: 500 },
      );
    }
  },
);
