"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { ProductType } from "@/models/products";
import { CategoryType } from "@/models/category";
import Image from "next/image";
import Link from "next/link";

import ProductCard from "@/components/custom/ProductCard";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, ShoppingCartIcon } from "@hugeicons/core-free-icons";

export default function Page() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [pRes, cRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);

      const pData = await pRes.json();
      const cData = await cRes.json();

      setProducts(pData.products || []);
      setCategories(cData.categories || []);
      setLoading(false);
    };

    fetchData();
  }, []);

  const safeImage = (img?: string) =>
    img && img.startsWith("http") ? img : "/placeholder.png";

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // Redirect to products page with search
      window.location.href = `/products?search=${encodeURIComponent(searchTerm)}`;
    }
  };

  return (
    <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark text-foreground">
      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background blobs */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/15 rounded-full blur-[100px] animate-pulse delay-700" />
        </div>

        <div className="mx-auto max-w-7xl px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Fresh Arrivals for Spring 2026
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black leading-[1.2] tracking-tight text-gray-900 dark:text-white">
              Elevate Your <br />
              <span className="text-gradient">Everyday Style</span>
            </h1>

            <p className="text-base text-muted-foreground max-w-lg leading-relaxed line-clamp-2">
              Curating the finest selection of premium essentials. Experience the perfect blend of luxury, comfort, and innovation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="relative flex-1 group max-w-md">
                <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <Input
                  placeholder="Search your favorites..."
                  className="relative h-11 pl-12 bg-white/50 dark:bg-black/20 backdrop-blur-xl border-white/20 dark:border-white/10 rounded-lg shadow-xl transition-all duration-300 text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <HugeiconsIcon 
                  icon={Menu01Icon} 
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-primary h-6 w-6" 
                />
              </div>
              <Button 
                size="lg" 
                className="h-11 px-6 rounded-lg shadow-xl bg-primary hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all duration-300 font-bold text-sm"
                onClick={handleSearch}
              >
                Start Exploring
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-6 border-t border-gray-100 dark:border-white/5">
              <div>
                <p className="text-2xl font-bold">15k+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div className="w-px h-10 bg-gray-100 dark:bg-white/10" />
              <div>
                <p className="text-2xl font-bold">99%</p>
                <p className="text-sm text-muted-foreground">Quality Rating</p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative z-10 aspect-square rounded-[2rem] overflow-hidden shadow-2xl group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-blue-600/30 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-700" />
              <Image 
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop"
                alt="Hero Product"
                fill
                className="object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
              />
              <div className="absolute bottom-8 left-8 right-8 glassmorphism dark:glassmorphism-dark p-6 rounded-2xl translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium opacity-90">Premium Series</p>
                    <p className="text-xl font-bold tracking-tight">Essential Minimalism</p>
                  </div>
                  <Button size="icon" className="rounded-full h-12 w-12">
                    <HugeiconsIcon icon={ShoppingCartIcon} className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
            {/* Abstract shapes */}
            <div className="absolute -top-10 -right-10 w-40 h-40 border-2 border-primary/20 rounded-full animate-spin-slow" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold tracking-tight">Shop by Category</h3>
            <p className="text-sm text-muted-foreground">Find exactly what you&apos;re looking for</p>
          </div>
          <Link href="/categories">
            <Button variant="ghost" className="group text-primary hover:text-primary">
              View All Categories 
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </Link>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="app-card h-48 animate-pulse rounded-2xl" />
              ))
            : categories.slice(0, 4).map((cat) => (
                <Link key={cat._id} href={`/products?category=${encodeURIComponent(cat.name)}`}>
                  <Card className="relative overflow-hidden group app-card h-48 rounded-2xl app-card-hover duration-500">
                    <Image
                      src={safeImage(cat.images?.[0])}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-primary/80 transition-colors duration-500" />

                    <CardContent className="relative z-10 flex flex-col justify-end h-full p-6 text-white">
                      <p className="text-xs uppercase tracking-widest opacity-90 mb-1">Explore</p>
                      <h4 className="text-xl font-bold tracking-tight">{cat.name}</h4>
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="bg-white/30 dark:bg-black/10 backdrop-blur-sm py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-12">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight">Featured Products</h3>
              <p className="text-sm text-muted-foreground">Handpicked selections for you</p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/products">
                <Button variant="outline" className="rounded-xl border-primary/20 hover:bg-primary hover:text-white transition-all duration-300">
                  Explore Full Catalog
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="app-card h-96 animate-pulse rounded-2xl" />
                ))
              : products.slice(0, 6).map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
          </div>
        </div>
      </section>
    </main>
  );
}
