"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, EyeOff, Login01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.accessToken);
        localStorage.setItem("role", data.role || "user");
        toast.success("Welcome back to BuyBee!");
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        toast.error(data.error || data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <Card className="w-full max-w-md glassmorphism dark:glassmorphism-dark border-none rounded-[2.5rem] shadow-2xl p-4 animate-in fade-in zoom-in duration-700">
        <CardHeader className="text-center space-y-2 pt-8">
          <div className="mx-auto h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-2">
            <HugeiconsIcon icon={Login01Icon} className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-4xl font-black tracking-tight text-primary">
            Welcome Back
          </CardTitle>
          <p className="text-muted-foreground font-medium">Continue your premium shopping journey.</p>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="email@example.com"
                className="h-14 rounded-2xl bg-secondary/30 border-white/5 focus:border-primary/50"
              />
            </div>
            <div className="space-y-2 relative">
              <Label htmlFor="password" className="text-xs font-black uppercase tracking-widest opacity-50 ml-1">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-14 rounded-2xl bg-secondary/30 border-white/5 focus:border-primary/50 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <HugeiconsIcon
                    icon={showPassword ? EyeOff : EyeIcon}
                    className="h-5 w-5"
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Link
                href="/auth/reset-password"
                className="text-xs font-bold text-primary hover:underline uppercase tracking-wider"
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                   <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                   Signing In...
                </span>
              ) : "Sign In"}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground font-medium">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="text-primary font-bold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
