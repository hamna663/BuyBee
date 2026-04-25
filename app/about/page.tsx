import { Card, CardContent } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-20 px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-primary mb-8 text-center">
          About BuyBee
        </h1>

        <Card>
          <CardContent className="p-8">
            <div className="space-y-6">
              <p className="text-lg">
                Welcome to <strong>BuyBee</strong>, your ultimate e-commerce
                platform where shopping meets convenience. We&apos;re passionate
                about connecting you with the best products from around the
                world.
              </p>

              <div>
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p>
                  To provide a seamless, secure, and enjoyable shopping
                  experience that puts our customers first. We believe in
                  quality, affordability, and exceptional customer service.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>Wide range of products across multiple categories</li>
                  <li>Secure and fast checkout process</li>
                  <li>Reliable shipping and delivery</li>
                  <li>24/7 customer support</li>
                  <li>Easy returns and exchanges</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  Why Choose BuyBee?
                </h2>
                <p>
                  With millions of satisfied customers and a commitment to
                  excellence, BuyBee is more than just an online store – it&apos;s
                  your trusted shopping companion. Join our community today and
                  discover the joy of smart shopping!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
