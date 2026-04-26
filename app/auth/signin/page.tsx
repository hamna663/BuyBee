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
import Image from "next/image";

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
    <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark flex items-center justify-center px-4 relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/logo.png" alt="BuyBee" width={40} height={40} />
            <span className="text-2xl font-black text-gradient">BuyBee</span>
          </Link>
          <p className="text-muted-foreground text-xs">Continue your premium journey</p>
        </div>

        <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-xl shadow-xl p-0 overflow-hidden">
          <CardHeader className="text-center space-y-1 pt-6">
            <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
              <HugeiconsIcon icon={Login01Icon} className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl font-black tracking-tight">
              Welcome Back
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-black text-gray-700 dark:text-gray-300 ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="h-9 rounded bg-secondary/30 border-white/5 focus:border-primary/50 text-xs"
                />
              </div>
              <div className="space-y-1.5 relative">
                <div className="flex justify-between items-center px-1">
                  <Label htmlFor="password" className="text-[10px] uppercase tracking-widest font-black text-gray-700 dark:text-gray-300">Password</Label>
                  <Link
                    href="/auth/reset-password"
                    className="text-[10px] font-bold text-primary hover:underline uppercase tracking-wider"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-9 rounded bg-secondary/30 border-white/5 focus:border-primary/50 pr-10 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <HugeiconsIcon
                      icon={showPassword ? EyeOff : EyeIcon}
                      className="h-4 w-4"
                    />
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-9 rounded shadow-lg hover:shadow-primary/20 font-bold text-xs transition-all hover:scale-[1.01] mt-2" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                     <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                     Signing In...
                  </span>
                ) : "Sign In"}
              </Button>
            </form>

            <div className="text-center pt-2">
              <p className="text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="text-primary font-bold hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
