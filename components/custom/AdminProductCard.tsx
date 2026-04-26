"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Edit01Icon,
  Trash,
  StarIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";

type ProductType = {
  _id: string;
  name: string;
  description: string;
  price: number;
  categoryId: { _id: string; name: string };
  stock: number;
  images: string[];
  averageRating: number;
};

interface AdminProductCardProps {
  product: ProductType;
  onEdit: (product: ProductType) => void;
  onDelete: (id: string) => void;
}

export function AdminProductCard({
  product,
  onEdit,
  onDelete,
}: AdminProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images =
    product.images && product.images.length > 0
      ? product.images
      : ["/placeholder.png"];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all duration-500">
      <div className="aspect-square relative bg-muted overflow-hidden">
        {images.map((img, index) => (
          <Image
            key={index}
            src={img}
            alt={`${product.name} - ${index + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover group-hover:scale-110 transition-all duration-700 ${
              index === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <div className="absolute top-4 right-4 z-20">
          <Badge className="bg-black/50 backdrop-blur-md border-none rounded-full px-3 py-1 font-bold">
            ${product.price}
          </Badge>
        </div>

        {/* Carousel Controls */}
        {images.length > 1 && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
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
                    index === currentImageIndex
                      ? "w-4 bg-primary"
                      : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex flex-col flex-1 truncate">
            <h3 className="font-black text-xl truncate group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">
              {product.categoryId?.name}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-yellow-400/10 px-2 py-1 rounded-lg shrink-0">
            <HugeiconsIcon
              icon={StarIcon}
              className="h-3 w-3 text-yellow-500 fill-yellow-500"
            />
            <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-400">
              {product.averageRating?.toFixed(1) || "0.0"}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black opacity-50">
              In Stock
            </span>
            <span className="font-black text-lg">{product.stock}</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-all"
              onClick={() => onEdit(product)}
            >
              <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              className="h-10 w-10 rounded-xl hover:bg-red-600 transition-all"
              onClick={() => onDelete(product._id)}
            >
              <HugeiconsIcon icon={Trash} className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
