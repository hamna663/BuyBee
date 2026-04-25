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
      <main className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto py-10 px-4">
          <p>Category not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold text-primary mb-8">
          {category.name}
        </h1>

        {products.length === 0 ? (
          <Card>
            <CardContent className="text-center py-10">
              <p className="text-muted-foreground">
                No products in this category.
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
