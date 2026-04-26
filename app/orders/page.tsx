"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShoppingCartIcon } from "@hugeicons/core-free-icons";
import { Separator } from "@/components/ui/separator";

type Order = {
  _id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/orders?t=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark text-foreground">
        <div className="container mx-auto py-10 px-4">
          <p>Loading orders...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark text-foreground py-16">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <HugeiconsIcon icon={ShoppingCartIcon} className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">
              Order History
            </h1>
            <p className="text-muted-foreground tracking-tight">
              Review and track your recent purchases
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <Card className="app-card py-20 flex flex-col items-center justify-center rounded-2xl">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-6 text-muted-foreground">
              <HugeiconsIcon icon={ShoppingCartIcon} className="h-10 w-10" />
            </div>
            <p className="text-xl font-medium text-muted-foreground mb-8">
              No orders found yet
            </p>
            <Link href="/products">
              <Button size="lg" className="rounded-2xl px-10 shadow-lg">
                Explore Store
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card
                key={order._id}
                className="group app-card app-card-hover overflow-hidden rounded-2xl hover:scale-[1.01]"
              >
                <CardHeader className="pb-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-widest text-primary opacity-80">
                          Order
                        </span>
                        <CardTitle className="text-xl font-black tracking-tight">
                          #{order._id.slice(-8).toUpperCase()}
                        </CardTitle>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
                      <Badge
                        className={cn(
                          "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-tighter",
                          getStatusColor(order.status),
                        )}
                      >
                        {order.status}
                      </Badge>
                      <p className="text-2xl font-black text-gradient">
                        ${order.totalPrice?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <Separator className="mx-6 bg-white/10 w-auto" />
                <CardContent className="pt-4 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-10 w-10 rounded-xl border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold overflow-hidden"
                        >
                          <HugeiconsIcon
                            icon={ShoppingCartIcon}
                            className="h-4 w-4 opacity-30"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-sm font-bold text-muted-foreground">
                      {order.items.length} Product
                      {order.items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <Link href={`/orders/${order._id}`}>
                    <Button
                      variant="ghost"
                      className="group rounded-xl hover:text-primary hover:bg-primary/5"
                    >
                      Track Order{" "}
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">
                        →
                      </span>
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
