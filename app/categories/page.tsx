"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryType } from "@/models/category";
import Image from "next/image";
import Link from "next/link";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const safeImage = (img?: string) =>
    img && img.startsWith("http") ? img : "/placeholder.png";

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto py-10 px-4">
          <p>Loading categories...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-primary mb-8">
          Shop by Category
        </h1>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat._id} href={`/products?category=${encodeURIComponent(cat.name)}`}>
              <Card className="relative overflow-hidden group h-48 hover:shadow-xl transition">
                <Image
                  src={safeImage(cat.images?.[0])}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition"
                />

                <div className="absolute inset-0 bg-black/50" />

                <CardContent className="relative z-10 flex items-center justify-center h-full text-white font-bold text-xl">
                  {cat.name}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
