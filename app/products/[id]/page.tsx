import ProductDetails from "@/components/custom/ProductDetails";

export default async function Page({ params }: { params: { id: string } }) {
  const { id: productId } = await params;
  
  const [productRes, reviewsRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${productId}`, {
      cache: "no-store",
    }),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${productId}/reviews`, {
      cache: "no-store",
    })
  ]);

  const { product } = await productRes.json();
  const reviewsData = await reviewsRes.json();
  const reviews = reviewsData.reviews || [];

  if (!product) {
    return <div className="p-10">Product not found</div>;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-6 py-20">
        <ProductDetails product={product} initialReviews={reviews} />
      </section>
    </main>
  );
}
