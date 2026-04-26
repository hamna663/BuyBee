"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ShoppingCartIcon,
  Trash,
  ShoppingBasket01Icon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { CartType } from "@/models/cart";
import { CheckoutAddressDialog } from "@/components/custom/CheckoutAddressDialog";

type Item = {
  productId: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
};

type PopulatedCart = Omit<CartType, "items"> & {
  items: Item[];
};

export function CartSheet({ trigger }: { trigger: React.ReactElement }) {
  const [cart, setCart] = useState<PopulatedCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
  });

  const fetchCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch("/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCart(data.cart);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  const updateQuantity = async (productId: string, newQty: number) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/cart', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: newQty }),
      });
      if (res.ok) {
        toast.success('Cart updated');
        fetchCart();
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to update cart');
      }
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const removeItem = async (productId: string) => {
    await updateQuantity(productId, 0);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      setLoading(true);
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Checkout failed");
        return;
      }

      if (data.sessionUrl) {
        window.location.href = data.sessionUrl;
      }
    } catch (error: unknown) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const totalPrice =
    cart?.items?.reduce(
      (acc: number, item: Item) => acc + item.productId.price * item.quantity,
      0,
    ) || 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger render={trigger} />
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 glassmorphism dark:glassmorphism-dark border-l border-white/10">
        <SheetHeader className="p-6 border-b border-white/10">
          <SheetTitle className="flex items-center gap-2 text-2xl font-black">
            <HugeiconsIcon
              icon={ShoppingCartIcon}
              className="h-6 w-6 text-primary"
            />
            Your Cart
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          {loading && !cart ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : cart?.items?.length && cart?.items?.length > 0 ? (
            <ScrollArea className="h-full p-6">
              <div className="space-y-6">
                {cart.items.map((item: Item) => (
                  <div key={item.productId._id} className="flex gap-4 group">
                    <div className="relative h-24 w-24 rounded-2xl overflow-hidden bg-muted flex-shrink-0 border border-white/5">
                      <Image
                        src={item.productId.images?.[0] || "/placeholder.png"}
                        alt={item.productId.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-110 duration-500"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                            {item.productId.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all"
                            onClick={() => removeItem(item.productId._id)}
                          >
                            <HugeiconsIcon icon={Trash} className="h-4 w-4" />
                          </Button>
                        </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(item.productId._id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </Button>
              <span className="px-2 font-medium">{item.quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateQuantity(item.productId._id, item.quantity + 1)}
              >
                +
              </Button>
            </div>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="font-black text-primary">
                          ${(item.productId.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-4">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <HugeiconsIcon
                  icon={ShoppingBasket01Icon}
                  className="h-10 w-10"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">Your cart is empty</h3>
                <p className="text-muted-foreground mt-1">
                  Looks like you haven&apos;t added anything yet.
                </p>
              </div>
              <Link
                href="/products"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "rounded-xl mt-4 w-full",
                )}
                onClick={() => setIsOpen(false)}
              >
                Browse Products
              </Link>
            </div>
          )}
        </div>

        {Boolean(cart?.items?.length && cart.items.length > 0) && (
          <SheetFooter className="p-6 border-t border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="w-full space-y-4">
              <div className="flex justify-between text-lg">
                <span className="font-medium opacity-70">Total</span>
                <span className="font-black text-2xl">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/cart"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "rounded-xl h-12 w-full",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  View Cart
                </Link>
                <Button
                  className="rounded-xl h-12 w-full shadow-lg shadow-primary/20"
                  onClick={() => setIsCheckoutOpen(true)}
                >
                  Checkout
                </Button>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
      <CheckoutAddressDialog
        open={isCheckoutOpen}
        onOpenChange={setIsCheckoutOpen}
        address={address}
        onAddressChange={setAddress}
        onSubmit={handleCheckout}
        loading={loading}
      />
    </Sheet>
  );
}
