import { Card, CardContent } from "@/components/ui/card";
import { CategoryType } from "@/models/category";
import { ProductType } from "@/models/products";
import ProductCard from "@/components/custom/ProductCard";

async function getCategory(id: string): Promise<CategoryType | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories/${id}`,
      { cache: "no-store" },
    );
    const data = await res.json();
    return data.category || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getProductsByCategory(
  categoryId: string,
): Promise<ProductType[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products?category=${categoryId}`,
      { cache: "no-store" },
    );
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function CategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const category = await getCategory(id);
  const products = await getProductsByCategory(id);

  if (!category) {
    return (
      <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark pt-24">
        <div className="container mx-auto px-4">
          <p className="text-muted-foreground">Category not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark pt-24 pb-12 px-4">
      <div className="container mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="space-y-2 border-b border-white/10 pb-8">
          <h1 className="text-4xl font-black tracking-tight text-gradient">
            {category.name}
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Discover all items in the {category.name} collection.
          </p>
        </div>

        {products.length === 0 ? (
          <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-xl p-12 text-center">
            <CardContent>
              <p className="text-muted-foreground font-bold italic">
                No products found in this category yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
