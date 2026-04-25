"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type OrderItem = {
  productId: {
    _id: string;
    name: string;
    images: string[];
    price: number;
  };
  quantity: number;
  price: number;
};

type Address = {
  street: string;
  city: string;
  state: string;
  country: string;
  zipcode: string;
};

type Order = {
  _id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  address: Address;
  items: OrderItem[];
};

const STATUS_STEPS = ["pending", "processing", "shipped", "delivered"];

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case "pending": return "bg-yellow-500 text-white";
    case "processing": return "bg-blue-500 text-white";
    case "shipped": return "bg-purple-500 text-white";
    case "delivered": return "bg-green-500 text-white";
    case "cancelled": return "bg-red-500 text-white";
    default: return "bg-gray-500 text-white";
  }
}

function StatusTimeline({ status }: { status: string }) {
  const isCancelled = status === "cancelled";
  const activeIdx = STATUS_STEPS.indexOf(status);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 text-red-500 font-semibold text-sm">
        <span className="h-3 w-3 rounded-full bg-red-500" />
        Order Cancelled
      </div>
    );
  }

  return (
    <div className="flex items-center gap-0">
      {STATUS_STEPS.map((step, i) => {
        const isActive = i <= activeIdx;
        const isLast = i === STATUS_STEPS.length - 1;
        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "h-4 w-4 rounded-full border-2 transition-all duration-300",
                  isActive
                    ? "bg-primary border-primary scale-110"
                    : "bg-muted border-muted-foreground/30"
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  isActive ? "text-primary" : "text-muted-foreground/50"
                )}
              >
                {step}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 w-12 mb-4 transition-all duration-500",
                  i < activeIdx ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/orders/${id}?t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data) && data.length > 0) {
          setOrder(data[0]);
        } else if (res.ok && data.order) {
          setOrder(data.order);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchOrder();
  }, [id]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrder((o) => o ? { ...o, status: "cancelled" } : o);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen py-16 px-6">
        <div className="container mx-auto max-w-4xl space-y-6">
          <div className="h-10 w-64 bg-muted rounded-2xl animate-pulse" />
          <div className="grid md:grid-cols-3 gap-6">
            <div className="h-64 bg-muted rounded-3xl animate-pulse" />
            <div className="md:col-span-2 h-64 bg-muted rounded-3xl animate-pulse" />
          </div>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-2xl font-bold text-muted-foreground">Order not found</p>
          <Link href="/orders">
            <Button className="rounded-xl">Back to Orders</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground py-16">
      <div className="container mx-auto px-6 max-w-5xl space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <button onClick={() => router.back()} className="text-sm text-muted-foreground hover:text-primary transition-colors mb-2 flex items-center gap-1">
              ← Back to orders
            </button>
            <h1 className="text-4xl font-black tracking-tight">Order Details</h1>
            <p className="text-muted-foreground font-mono text-sm mt-1">
              #{order._id.slice(-12).toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={cn("rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-widest", getStatusColor(order.status))}>
              {order.status}
            </Badge>
            {(order.status === "pending" || order.status === "processing") && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "Cancelling…" : "Cancel Order"}
              </Button>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <Card className="border-white/10 dark:bg-white/5 rounded-3xl">
          <CardContent className="p-8">
            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Order Progress</h2>
            <StatusTimeline status={order.status} />
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Summary Card */}
          <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-3xl">
            <CardContent className="p-8 space-y-6">
              <h2 className="font-black text-lg">Summary</h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Order Date</p>
                  <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Items</p>
                  <p className="font-semibold">{order.items.length} product{order.items.length !== 1 ? "s" : ""}</p>
                </div>
                <Separator className="bg-white/10" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Total</p>
                  <p className="text-3xl font-black text-gradient">${(order.totalPrice || 0).toFixed(2)}</p>
                </div>
              </div>

              {order.address && (
                <>
                  <Separator className="bg-white/10" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-2">Shipping To</p>
                    <p className="text-sm leading-relaxed">
                      {order.address.street}<br />
                      {order.address.city}, {order.address.state} {order.address.zipcode}<br />
                      {order.address.country}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <div className="md:col-span-2">
            <Card className="border-white/10 dark:bg-white/5 rounded-3xl">
              <CardContent className="p-8">
                <h2 className="font-black text-lg mb-6">Items Ordered</h2>
                <div className="space-y-6">
                  {order.items?.map((item, index) => (
                    <div key={index}>
                      <div className="flex gap-4 items-center">
                        <div className="relative h-20 w-20 rounded-2xl overflow-hidden shrink-0 bg-muted">
                          {item.productId?.images?.[0] ? (
                            <Image
                              src={item.productId.images[0]}
                              alt={item.productId?.name || "Product"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">No img</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold truncate">{item.productId?.name || "Product"}</h4>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                          <p className="text-sm text-muted-foreground">${(item.price || item.productId?.price || 0).toFixed(2)} each</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-black text-gradient">
                            ${((item.price || item.productId?.price || 0) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      {index < order.items.length - 1 && <Separator className="mt-6 bg-white/10" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
