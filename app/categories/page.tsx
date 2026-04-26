"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryType } from "@/models/category";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { GridIcon } from "@hugeicons/core-free-icons";

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
      <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black uppercase tracking-widest opacity-50">Indexing Categories...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark pt-24 pb-12 px-4">
      <div className="container mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-gradient">
              Market Segments
            </h1>
            <p className="text-muted-foreground font-medium text-sm">
              Discover curated collections across all premium categories.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-secondary/30 backdrop-blur-md p-1 rounded-lg border border-white/10">
            <div className="px-4 py-2 bg-primary rounded-md flex items-center gap-2">
              <HugeiconsIcon icon={GridIcon} className="h-4 w-4 text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">Grid View</span>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat) => (
            <Link key={cat._id} href={`/products?category=${encodeURIComponent(cat.name)}`} className="group">
              <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-xl overflow-hidden h-56 hover:shadow-2xl transition-all duration-500 relative">
                <Image
                  src={safeImage(cat.images?.[0])}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <CardContent className="absolute inset-0 z-10 flex flex-col justify-end p-6">
                  <div className="space-y-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/20 px-2 py-0.5 rounded backdrop-blur-md">
                      Collection
                    </span>
                    <h3 className="text-xl font-black text-white leading-tight">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-white/60 font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      Explore the complete collection &rarr;
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
