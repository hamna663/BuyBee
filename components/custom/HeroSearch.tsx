"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
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
  );
}
