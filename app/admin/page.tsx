"use client";

import { useEffect, useState } from "react";
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

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "orders" | "products" | "categories" | "messages"
  >("dashboard");
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
        totalRevenue = data.orders.reduce(
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

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/admin/orders?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();

      if (res.ok) {
        // Map userId to user to match the frontend Type
        const mappedOrders = (data.orders || []).map((order: OrderType) => ({
          ...order,
          user: order.userId,
        })) as Order[];
        setOrders(mappedOrders);
      } else {
        console.error("Failed to fetch orders:", data.error || res.statusText);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

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
    const loadData = async () => {
      setLoading(true);
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
        <div className="flex items-center gap-2 bg-secondary/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
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
            <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-[2rem] overflow-hidden group hover:shadow-primary/10 transition-all duration-500">
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
                  <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                    +12%
                  </span>
                </div>
                <div className="mt-5 h-1 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[70%] rounded-full" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-[2rem] overflow-hidden group hover:shadow-primary/10 transition-all duration-500">
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
                  <span className="text-xs font-medium text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                    +8%
                  </span>
                </div>
                <div className="mt-5 h-1 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[45%] rounded-full" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-[2rem] overflow-hidden group hover:shadow-primary/10 transition-all duration-500">
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
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-gradient">
                    {stats.totalProducts}
                  </p>
                </div>
                <div className="mt-5 h-1 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[90%] rounded-full" />
                </div>
              </CardContent>
            </Card>

            <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-[2rem] overflow-hidden group hover:shadow-primary/10 transition-all duration-500">
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
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-gradient">
                    {stats.totalCategories}
                  </p>
                </div>
                <div className="mt-5 h-1 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[30%] rounded-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-[2.5rem] p-4 shadow-xl">
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

            <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-[2.5rem] p-4 bg-primary relative overflow-hidden shadow-2xl">
              {/* Decorative background */}
              <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />

              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl font-black text-white">
                  Store Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 relative z-10">
                <div className="bg-white/15 p-8 rounded-[2rem] backdrop-blur-xl border border-white/10">
                  <p className="text-xs opacity-70 uppercase tracking-widest font-black text-white/80">
                    Estimated Inventory Value
                  </p>
                  <p className="text-5xl font-black mt-2 text-white">
                    $45,230.00
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/5">
                    <p className="text-xs opacity-70 font-bold text-white/80">
                      Active Sessions
                    </p>
                    <p className="text-3xl font-black text-white">124</p>
                  </div>
                  <div className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/5">
                    <p className="text-xs opacity-70 font-bold text-white/80">
                      Conversion Rate
                    </p>
                    <p className="text-3xl font-black text-white">3.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-[2.5rem] overflow-hidden shadow-2xl animate-in fade-in duration-700">
          <CardHeader className="flex flex-row items-center justify-between p-10 border-b border-white/10 bg-white/5">
            <div>
              <CardTitle className="text-3xl font-black">
                Order Management
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Review and fulfill customer orders.
              </p>
            </div>
            <Button variant="outline" className="rounded-xl border-white/10">
              Export Data
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="py-8 px-10 font-black uppercase tracking-widest text-[10px] opacity-50">
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
                    <TableCell className="py-8 px-10 font-mono text-xs opacity-40 group-hover:opacity-100 transition-opacity">
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
                        className="rounded-2xl h-12 w-12 hover:bg-primary hover:text-white hover:rotate-12 transition-all duration-300 shadow-sm"
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

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-black">Product Inventory</h2>
              <p className="text-muted-foreground">
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
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glassmorphism dark:glassmorphism-dark border-white/10 rounded-[2.5rem] custom-scrollbar">
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
                          className="h-12 bg-white/50 dark:bg-black/20 rounded-xl"
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
                          className="h-12 bg-white/50 dark:bg-black/20 rounded-xl"
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
                        className="min-h-[120px] bg-white/50 dark:bg-black/20 rounded-xl"
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
                            className="h-12 w-full bg-white/50 dark:bg-black/20 rounded-xl px-4 flex items-center justify-between"
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
                          className="h-12 w-full bg-white/50 dark:bg-black/20 rounded-xl"
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
                      className="h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                    >
                      {editingProduct ? "Update Product" : "Launch Product"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

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
            <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-[2.5rem] overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-white/5">
                    <TableHead className="py-6 px-8">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="text-right px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow
                      key={product._id}
                      className="border-white/5 hover:bg-white/5"
                    >
                      <TableCell className="py-6 px-8">
                        <Image
                          src={product.images?.[0] || "/placeholder.png"}
                          alt={product.name}
                          className="w-14 h-14 object-cover rounded-2xl border border-white/10"
                        />
                      </TableCell>
                      <TableCell className="font-black text-lg">
                        {product.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="rounded-lg font-bold border-white/10"
                        >
                          {product.categoryId?.name}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-black text-xl text-primary">
                        ${product.price}
                      </TableCell>
                      <TableCell className="font-bold">
                        {product.stock}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 font-bold">
                          ⭐ {product.averageRating?.toFixed(1) || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white"
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
                            className="h-10 w-10 rounded-xl hover:bg-red-500 hover:text-white"
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
            </Card>
          )}
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === "categories" && (
        <div className="space-y-8 animate-in fade-in duration-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-black">Market Segments</h2>
              <p className="text-muted-foreground">
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
                <DialogContent className="max-h-[90vh] overflow-y-auto glassmorphism dark:glassmorphism-dark border-white/10 rounded-[2.5rem] custom-scrollbar">
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
                        className="h-12 bg-white/50 dark:bg-black/20 rounded-xl"
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
                        className="min-h-[100px] bg-white/50 dark:bg-black/20 rounded-xl"
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
                      className="h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                    >
                      {editingCategory
                        ? "Update Category"
                        : "Establish Category"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {viewMode === "cards" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categories.map((category) => (
                <Card
                  key={category._id}
                  className="glassmorphism dark:glassmorphism-dark border-none rounded-[2rem] overflow-hidden group hover:shadow-2xl transition-all duration-500"
                >
                  <div className="aspect-video relative bg-muted overflow-hidden">
                    <Image
                      src={category.images?.[0] || "/placeholder.png"}
                      alt={category.name}
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
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
            <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-[2.5rem] overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow className="border-white/5">
                    <TableHead className="py-6 px-8">Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right px-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow
                      key={category._id}
                      className="border-white/5 hover:bg-white/5"
                    >
                      <TableCell className="py-6 px-8">
                        <Image
                          src={category.images?.[0] || "/placeholder.png"}
                          alt={category.name}
                          className="w-20 h-12 object-cover rounded-xl border border-white/10"
                        />
                      </TableCell>
                      <TableCell className="font-black text-xl">
                        {category.name}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground font-medium">
                        {category.description}
                      </TableCell>
                      <TableCell className="font-black text-primary">
                        {category.productsCount || 0}
                      </TableCell>
                      <TableCell className="text-right px-8">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="ghost"
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
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-xl hover:bg-red-500 hover:text-white"
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
            </Card>
          )}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-black tracking-tight">
                Customer Inquiries
              </h2>
              <p className="text-muted-foreground font-medium">
                Manage messages from the contact page
              </p>
            </div>
            <Badge
              variant="outline"
              className="rounded-full px-4 py-1 font-bold"
            >
              {messages.filter((m) => !m.read).length} Unread
            </Badge>
          </div>

          <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-[2.5rem] overflow-hidden">
            <Table>
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
                            <DialogContent className="rounded-[2rem] glassmorphism dark:glassmorphism-dark border-none max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-2xl font-black">
                                  Message from {msg.name}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-6 py-6">
                                <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl">
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
                                  <div className="bg-white/5 p-6 rounded-2xl leading-relaxed whitespace-pre-wrap">
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
          </Card>
        </div>
      )}
      {/* Order Details Dialog */}
      <Dialog
        open={!!selectedOrder}
        onOpenChange={() => setSelectedOrder(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
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
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <Button
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
