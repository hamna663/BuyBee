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
import { 
  Search01Icon, 
  Cancel01Icon, 
  ArrowUpDownIcon,
  PackageIcon
} from "@hugeicons/core-free-icons";
import { PageHeader } from "@/components/custom/PageShell";

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
  const filterFieldClass =
    "h-9 bg-white/60 dark:bg-black/40 border-white/20 rounded-sm shadow-xs text-xs";
  const filterDropdownClass =
    "rounded-md border-white/10 glassmorphism dark:glassmorphism-dark";

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
      <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Synchronizing Inventory...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark text-foreground pb-20">
      <section className="mesh-gradient dark:mesh-gradient-dark py-20 px-6">
        <div className="container mx-auto">
          <div className="max-w-3xl space-y-4">
            <PageHeader
              title={
                <>
                  Explore Our <span className="text-gradient">Collection</span>
                </>
              }
              description="Find exactly what you need with our advanced filters and search."
              align="left"
              className="space-y-4"
            />
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 -mt-10">
        {/* Search and Filters */}
        <div className="space-y-8">
          <Card className="glassmorphism dark:glassmorphism-dark border-none shadow-lg p-0 overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-end">
                {/* Search */}
                <div className="w-full lg:max-w-xs space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400 ml-1">Search Products</Label>
                    <div className="relative group">
                      <Input
                        placeholder="Search our catalog..."
                        className={`${filterFieldClass} pl-9 focus-visible:ring-primary/30`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      />
                      <HugeiconsIcon 
                        icon={Search01Icon} 
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors group-focus-within:text-primary" 
                      />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1 w-full">
                  {/* Category Filter */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400 ml-1">Category</Label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => handleFilterChange("category", value)}
                    >
                      <SelectTrigger className={filterFieldClass}>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent className={filterDropdownClass}>
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
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400 ml-1">Price Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        className={filterFieldClass}
                        value={filters.minPrice}
                        onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        className={filterFieldClass}
                        value={filters.maxPrice}
                        onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400 ml-1">Rating</Label>
                    <Select
                      value={filters.rating}
                      onValueChange={(value) => handleFilterChange("rating", value)}
                    >
                      <SelectTrigger className={filterFieldClass}>
                        <SelectValue placeholder="Any" />
                      </SelectTrigger>
                      <SelectContent className={filterDropdownClass}>
                        <SelectItem value="">Any Rating</SelectItem>
                        <SelectItem value="4">4+ Stars</SelectItem>
                        <SelectItem value="3">3+ Stars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort */}
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest font-black text-gray-500 dark:text-gray-400 ml-1">Sort Order</Label>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value) => handleFilterChange("sortOrder", value)}
                    >
                      <SelectTrigger className={filterFieldClass}>
                        <div className="flex items-center gap-2">
                          <HugeiconsIcon icon={ArrowUpDownIcon} className="h-3 w-3 opacity-50" />
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent className={filterDropdownClass}>
                        <SelectItem value="desc">Newest First</SelectItem>
                        <SelectItem value="asc">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="ghost" onClick={clearFilters} className="h-9 text-muted-foreground hover:text-primary text-xs flex items-center gap-2">
                    <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                    Reset
                  </Button>
                  <Button onClick={handleSearch} className="h-9 px-6 shadow-md shadow-primary/20 hover:shadow-primary/40 transition-all text-xs font-black uppercase tracking-widest">
                    Update Results
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
                  <Card key={i} className="overflow-hidden border-none glassmorphism dark:glassmorphism-dark h-[400px]">
                    <div className="aspect-square bg-muted/40 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 w-2/3 bg-muted/60 animate-pulse rounded" />
                      <div className="h-3 w-1/3 bg-muted/40 animate-pulse rounded" />
                      <div className="pt-4 flex justify-between">
                        <div className="h-6 w-20 bg-muted/60 animate-pulse rounded" />
                        <div className="h-8 w-8 bg-muted/60 animate-pulse rounded-full" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : products.length === 0 ? (
              <Card className="glassmorphism dark:glassmorphism-dark border-none py-32 flex flex-col items-center justify-center shadow-lg">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                  <HugeiconsIcon icon={PackageIcon} className="h-10 w-10 text-primary opacity-50" />
                </div>
                <h3 className="text-2xl font-black mb-2">No matches found</h3>
                <p className="text-sm text-muted-foreground font-medium mb-8">Try adjusting your filters or search keywords.</p>
                <Button variant="outline" onClick={clearFilters} className="h-10 px-8 font-black uppercase tracking-widest text-[10px]">
                  Reset All Filters
                </Button>
              </Card>
            ) : (
              <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
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