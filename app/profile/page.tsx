"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserIcon,
  ShoppingCartIcon,
  Logout01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";

type User = {
  _id: string;
  name: string;
  email: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          setUser(data.user);
          setName(data.user.name);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleUpdate = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        setUser({ ...user, name });
        setEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark text-foreground">
        <div className="container mx-auto py-10 px-4">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark text-foreground">
        <div className="container mx-auto py-10 px-4">
          <p>Please sign in to view your profile.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark text-foreground py-16 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-6 mb-12 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border-4 border-white dark:border-white/5 shadow-xl">
            <HugeiconsIcon icon={UserIcon} className="h-12 w-12" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tight">Profile Settings</h1>
            <p className="text-muted-foreground font-medium">Manage your account and preferences</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
            <Card className="app-card overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/30 pb-6 border-b border-white/5">
                <CardTitle className="text-xl font-bold tracking-tight">Account Information</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs uppercase tracking-widest font-bold opacity-70">Full Name</Label>
                  {editing ? (
                    <div className="flex gap-2">
                      <Input
                        id="name"
                        className="h-12 bg-muted/50 border-white/10 rounded-xl"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                      <Button onClick={handleUpdate} className="rounded-xl px-6">Save</Button>
                      <Button variant="outline" onClick={() => setEditing(false)} className="rounded-xl">Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <p className="text-xl font-semibold tracking-tight">{user.name}</p>
                      <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        Edit
                      </Button>
                    </div>
                  )}
                </div>
                <Separator className="bg-white/5" />
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs uppercase tracking-widest font-bold opacity-70">Email Address</Label>
                  <p className="text-xl font-semibold tracking-tight opacity-70">{user.email}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="app-card overflow-hidden rounded-2xl">
              <CardHeader className="bg-muted/30 pb-6 border-b border-white/5">
                <CardTitle className="text-xl font-bold tracking-tight">Security</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-4">
                <p className="text-muted-foreground text-sm">Keep your account secure by updating your password regularly.</p>
                <Link href="/auth/change-password">
                  <Button variant="outline" className="rounded-xl border-primary/20 hover:bg-primary/5 gap-2">
                    <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4" />
                    Change Password
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
            <Card className="app-card overflow-hidden rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Link href="/orders" className="block">
                  <Button variant="secondary" className="w-full justify-start gap-3 h-12 rounded-xl hover:scale-[1.02] transition-transform">
                    <HugeiconsIcon icon={ShoppingCartIcon} className="h-4 w-4" />
                    My Orders
                  </Button>
                </Link>
                <Link href="/cart" className="block">
                  <Button variant="secondary" className="w-full justify-start gap-3 h-12 rounded-xl hover:scale-[1.02] transition-transform">
                    <HugeiconsIcon icon={ShoppingCartIcon} className="h-4 w-4" />
                    View Cart
                  </Button>
                </Link>
                <Separator className="my-2 bg-white/10" />
                <Button variant="ghost" className="w-full justify-start gap-3 h-12 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30">
                  <HugeiconsIcon icon={Logout01Icon} className="h-4 w-4" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
