"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductType } from "@/models/products";
import { CategoryType } from "@/models/category";
import ProductCard from "@/components/custom/ProductCard";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";

type FilterState = {
  category: string;
  minPrice: string;
  maxPrice: string;
  rating: string;
  sortBy: string;
  sortOrder: string;
};

function ProductsContent() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>({
    category: "",
    minPrice: "",
    maxPrice: "",
    rating: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Debounced filters state
  const [debouncedFilters, setDebouncedFilters] = useState<FilterState>(filters);

  useEffect(() => {
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    if (search || category) {
      if (search) setSearchTerm(search);
      if (category) {
        setFilters(prev => ({ ...prev, category }));
        setDebouncedFilters(prev => ({ ...prev, category }));
      }
    }
  }, [searchParams]);

  // Update debounced filters after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [filters]);

  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const queryParams = new URLSearchParams();

      if (searchTerm) queryParams.append("search", searchTerm);
      if (debouncedFilters.category) queryParams.append("category", debouncedFilters.category);
      if (debouncedFilters.minPrice) queryParams.append("minPrice", debouncedFilters.minPrice);
      if (debouncedFilters.maxPrice) queryParams.append("maxPrice", debouncedFilters.maxPrice);
      if (debouncedFilters.rating) queryParams.append("rating", debouncedFilters.rating);
      if (debouncedFilters.sortBy) queryParams.append("sortBy", debouncedFilters.sortBy);
      if (debouncedFilters.sortOrder) queryParams.append("sortOrder", debouncedFilters.sortOrder);

      const res = await fetch(`/api/products?${queryParams.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setProductsLoading(false);
    }
  }, [searchTerm, debouncedFilters]);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when debounced filters or search term changes
  useEffect(() => {
    fetchProducts();
  }, [debouncedFilters, searchTerm, fetchProducts]);

  // Initial load
  useEffect(() => {
    fetchProducts();
    setLoading(false);
  }, [fetchProducts]);

  const handleFilterChange = (key: keyof FilterState, value: string | null) => {
    let processedValue = value || "";

    // Prevent negative prices
    if ((key === "minPrice" || key === "maxPrice") && processedValue !== "") {
      const numValue = parseFloat(processedValue);
      if (numValue < 0) {
        processedValue = "0";
      }
    }

    setFilters(prev => ({ ...prev, [key]: processedValue }));
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      minPrice: "",
      maxPrice: "",
      rating: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setSearchTerm("");
  };

  const handleSearch = () => {
    // Update URL with search term
    const url = new URL(window.location.href);
    if (searchTerm.trim()) {
      url.searchParams.set("search", searchTerm);
    } else {
      url.searchParams.delete("search");
    }
    window.history.pushState({}, "", url.toString());
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto py-10 px-4">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <section className="mesh-gradient dark:mesh-gradient-dark py-20 px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-6xl font-black tracking-tighter text-gray-900 dark:text-white">
              Explore Our <span className="text-gradient">Collection</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 font-medium">
              Find exactly what you need with our advanced filters and search.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 -mt-10">
        {/* Search and Filters */}
        <div className="space-y-8">
          <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-[2rem] shadow-2xl p-2 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-8 items-end">
                {/* Search */}
                <div className="w-full lg:max-w-md space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold opacity-60 ml-1">Search Products</Label>
                  <div className="relative group">
                    <Input
                      placeholder="Enter keywords..."
                      className="h-12 pl-10 bg-white/50 dark:bg-black/20 border-white/10 rounded-xl"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    <HugeiconsIcon 
                      icon={Menu01Icon} 
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 w-full">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold opacity-60 ml-1">Category</Label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => handleFilterChange("category", value)}
                    >
                      <SelectTrigger className="h-12 bg-white/50 dark:bg-black/20 border-white/10 rounded-xl">
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-white/10 glassmorphism dark:glassmorphism-dark">
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold opacity-60 ml-1">Price Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        className="h-12 bg-white/50 dark:bg-black/20 border-white/10 rounded-xl"
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        className="h-12 bg-white/50 dark:bg-black/20 border-white/10 rounded-xl"
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold opacity-60 ml-1">Rating</Label>
                    <Select
                      value={filters.rating}
                      onValueChange={(value) => handleFilterChange("rating", value)}
                    >
                      <SelectTrigger className="h-12 bg-white/50 dark:bg-black/20 border-white/10 rounded-xl">
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-white/10 glassmorphism dark:glassmorphism-dark">
                        <SelectItem value="">Any Rating</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-widest font-bold opacity-60 ml-1">Sort Order</Label>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value) => handleFilterChange("sortOrder", value)}
                    >
                      <SelectTrigger className="h-12 bg-white/50 dark:bg-black/20 border-white/10 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-white/10 glassmorphism dark:glassmorphism-dark">
                        <SelectItem value="desc">Newest First</SelectItem>
                        <SelectItem value="asc">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" onClick={clearFilters} className="h-12 rounded-xl text-muted-foreground hover:text-primary">
                    Reset
                  </Button>
                  <Button onClick={handleSearch} className="h-12 px-8 rounded-xl shadow-lg hover:shadow-primary/20 transition-all">
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="space-y-10 py-10">
            <div className="flex justify-between items-center px-2">
              <h3 className="text-2xl font-bold tracking-tight">
                {productsLoading ? "Updating results..." : `${products.length} Products Found`}
              </h3>
            </div>

            {productsLoading ? (
              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="h-96 animate-pulse bg-muted rounded-3xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card className="border-dashed border-2 py-32 flex flex-col items-center justify-center bg-muted/20 rounded-[2.5rem]">
                <p className="text-2xl font-bold text-muted-foreground">No matching products found</p>
                <Button variant="outline" onClick={clearFilters} className="mt-6 rounded-xl">Clear all filters</Button>
              </Card>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 animate-in fade-in duration-700">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-background text-foreground">
          <div className="container mx-auto py-10 px-4">
            <p>Loading...</p>
          </div>
        </main>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}