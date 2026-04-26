"use client";

import { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/custom/ImageUpload";
import { AdminProductCard } from "@/components/custom/AdminProductCard";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GridIcon,
  ListXIcon,
  Edit01Icon,
  Trash,
  ViewIcon,
  ShoppingCartIcon,
  CreditCardIcon,
  PresentationIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { OrderType } from "@/models/order";
import Image from "next/image";

// Types
type Order = {
  _id: string;
  user: { name: string; email: string };
  items: Array<{
    productId: { name: string; price: number };
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  status: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipcode: string;
  };
  stripeSessionId?: string;
  createdAt: string;
};

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  categoryId: { _id: string; name: string };
  stock: number;
  images: string[];
  averageRating: number;
};

type Category = {
  _id: string;
  name: string;
  description: string;
  images: string[];
  productsCount?: number;
};

type Message = {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type Stats = {
  totalOrders: number;
  totalProducts: number;
  totalCategories: number;
  totalRevenue: number;
};

function AdminContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get("tab") as
    | "dashboard"
    | "orders"
    | "payments"
    | "products"
    | "categories"
    | "messages"
    | null;
  const activeTab = activeTabParam || "dashboard";

  const setActiveTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  };
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
    totalRevenue: 0,
  });
  const [analyticsData, setAnalyticsData] = useState<{
    chartData: { date: string; revenue: number; orders: number }[];
    topProducts: { name: string; sales: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");

  // Form states
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
    images: "",
  });
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    images: "",
  });
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Fetch stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/orders?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();

      let totalRevenue = 0;
      if (res.ok && data.orders) {
        totalRevenue = data.orders
          .filter(
            (o: OrderType) =>
              o.status !== "pending" && o.status !== "cancelled",
          )
          .reduce(
            (acc: number, order: OrderType) => acc + (order.totalPrice || 0),
            0,
          );
      }

      const productsRes = await fetch(`/api/products?limit=1000`, {
        cache: "no-store",
      });
      const productsData = await productsRes.json();

      const categoriesRes = await fetch(`/api/categories`, {
        cache: "no-store",
      });
      const categoriesData = await categoriesRes.json();

      const analyticsRes = await fetch(`/api/admin/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      if (analyticsRes.ok) {
        const analyticsResult = await analyticsRes.json();
        setAnalyticsData(analyticsResult);
      }

      setStats({
        totalOrders: (res.ok ? data.total : 0) || 0,
        totalProducts: productsData.total || productsData.products?.length || 0,
        totalCategories: categoriesData.categories?.length || 0,
        totalRevenue,
      });
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

// State for customer filter
const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
// List of customers for the dropdown
const [customers, setCustomers] = useState<any[]>([]);

// Fetch customers (admin only)
const fetchCustomers = useCallback(async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/admin/users?role=customer`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json();
    if (res.ok) {
      setCustomers(data.users || []);
    } else {
      console.error("Failed to fetch customers:", data.error || res.statusText);
    }
  } catch (err) {
    console.error("Failed to fetch customers:", err);
  }
}, []);

  // Fetch orders
  const fetchOrders =useCallback(
   async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/admin/orders?limit=100&status=${orderStatus}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        },
      );
      const data = await res.json();

      if (res.ok) {
        const mappedOrders = (data.orders || []).map((order: OrderType) => ({
          ...order,
          user: order.userId, // expose as `user`
        })) as Order[];
        setOrders(mappedOrders);
      } else {
        console.error("Failed to fetch orders:", data.error || res.statusText);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  },[orderStatus])

  // Load customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch orders when filters change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Fetch products
  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?limit=100`, {
        cache: "no-store",
      });
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`/api/categories?t=${Date.now()}`, {
        cache: "no-store",
      });
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  // Fetch messages
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  // Update message status
  const updateMessageStatus = async (id: string, read: boolean) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/admin/messages`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, read }),
      });
      fetchMessages();
    } catch (err) {
      console.error("Failed to update message:", err);
    }
  };

  // Delete message
  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      const token = localStorage.getItem("token");
      await fetch(`/api/admin/messages?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMessages();
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  // Create product
  const createProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          price: Number(productForm.price),
          category: productForm.categoryId,
          stock: Number(productForm.stock),
          images: productForm.images
            ? productForm.images.split(",").map((img) => img.trim())
            : [],
        }),
      });

      if (res.ok) {
        setShowProductDialog(false);
        setProductForm({
          name: "",
          description: "",
          price: "",
          categoryId: "",
          stock: "",
          images: "",
        });
        fetchProducts();
        fetchStats();
      }
    } catch (err) {
      console.error("Failed to create product:", err);
    }
  };

  // Delete product
  const deleteProduct = async (productId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchProducts();
        fetchStats();
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  // Update product
  const updateProduct = async () => {
    if (!editingProduct) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          price: Number(productForm.price),
          category: productForm.categoryId,
          stock: Number(productForm.stock),
          images: productForm.images
            ? productForm.images.split(",").map((img) => img.trim())
            : [],
        }),
      });

      if (res.ok) {
        setShowProductDialog(false);
        setEditingProduct(null);
        setProductForm({
          name: "",
          description: "",
          price: "",
          categoryId: "",
          stock: "",
          images: "",
        });
        fetchProducts();
        fetchStats();
      }
    } catch (err) {
      console.error("Failed to update product:", err);
    }
  };

  // Create category
  const createCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: categoryForm.name,
          description: categoryForm.description,
          images: categoryForm.images.split(",").map((img) => img.trim()),
        }),
      });

      if (res.ok) {
        setShowCategoryDialog(false);
        setCategoryForm({ name: "", description: "", images: "" });
        fetchCategories();
        fetchStats();
      }
    } catch (err) {
      console.error("Failed to create category:", err);
    }
  };

  // Delete category
  const deleteCategory = async (categoryId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchCategories();
        fetchStats();
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  // Update category
  const updateCategory = async () => {
    if (!editingCategory) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/categories/${editingCategory._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: categoryForm.name,
          description: categoryForm.description,
          images: categoryForm.images.split(",").map((img) => img.trim()),
        }),
      });

      if (res.ok) {
        setShowCategoryDialog(false);
        setEditingCategory(null);
        setCategoryForm({ name: "", description: "", images: "" });
        fetchCategories();
        fetchStats();
      }
    } catch (err) {
      console.error("Failed to update category:", err);
    }
  };

  // Open product dialog for edit
  const openEditProduct = (product: Product) => {
    setEditingProduct(product);

    // Normalize category ID
    let catId = "";
    if (product.categoryId) {
      catId =
        typeof product.categoryId === "string"
          ? product.categoryId
          : product.categoryId._id || "";
    }

    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      categoryId: String(catId),
      stock: product.stock.toString(),
      images: product.images?.join(",") || "",
    });
    setShowProductDialog(true);
  };

  // Open category dialog for edit
  const openEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      images: category.images?.join(",") || "",
    });
    setShowCategoryDialog(true);
  };

  // Handle product form submit
  const handleProductSubmit = () => {
    if (!productForm.name || !productForm.price || !productForm.categoryId) {
      alert("Please fill in all required fields (Name, Price, Category)");
      return;
    }
    if (Number(productForm.price) < 0) {
      alert("Price cannot be negative");
      return;
    }
    if (Number(productForm.stock) < 0) {
      alert("Stock cannot be negative");
      return;
    }

    if (editingProduct) {
      updateProduct();
    } else {
      createProduct();
    }
  };

  // Handle category form submit
  const handleCategorySubmit = () => {
    if (editingCategory) {
      updateCategory();
    } else {
      createCategory();
    }
  };

  useEffect(() => {
    const verifyAdmin = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token || role !== "admin") {
        window.location.href = "/auth/signin";
        return;
      }

      try {
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          window.location.href = "/auth/signin";
          return;
        }

        // const data = await res.json();
        // Additional check for role from server if needed
      } catch (err) {
        console.error("Admin verification failed:", err);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await verifyAdmin();
      await Promise.all([
        fetchStats(),
        fetchOrders(),
        fetchProducts(),
        fetchCategories(),
        fetchMessages(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
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

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="container mx-auto py-10 px-4">
      {/* HERO SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 pt-4">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-primary">
            Admin Portal
          </h1>
          <p className="text-muted-foreground mt-1 font-medium opacity-80">
            Manage your store, orders, and products.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar w-full md:w-auto max-w-full whitespace-nowrap">
          <Button
            variant={activeTab === "dashboard" ? "default" : "ghost"}
            onClick={() => setActiveTab("dashboard")}
            className="rounded-xl px-6 transition-all duration-300"
          >
            Dashboard
          </Button>
          <Button
            variant={activeTab === "orders" ? "default" : "ghost"}
            onClick={() => setActiveTab("orders")}
            className="rounded-xl px-6 transition-all duration-300"
          >
            Orders
          </Button>
          <Button
            variant={activeTab === "payments" ? "default" : "ghost"}
            onClick={() => setActiveTab("payments")}
            className="rounded-xl px-6 transition-all duration-300"
          >
            Payments
          </Button>
          <Button
            variant={activeTab === "products" ? "default" : "ghost"}
            onClick={() => setActiveTab("products")}
            className="rounded-xl px-6 transition-all duration-300"
          >
            Products
          </Button>
          <Button
            variant={activeTab === "categories" ? "default" : "ghost"}
            onClick={() => setActiveTab("categories")}
            className="rounded-xl px-6 transition-all duration-300"
          >
            Categories
          </Button>
          <Button
            variant={activeTab === "messages" ? "default" : "ghost"}
            onClick={() => setActiveTab("messages")}
            className="rounded-xl px-6 transition-all duration-300"
          >
            Messages
          </Button>
        </div>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              className="glassmorphism dark:glassmorphism-dark border-none rounded-xl overflow-hidden group hover:shadow-primary/10 transition-all duration-500 cursor-pointer"
              onClick={() => setActiveTab("orders")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-60 flex justify-between items-center">
                  Total Orders
                  <HugeiconsIcon
                    icon={ShoppingCartIcon}
                    className="h-4 w-4 text-primary"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-gradient">
                    {stats.totalOrders}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="glassmorphism dark:glassmorphism-dark border-none rounded-xl overflow-hidden group hover:shadow-primary/10 transition-all duration-500 cursor-pointer"
              onClick={() => setActiveTab("payments")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-60 flex justify-between items-center">
                  Revenue
                  <span className="text-primary font-black">$</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-gradient">
                    ${stats.totalRevenue?.toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="glassmorphism dark:glassmorphism-dark border-none rounded-xl overflow-hidden group hover:shadow-primary/10 transition-all duration-500 cursor-pointer"
              onClick={() => setActiveTab("products")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-60 flex justify-between items-center">
                  Products
                  <HugeiconsIcon
                    icon={GridIcon}
                    className="h-4 w-4 text-primary"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 pb-2">
                  <p className="text-4xl font-black text-gradient">
                    {stats.totalProducts}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="glassmorphism dark:glassmorphism-dark border-none rounded-xl overflow-hidden group hover:shadow-primary/10 transition-all duration-500 cursor-pointer"
              onClick={() => setActiveTab("categories")}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest opacity-60 flex justify-between items-center">
                  Categories
                  <HugeiconsIcon
                    icon={ListXIcon}
                    className="h-4 w-4 text-primary"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 pb-2">
                  <p className="text-4xl font-black text-gradient">
                    {stats.totalCategories}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-xl p-4 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={ShoppingCartIcon}
                      className="h-5 w-5 text-primary"
                    />
                  </div>
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {orders.slice(0, 6).map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between group p-3 hover:bg-secondary/40 rounded-2xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "h-11 w-11 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                            getStatusColor(order.status)
                              .replace("bg-", "bg-opacity-20 text-")
                              .replace("-500", "-500"),
                          )}
                        >
                          <HugeiconsIcon
                            icon={ShoppingCartIcon}
                            className="h-5 w-5"
                          />
                        </div>
                        <div>
                          <p className="font-bold group-hover:text-primary transition-colors text-lg leading-none mb-1">
                            {order.user?.name || "Customer"}
                          </p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="font-black text-lg">
                        ${order.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-xl p-4 shadow-2xl relative overflow-hidden group">
              {/* Decorative background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-700" />

              <CardHeader>
                <CardTitle className="text-2xl font-black flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-secondary/50 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={PresentationIcon}
                      className="h-5 w-5 text-primary"
                    />
                  </div>
                  Revenue & Orders (Last 30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10 p-4">
                {analyticsData?.chartData ? (
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={analyticsData.chartData}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorRevenue"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#3b82f6"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#3b82f6"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="rgba(255,255,255,0.1)"
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                          tickFormatter={(value) =>
                            new Date(value).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })
                          }
                          axisLine={false}
                          tickLine={false}
                          minTickGap={20}
                        />
                        <YAxis
                          tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "rgba(0,0,0,0.8)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                          }}
                          labelStyle={{
                            color: "rgba(255,255,255,0.7)",
                            marginBottom: "4px",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-72 w-full flex items-center justify-center">
                    <p className="text-muted-foreground animate-pulse">
                      Loading charts...
                    </p>
                  </div>
                )}

                {analyticsData?.topProducts && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <p className="text-[10px] uppercase tracking-widest font-black opacity-50 mb-4">
                      Top Selling Products
                    </p>
                    <div className="space-y-3">
                      {analyticsData.topProducts.map((p, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5"
                        >
                          <p className="font-bold text-sm">{p.name}</p>
                          <p className="text-xs font-black text-primary">
                            {p.sales} sold
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-xl overflow-hidden shadow-2xl animate-in fade-in duration-700">
          <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <div>
              <CardTitle className="text-3xl font-black">
                Order Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Review and fulfill customer orders.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Order status filter */}
              <div className="flex items-center">
                <label className="mr-2 font-medium">Status:</label>
                <select
                  value={orderStatus}
                  onChange={(e) => setOrderStatus(e.target.value)}
                  className="border rounded-md p-1"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              {/* <Button variant="outline" className="rounded-xl border-white/10">
                Export Data
              </Button> */}
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto no-scrollbar">
            <Table className="min-w-[800px] md:min-w-full">
              <TableHeader className="bg-muted/40">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="py-4 px-6 font-black uppercase tracking-widest text-[10px] opacity-50">
                    ID
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50">
                    Customer
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50">
                    Total
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50">
                    Status
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50">
                    Date
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50 text-right px-10">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order._id}
                    className="border-white/5 hover:bg-primary/5 transition-all duration-300 group"
                  >
                    <TableCell className="py-4 px-6 font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">
                      #{order._id.slice(-6)}
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-lg leading-tight">
                        {order.user?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {order.user?.email}
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-xl text-primary">
                      ${order.totalPrice?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "rounded-xl px-4 py-1 border-none font-bold text-[10px] uppercase tracking-wider",
                          getStatusColor(order.status),
                        )}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm font-medium opacity-60">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded h-9 w-9 hover:bg-primary hover:text-white hover:rotate-12 transition-all duration-300 shadow-sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setNewStatus(order.status);
                        }}
                      >
                        <HugeiconsIcon icon={ViewIcon} className="h-5 w-5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Payments Tab */}
      {activeTab === "payments" && (
        <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-xl overflow-hidden shadow-2xl animate-in fade-in duration-700">
          <CardHeader className="flex flex-row items-center justify-between p-6 border-b border-white/10 bg-white/5">
            <div>
              <CardTitle className="text-3xl font-black">
                Payments Received
              </CardTitle>
              <p className="text-xs font-medium text-muted-foreground mt-1">
                Monitor all transaction history and payment statuses.
              </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <HugeiconsIcon
                icon={CreditCardIcon}
                className="h-6 w-6 text-primary"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto no-scrollbar">
            <Table className="min-w-[800px] md:min-w-full">
              <TableHeader className="bg-muted/40">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="py-4 px-6 font-black uppercase tracking-widest text-[10px] opacity-50">
                    Transaction ID
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50">
                    Customer
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50">
                    Amount
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50">
                    Date
                  </TableHead>
                  <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow
                    key={order._id}
                    className="border-white/5 hover:bg-primary/5 transition-all duration-300 group"
                  >
                    <TableCell className="py-4 px-6 font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">
                      {order.stripeSessionId ? (
                        <span className="text-green/80 font-bold">
                          {order.stripeSessionId.slice(-12)}
                        </span>
                      ) : (
                        <span className="opacity-40 italic">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">
                          {order.user?.name || "Deleted User"}
                        </span>
                        <span className="text-[10px] opacity-40">
                          {order.user?.email || ""}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-black text-lg text-gradient">
                      ${order.totalPrice?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs font-medium opacity-60">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "pending"
                            ? "outline"
                            : order.status === "cancelled"
                              ? "destructive"
                              : "default"
                        }
                        className={cn(
                          "rounded-lg px-3 py-1 font-black uppercase text-[10px] tracking-widest",
                          order.status === "processing" &&
                            "bg-green-500/20 text-green-500 border-green-500/20",
                          order.status === "shipped" &&
                            "bg-blue-500/20 text-blue-500 border-blue-500/20",
                          order.status === "delivered" &&
                            "bg-primary/20 text-primary border-primary/20",
                        )}
                      >
                        {order.status === "processing" ? "PAID" : order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {/* Products Tab */}
      {activeTab === "products" && (
        <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-xl overflow-hidden shadow-2xl animate-in fade-in duration-700">
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-white/10 bg-white/5 gap-4">
            <div>
              <CardTitle className="text-3xl font-black">
                Product Inventory
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your product catalog and stock levels.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-secondary/30 p-1.5 rounded-2xl border border-white/10">
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("cards")}
                className="rounded-xl"
              >
                <HugeiconsIcon icon={GridIcon} className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-xl"
              >
                <HugeiconsIcon icon={ListXIcon} className="h-5 w-5" />
              </Button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <Dialog
                open={showProductDialog}
                onOpenChange={(open) => {
                  setShowProductDialog(open);
                  if (!open) {
                    setEditingProduct(null);
                    setProductForm({
                      name: "",
                      description: "",
                      price: "",
                      categoryId: "",
                      stock: "",
                      images: "",
                    });
                  }
                }}
              >
                <DialogTrigger
                  render={
                    <Button className="rounded-xl px-6 bg-primary font-bold" />
                  }
                >
                  Add Product
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glassmorphism dark:glassmorphism-dark border-white/10 rounded-xl custom-scrollbar shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black">
                      {editingProduct ? "Edit Product" : "Add New Product"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="font-bold opacity-70">
                          Product Name
                        </Label>
                        <Input
                          id="name"
                          value={productForm.name}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              name: e.target.value,
                            })
                          }
                          className="h-9 bg-white/50 dark:bg-black/20 rounded-lg text-xs border-white/10 focus:border-primary/50"
                          placeholder="Premium Watch Series 5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price" className="font-bold opacity-70">
                          Price ($)
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={productForm.price}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              price: e.target.value,
                            })
                          }
                          className="h-9 bg-white/50 dark:bg-black/20 rounded-lg text-xs border-white/10 focus:border-primary/50"
                          placeholder="299.99"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="font-bold opacity-70"
                      >
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            description: e.target.value,
                          })
                        }
                        className="min-h-[100px] bg-white/50 dark:bg-black/20 rounded-lg text-xs border-white/10 focus:border-primary/50"
                        placeholder="Describe the product features..."
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label
                          htmlFor="category"
                          className="font-bold opacity-70"
                        >
                          Category
                        </Label>
                        <Select
                          value={String(productForm.categoryId)}
                          onValueChange={(value) =>
                            setProductForm({
                              ...productForm,
                              categoryId: value || "",
                            })
                          }
                        >
                          <SelectTrigger
                            id="category"
                            className="h-9 w-full bg-white/50 dark:bg-black/20 rounded px-4 flex items-center justify-between text-xs"
                          >
                            <SelectValue placeholder="Select a category">
                              {
                                categories.find(
                                  (c) =>
                                    String(c._id) ===
                                    String(productForm.categoryId),
                                )?.name
                              }
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="rounded-xl glassmorphism dark:glassmorphism-dark">
                            {categories.map((cat) => (
                              <SelectItem
                                key={String(cat._id)}
                                value={String(cat._id)}
                              >
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock" className="font-bold opacity-70">
                          Inventory Stock
                        </Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={productForm.stock}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              stock: e.target.value,
                            })
                          }
                          className="h-9 w-full bg-white/50 dark:bg-black/20 rounded text-xs"
                          placeholder="100"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold opacity-70">
                        Product Visuals
                      </Label>
                      <ImageUpload
                        value={productForm.images}
                        onChange={(url) =>
                          setProductForm({
                            ...productForm,
                            images: url,
                          })
                        }
                        multiple={true}
                      />
                    </div>
                    <Button
                      onClick={handleProductSubmit}
                      className="h-10 rounded-lg font-black text-sm shadow-xl shadow-primary/20"
                    >
                      {editingProduct ? "Update Product" : "Launch Product"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className={cn("p-0", viewMode === "cards" && "p-8")}>
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                  <AdminProductCard
                    key={product._id}
                    product={product}
                    onEdit={openEditProduct}
                    onDelete={deleteProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <Table className="min-w-[1000px] md:min-w-full">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="py-4 px-6 font-black uppercase tracking-widest text-[10px] opacity-50">
                        Image
                      </TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50">
                        Name
                      </TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50">
                        Category
                      </TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50">
                        Price
                      </TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50">
                        Stock
                      </TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50 text-right px-10">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow
                        key={product._id}
                        className="border-white/5 hover:bg-primary/5 transition-all duration-300 group"
                      >
                        <TableCell className="py-4 px-6">
                          <Image
                            src={product.images?.[0] || "/placeholder.png"}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-xl border border-white/10 group-hover:scale-110 transition-transform"
                            width={48}
                            height={48}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-lg leading-tight">
                            {product.name}
                          </div>
                          <div className="text-[10px] opacity-40 font-mono">
                            ID: {product._id.slice(-6)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="rounded-lg bg-secondary/30 border-white/5 font-bold uppercase text-[10px] tracking-wider px-2 py-0.5"
                          >
                            {categories.find(
                              (c) =>
                                String(c._id) === String(product.categoryId),
                            )?.name || "Uncategorized"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-black text-xl text-primary">
                          ${product.price.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5">
                            <span
                              className={cn(
                                "text-[10px] font-black uppercase tracking-widest",
                                product.stock < 10
                                  ? "text-red-500"
                                  : "text-green-500",
                              )}
                            >
                              {product.stock} Units
                            </span>
                            <div className="h-1 w-24 bg-secondary rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-1000",
                                  product.stock < 10
                                    ? "bg-red-500"
                                    : "bg-primary",
                                )}
                                style={{
                                  width: `${Math.min((product.stock / 100) * 100, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-10">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all hover:rotate-12"
                              onClick={() => openEditProduct(product)}
                            >
                              <HugeiconsIcon
                                icon={Edit01Icon}
                                className="h-4 w-4"
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all hover:-rotate-12"
                              onClick={() => deleteProduct(product._id)}
                            >
                              <HugeiconsIcon icon={Trash} className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-xl overflow-hidden shadow-2xl animate-in fade-in duration-700">
          <CardHeader className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-white/10 bg-white/5 gap-4">
            <div>
              <CardTitle className="text-3xl font-black">
                Market Segments
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Categorize your products for better discovery.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-secondary/30 p-1.5 rounded-2xl border border-white/10">
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("cards")}
                className="rounded-xl"
              >
                <HugeiconsIcon icon={GridIcon} className="h-5 w-5" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-xl"
              >
                <HugeiconsIcon icon={ListXIcon} className="h-5 w-5" />
              </Button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              <Dialog
                open={showCategoryDialog}
                onOpenChange={(open) => {
                  setShowCategoryDialog(open);
                  if (!open) {
                    setEditingCategory(null);
                    setCategoryForm({ name: "", description: "", images: "" });
                  }
                }}
              >
                <DialogTrigger
                  render={
                    <Button className="rounded-xl px-6 bg-primary font-bold" />
                  }
                >
                  Add Category
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto glassmorphism dark:glassmorphism-dark border-white/10 rounded-xl custom-scrollbar shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black">
                      {editingCategory ? "Edit Category" : "Add New Category"}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="catName" className="font-bold opacity-70">
                        Category Name
                      </Label>
                      <Input
                        id="catName"
                        value={categoryForm.name}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            name: e.target.value,
                          })
                        }
                        className="h-10 bg-white/50 dark:bg-black/20 rounded-lg text-sm border-white/10 focus:border-primary/50"
                        placeholder="Electronics, Fashion, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="catDesc" className="font-bold opacity-70">
                        Description
                      </Label>
                      <Textarea
                        id="catDesc"
                        value={categoryForm.description}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            description: e.target.value,
                          })
                        }
                        className="min-h-[80px] bg-white/50 dark:bg-black/20 rounded-lg text-xs border-white/10 focus:border-primary/50"
                        placeholder="What defines this category?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold opacity-70">
                        Category Visual
                      </Label>
                      <ImageUpload
                        value={categoryForm.images}
                        onChange={(url) =>
                          setCategoryForm({ ...categoryForm, images: url })
                        }
                      />
                    </div>
                    <Button
                      onClick={handleCategorySubmit}
                      className="h-10 rounded-lg font-black text-sm shadow-xl shadow-primary/20"
                    >
                      {editingCategory
                        ? "Update Category"
                        : "Establish Category"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent className={cn("p-0", viewMode === "cards" && "p-8")}>
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {categories.map((category) => (
                  <Card
                    key={category._id}
                    className="glassmorphism dark:glassmorphism-dark border-none rounded-xl overflow-hidden group hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="aspect-video relative bg-muted overflow-hidden">
                      <Image
                        src={category.images?.[0] || "/placeholder.png"}
                        alt={category.name}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
                        fill
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <h3 className="text-2xl font-black text-white tracking-tight px-4 text-center">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground line-clamp-2 font-medium">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                        <span className="font-black text-primary uppercase text-[10px] tracking-widest">
                          {category.productsCount || 0} Products Linked
                        </span>
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white"
                            onClick={() => openEditCategory(category)}
                          >
                            <HugeiconsIcon
                              icon={Edit01Icon}
                              className="h-4 w-4"
                            />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-10 w-10 rounded-xl"
                            onClick={() => deleteCategory(category._id)}
                          >
                            <HugeiconsIcon icon={Trash} className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar">
                <Table className="min-w-[800px] md:min-w-full">
                  <TableHeader className="bg-muted/40">
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="py-4 px-6 font-black uppercase tracking-widest text-[10px] opacity-50">
                        Visual
                      </TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50">
                        Category Name
                      </TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50">
                        Description
                      </TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px] opacity-50">
                        Inventory
                      </TableHead>
                      <TableHead className="text-right px-10 font-black uppercase tracking-widest text-[10px] opacity-50">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow
                        key={category._id}
                        className="border-white/5 hover:bg-primary/5 transition-all duration-300 group"
                      >
                        <TableCell className="py-4 px-6">
                          <Image
                            src={category.images?.[0] || "/placeholder.png"}
                            alt={category.name}
                            className="w-16 h-10 object-cover rounded-lg border border-white/10 group-hover:scale-110 transition-transform"
                            width={64}
                            height={40}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-lg leading-tight">
                            {category.name}
                          </div>
                          <div className="text-[10px] opacity-40 font-mono italic">
                            Sector Identified
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm font-medium text-muted-foreground">
                          {category.description}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <span className="font-black">
                              {category.productsCount || 0} Items
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right px-10">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-lg hover:bg-primary/10 hover:text-primary transition-all hover:rotate-12"
                              onClick={() => openEditCategory(category)}
                            >
                              <HugeiconsIcon
                                icon={Edit01Icon}
                                className="h-4 w-4"
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all hover:-rotate-12"
                              onClick={() => deleteCategory(category._id)}
                            >
                              <HugeiconsIcon icon={Trash} className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader className="flex flex-row justify-between items-center p-6 border-b border-white/10 bg-white/5">
            <div>
              <CardTitle className="text-3xl font-black tracking-tight">
                Customer Inquiries
              </CardTitle>
              <p className="text-sm text-muted-foreground font-medium mt-1">
                Manage messages from the contact page
              </p>
            </div>
            <Badge
              variant="outline"
              className="rounded-full px-4 py-1 font-bold bg-primary/10 border-primary/20 text-primary uppercase text-[10px] tracking-widest"
            >
              {messages.filter((m) => !m.read).length} Unread
            </Badge>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto no-scrollbar">
            <Table className="min-w-[800px] md:min-w-full">
              <TableHeader className="bg-muted/40">
                <TableRow className="border-white/5">
                  <TableHead className="py-6 px-8">Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right px-8">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-20 text-muted-foreground font-bold"
                    >
                      No messages found
                    </TableCell>
                  </TableRow>
                ) : (
                  messages.map((msg) => (
                    <TableRow
                      key={msg._id}
                      className="border-white/5 hover:bg-white/5 group"
                    >
                      <TableCell className="py-6 px-8">
                        <div
                          className={`h-3 w-3 rounded-full ${msg.read ? "bg-white/10" : "bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-black text-lg">{msg.name}</span>
                          <span className="text-xs text-muted-foreground font-bold">
                            {msg.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col max-w-md">
                          <span className="font-bold text-primary">
                            {msg.subject}
                          </span>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {msg.message}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium opacity-60">
                        {new Date(msg.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <div className="flex gap-2 justify-end">
                          <Dialog>
                            <DialogTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white"
                                  onClick={() =>
                                    updateMessageStatus(msg._id, true)
                                  }
                                />
                              }
                            >
                              <HugeiconsIcon
                                icon={ViewIcon}
                                className="h-4 w-4"
                              />
                            </DialogTrigger>
                            <DialogContent className="rounded-xl glassmorphism dark:glassmorphism-dark border-none max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-black">
                                  Message from {msg.name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6 py-6">
                                <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl">
                                  <div>
                                    <p className="text-[10px] uppercase font-black opacity-50">
                                      Email
                                    </p>
                                    <p className="font-bold">{msg.email}</p>
                                  </div>
                                  <div>
                                    <p className="text-[10px] uppercase font-black opacity-50">
                                      Sent On
                                    </p>
                                    <p className="font-bold">
                                      {new Date(msg.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase font-black opacity-50 mb-1">
                                    Subject
                                  </p>
                                  <p className="text-xl font-black text-primary">
                                    {msg.subject}
                                  </p>
                                </div>
                                <Separator className="bg-white/5" />
                                <div>
                                  <p className="text-[10px] uppercase font-black opacity-50 mb-2">
                                    Message Content
                                  </p>
                                  <div className="bg-white/5 p-6 rounded-xl leading-relaxed whitespace-pre-wrap">
                                    {msg.message}
                                  </div>
                                </div>
                                <div className="flex justify-end gap-4 pt-4">
                                  <Button
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() =>
                                      updateMessageStatus(msg._id, !msg.read)
                                    }
                                  >
                                    Mark as {msg.read ? "Unread" : "Read"}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    className="rounded-xl"
                                    onClick={() => {
                                      deleteMessage(msg._id);
                                    }}
                                  >
                                    Delete Inquiry
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl hover:bg-red-500 hover:text-white"
                            onClick={() => deleteMessage(msg._id)}
                          >
                            <HugeiconsIcon icon={Trash} className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar glassmorphism dark:glassmorphism-dark border-white/10 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">
              Order Details
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Order ID</p>
                  <p className="text-xs font-mono">{selectedOrder._id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p>
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium">Customer</p>
                <p>{selectedOrder.user?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.user?.email}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium">Shipping Address</p>
                <p>{selectedOrder.address?.street}</p>
                <p>
                  {selectedOrder.address?.city}, {selectedOrder.address?.state}{" "}
                  {selectedOrder.address?.zipcode}
                </p>
                <p>{selectedOrder.address?.country}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium">Items</p>
                {selectedOrder.items?.map((item, index) => {
                  const itemPrice = item.price || item.productId?.price || 0;
                  return (
                    <div
                      key={index}
                      className="flex justify-between py-1 text-sm"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {item.productId?.name || "Unknown Product"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.quantity} x ${itemPrice.toFixed(2)}
                        </span>
                      </div>
                      <span className="font-semibold self-center">
                        ${(itemPrice * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${selectedOrder.totalPrice?.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="status">Update Status</Label>
                <div className="flex gap-2">
                  <select
                    id="status"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button
                    className="rounded-lg px-6 h-10 font-bold text-xs"
                    onClick={() =>
                      updateOrderStatus(selectedOrder._id, newStatus)
                    }
                  >
                    Update
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center font-bold text-muted-foreground animate-pulse">
          Loading Admin Portal...
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
