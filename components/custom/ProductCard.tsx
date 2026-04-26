"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ProductType } from "@/models/products";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingCartAdd01Icon, StarIcon, ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";

interface Props {
  product: ProductType;
}

export default function ProductCard({ product }: Props) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const safeImage = (img?: string) =>
    img && img.startsWith("http") ? img : "/placeholder.png";

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
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
        body: JSON.stringify({ productId: product._id }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || data.error || "Failed to add to cart");
        return;
      }

      setAdded(true);
      toast.success(`${product.name} added to cart!`);
      window.dispatchEvent(new Event("cartUpdated"));
      setTimeout(() => setAdded(false), 2000);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const images = product.images && product.images.length > 0 
    ? product.images 
    : ["/placeholder.png"];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Card className="overflow-hidden border-white/10 dark:bg-white/5 backdrop-blur-sm hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 group rounded-lg">
      <div className="relative h-64 w-full overflow-hidden">
        {images.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={safeImage(img)}
              alt={`${product.name} - ${index + 1}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
        ))}
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md border border-white/10"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-black/20 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-md border border-white/10"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 px-2 py-1 bg-black/20 backdrop-blur-md rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === currentImageIndex ? "w-4 bg-primary" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <CardContent className="p-6">
        <Link href={`/products/${product._id}`}>
          <div className="flex justify-between items-start gap-2">
            <h4 className="font-bold text-base leading-tight group-hover:text-primary transition-colors duration-300 line-clamp-1">
              {product.name}
            </h4>
            <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-0.5 rounded-lg">
              <HugeiconsIcon icon={StarIcon} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
              <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-400">
                {product.averageRating?.toFixed(1) || "New"}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
            {product.description}
          </p>
        </Link>

        <div className="mt-6 flex justify-between items-center">
          <span className="text-xl font-black text-gradient">
            ${product.price?.toFixed(2)}
          </span>

          <Button
            size="sm"
            className={`rounded px-4 h-7 text-[10px] transition-all duration-300 gap-1.5 ${
              added
                ? "bg-green-500 hover:bg-green-600 scale-105"
                : "hover:scale-105"
            }`}
            onClick={handleAddToCart}
            disabled={loading}
          >
            {loading ? (
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : added ? (
              "✓ Added!"
            ) : (
              <>
                <HugeiconsIcon icon={ShoppingCartAdd01Icon} className="h-4 w-4" />
                Add
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
