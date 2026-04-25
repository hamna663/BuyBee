"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon, ShoppingCartIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { toast } from "sonner";

type Product = {
  _id: string;
  name: string;
  price: number;
  images: string[];
};

type CartItem = {
  productId: Product;
  quantity: number;
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    country: "",
    zipcode: "",
  });

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/cart?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          window.location.href = "/auth/signin";
        }
        return;
      }
      setCartItems(data.cart?.items || []);
      setProducts(
        data.cart?.items?.reduce((acc: Record<string, Product>, item: CartItem) => {
          if (item.productId) acc[item.productId._id] = item.productId;
          return acc;
        }, {}) || {},
      );
    } catch (err) {
      console.error(err);
    }
  };

  const removeItem = async (id: string) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/cart/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchCart();
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("Item removed from cart");
  };

  const clearCart = async () => {
    const token = localStorage.getItem("token");
    await fetch(`/api/cart/clear?t=${Date.now()}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    setCartItems([]);
    window.dispatchEvent(new Event("cartUpdated"));
    toast.info("Cart cleared");
  };

  const handleCheckout = async () => {
    if (!address.street || !address.city || !address.state || !address.country || !address.zipcode) {
      toast.error("Please fill in all address fields");
      return;
    }

    setCheckoutLoading(true);
    const toastId = toast.loading("Creating your order…");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address }),
      });

      const data = await res.json();

      if (res.ok && data.sessionUrl) {
        toast.success("Order created! Redirecting to payment…", { id: toastId });
        window.dispatchEvent(new Event("cartUpdated"));
        // Redirect to Stripe checkout
        window.location.href = data.sessionUrl;
      } else {
        toast.error(data.error || "Failed to place order", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong", { id: toastId });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/cart/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity: newQuantity }),
    });
    if (res.ok) {
      fetchCart();
      window.dispatchEvent(new Event("cartUpdated"));
    }
  };

  const total = cartItems.reduce((acc, item) => {
    const product = products[item.productId._id];
    return acc + (product?.price || 0) * (item.quantity || 1);
  }, 0);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchCart();
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-6 max-w-7xl">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-12 w-12 rounded-2xl bg-muted animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded-xl animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-3xl animate-pulse" />
            ))}
          </div>
          <div className="h-80 bg-muted rounded-3xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-6 max-w-7xl">
      <div className="flex items-center gap-4 mb-12">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <HugeiconsIcon icon={ShoppingCartIcon} className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground">{cartItems.length} items in your basket</p>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <Card className="border-dashed border-2 py-20 flex flex-col items-center justify-center bg-muted/20 rounded-3xl">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6 text-muted-foreground">
            <HugeiconsIcon icon={ShoppingCartIcon} className="h-10 w-10" />
          </div>
          <p className="text-xl font-medium text-muted-foreground mb-8">Your cart feels a bit light…</p>
          <Link href="/products">
            <Button size="lg" className="rounded-2xl px-10 shadow-lg">Start Shopping</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => {
              const product = products[item.productId._id];
              if (!product) return null;
              return (
                <Card
                  key={item.productId._id}
                  className="group overflow-hidden border-white/10 dark:bg-white/5 backdrop-blur-sm rounded-3xl transition-all duration-300 hover:shadow-xl"
                >
                  <CardContent className="flex flex-col sm:flex-row items-center gap-6 p-6">
                    <div className="relative h-32 w-32 rounded-2xl overflow-hidden shrink-0">
                      <Image
                        src={product.images?.[0] || "/placeholder.png"}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        alt={product.name}
                        fill
                      />
                    </div>

                    <div className="flex-1 space-y-1 text-center sm:text-left">
                      <h2 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">
                        {product.name}
                      </h2>
                      <p className="text-muted-foreground text-sm">Premium Quality Product</p>
                      <div className="flex items-center justify-center sm:justify-start gap-4 mt-4">
                        <div className="flex items-center bg-muted/50 rounded-xl p-1 border border-white/5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-white/10"
                            onClick={() => updateQuantity(item.productId._id, (item.quantity || 1) - 1)}
                            disabled={item.quantity <= 1}
                          >
                            −
                          </Button>
                          <span className="w-10 text-center font-bold">{item.quantity || 1}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-white/10"
                            onClick={() => updateQuantity(item.productId._id, (item.quantity || 1) + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <span className="text-2xl font-black text-gradient ml-2">
                          ${(product.price * (item.quantity || 1)).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-12 w-12 rounded-2xl text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-colors shrink-0"
                      onClick={() => removeItem(item.productId._id)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="h-5 w-5" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}

            <div className="flex justify-between items-center pt-6">
              <Link href="/products">
                <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-primary">
                  <span>←</span> Continue Shopping
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </div>

          {/* Summary + Checkout */}
          <div className="space-y-8">
            <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-3xl overflow-hidden shadow-2xl">
              <CardContent className="p-8 space-y-6">
                <h2 className="text-2xl font-bold tracking-tight mb-6">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span className="font-medium">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span className="text-green-500 font-medium tracking-wide">FREE</span>
                  </div>
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Total Price</p>
                      <p className="text-4xl font-black text-gradient mt-1">${total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {!showCheckout && (
                  <Button
                    className="w-full h-14 rounded-2xl shadow-lg hover:shadow-primary/20 text-lg font-bold tracking-tight transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => setShowCheckout(true)}
                    disabled={cartItems.length === 0}
                  >
                    Proceed to Checkout
                  </Button>
                )}
              </CardContent>
            </Card>

            {showCheckout && (
              <Card className="border-white/10 dark:bg-white/5 backdrop-blur-sm rounded-3xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-bold tracking-tight">Shipping Details</h2>
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg" onClick={() => setShowCheckout(false)}>
                      Cancel
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="street" className="text-xs uppercase tracking-widest font-bold opacity-70">
                        Street Address
                      </Label>
                      <Input
                        id="street"
                        className="h-12 bg-muted/50 border-white/10 rounded-xl"
                        value={address.street}
                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                        placeholder="123 Main St"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-xs uppercase tracking-widest font-bold opacity-70">City</Label>
                        <Input
                          id="city"
                          className="h-12 bg-muted/50 border-white/10 rounded-xl"
                          value={address.city}
                          onChange={(e) => setAddress({ ...address, city: e.target.value })}
                          placeholder="New York"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-xs uppercase tracking-widest font-bold opacity-70">State</Label>
                        <Input
                          id="state"
                          className="h-12 bg-muted/50 border-white/10 rounded-xl"
                          value={address.state}
                          onChange={(e) => setAddress({ ...address, state: e.target.value })}
                          placeholder="NY"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-xs uppercase tracking-widest font-bold opacity-70">Country</Label>
                        <Input
                          id="country"
                          className="h-12 bg-muted/50 border-white/10 rounded-xl"
                          value={address.country}
                          onChange={(e) => setAddress({ ...address, country: e.target.value })}
                          placeholder="USA"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipcode" className="text-xs uppercase tracking-widest font-bold opacity-70">Zip Code</Label>
                        <Input
                          id="zipcode"
                          className="h-12 bg-muted/50 border-white/10 rounded-xl"
                          value={address.zipcode}
                          onChange={(e) => setAddress({ ...address, zipcode: e.target.value })}
                          placeholder="10001"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full h-14 rounded-2xl shadow-lg hover:shadow-primary/20 text-lg font-bold tracking-tight transition-all duration-300 hover:scale-[1.02]"
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                  >
                    {checkoutLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                        Processing…
                      </span>
                    ) : (
                      "Pay with Stripe →"
                    )}
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    🔒 Secure payment powered by Stripe
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
