"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductType } from "@/models/products";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface ReviewType {
  _id: string;
  userId: { _id: string; name: string };
  rating: number;
  comment: string;
  createdAt: string;
}

interface Props {
  product: ProductType;
  initialReviews?: ReviewType[];
}

export default function ProductDetails({
  product,
  initialReviews = [],
}: Props) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<ReviewType[]>(initialReviews);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const safeImage = (img?: string) =>
    img && img.startsWith("http") ? img : "/placeholder.png";

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please sign in to add items to cart");
      return;
    }
    try {
      setLoading(true);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product._id, quantity }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || data.error || "Failed to add to cart");
        return;
      }

      toast.success(`${quantity}× ${product.name} added to cart!`);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Fixed type: React.FormEvent instead of React.SubmitEvent
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please sign in to submit a review");
        return;
      }

      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: Number(rating), comment }),
      });

      const data = await res.json();

      if (res.ok) {
        setReviews(data.reviews || []);
        setComment("");
        setRating("5");
        toast.success("Review submitted! Thank you.");
      } else {
        toast.error(data.error || "Failed to submit review");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-16">
      <div className="grid md:grid-cols-2 gap-16 items-start">
        {/* IMAGE GALLERY */}
        <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
          <div className="relative aspect-[4/5] w-full rounded-[2.5rem] overflow-hidden bg-secondary/30 border border-white/5 shadow-2xl group">
            <Image
              src={safeImage(product.images?.[0])}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-1000"
              priority
            />
            <div className="absolute top-6 left-6">
              <Badge className="bg-white/10 backdrop-blur-md border-white/10 px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest text-white">
                {((product.categoryId as unknown) as { name?: string })?.name || "Premium Selection"}
              </Badge>
            </div>
          </div>
          
          {/* Thumbnail preview if multiple images */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
              {product.images.map((img, i) => (
                <div key={i} className="relative h-24 w-24 rounded-2xl overflow-hidden border-2 border-white/5 hover:border-primary transition-all flex-shrink-0 cursor-pointer">
                  <Image src={img} alt={`${product.name} ${i}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS SECTION */}
        <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000">
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-none">{product.name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex text-primary font-black text-xl">
                {"★".repeat(Math.round(product.averageRating || 0))}
                <span className="text-muted-foreground opacity-30">
                  {"★".repeat(5 - Math.round(product.averageRating || 0))}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black">{product.averageRating?.toFixed(1) || "0.0"}</span>
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">({reviews.length} Reviews)</span>
              </div>
            </div>
          </div>

          <p className="text-xl text-muted-foreground leading-relaxed font-medium">
            {product.description || "Indulge in the finest quality and craftsmanship. This carefully curated piece brings both style and functionality to your collection."}
          </p>

          <div className="flex items-baseline gap-4">
            <span className="text-6xl font-black text-gradient">
              ${(product.price * quantity).toFixed(2)}
            </span>
            {quantity > 1 && (
              <span className="text-xl text-muted-foreground font-bold line-through opacity-50">
                ${(product.price * quantity * 1.2).toFixed(2)}
              </span>
            )}
          </div>

          <div className="space-y-8 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="font-black uppercase tracking-widest text-xs opacity-50">Select Quantity</span>
              <div className="flex items-center bg-secondary/50 rounded-2xl p-1.5 border border-white/10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl hover:bg-white/10"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </Button>
                <span className="w-12 text-center font-black text-xl">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl hover:bg-white/10"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                size="lg"
                className="rounded-[1.5rem] h-16 font-black text-xl shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all group"
                onClick={handleAddToCart}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <span className="h-5 w-5 rounded-full border-3 border-white border-t-transparent animate-spin" />
                    Processing
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Add to Collection
                  </span>
                )}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-[1.5rem] h-16 font-black text-xl border-white/10 hover:bg-secondary/50"
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-8">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">✨</div>
              <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">Premium Quality</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">🚚</div>
              <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">Fast Delivery</span>
            </div>
            <div className="flex flex-col items-center text-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">🛡️</div>
              <span className="text-[10px] font-bold uppercase tracking-tighter opacity-60">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* REVIEWS SECTION */}
      <div className="pt-20 space-y-12">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-4xl font-black tracking-tight">Client Feedback</h2>
            <p className="text-muted-foreground font-medium mt-1">What our community is saying about this piece.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {reviews.length === 0 ? (
              <div className="p-12 rounded-[2.5rem] bg-secondary/20 border border-dashed border-white/10 flex flex-col items-center text-center">
                <p className="text-xl font-bold opacity-30">No narratives shared yet.</p>
                <p className="text-sm text-muted-foreground mt-1">Be the first to articulate your experience.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-6">
                {reviews.map((review) => (
                  <Card
                    key={review._id}
                    className="glassmorphism dark:glassmorphism-dark border-none rounded-[2rem] p-6 hover:shadow-xl transition-all duration-500 group"
                  >
                    <CardContent className="p-0 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-black">
                            {review.userId.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-lg leading-none">{review.userId.name}</p>
                            <p className="text-[10px] uppercase font-bold text-muted-foreground mt-1 tracking-widest"> Verified Purchase</p>
                          </div>
                        </div>
                        <div className="flex text-primary text-xs">
                          {"★".repeat(review.rating)}
                        </div>
                      </div>
                      <p className="text-muted-foreground font-medium italic leading-relaxed">&quot;{review.comment}&quot;</p>
                      <p className="text-[10px] font-bold uppercase opacity-30">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-[2.5rem] p-8 sticky top-24">
              <CardHeader className="p-0 mb-6">
                <CardTitle className="text-2xl font-black">Share Your Story</CardTitle>
                <p className="text-sm text-muted-foreground">Your feedback helps our community thrive.</p>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleSubmitReview} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest opacity-50">Experience Rating</label>
                    <Select
                      value={rating}
                      onValueChange={(val) => val && setRating(val)}
                    >
                      <SelectTrigger className="h-12 rounded-xl bg-white/50 dark:bg-black/20 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl glassmorphism dark:glassmorphism-dark">
                        <SelectItem value="5">★★★★★ — Exceptional</SelectItem>
                        <SelectItem value="4">★★★★☆ — Splendid</SelectItem>
                        <SelectItem value="3">★★★☆☆ — Mediocre</SelectItem>
                        <SelectItem value="2">★★☆☆☆ — Underwhelming</SelectItem>
                        <SelectItem value="1">★☆☆☆☆ — Disappointing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest opacity-50">Narrative</label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Your reflections on this item..."
                      required
                      className="min-h-[120px] bg-white/50 dark:bg-black/20 rounded-2xl border-white/10 focus:ring-primary"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submittingReview}
                    className="h-14 rounded-2xl w-full font-black text-lg"
                  >
                    {submittingReview ? "Archiving..." : "Post Review"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
