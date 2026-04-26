"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, EyeOff, UserAdd02Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, confirmPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Account created! Please verify your email.");
        setTimeout(() => router.push(`/auth/verify?email=${email}`), 1000);
      } else {
        toast.error(data.message || "Sign up failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/logo.png" alt="BuyBee" width={40} height={40} />
            <span className="text-2xl font-black text-gradient">BuyBee</span>
          </Link>
          <p className="text-muted-foreground text-sm">Create your free account</p>
        </div>

        <div className="glassmorphism dark:glassmorphism-dark rounded-xl p-6 space-y-5">
          <div className="text-center space-y-1">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-3">
              <HugeiconsIcon icon={UserAdd02Icon} className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-black tracking-tight">Join BuyBee</h1>
            <p className="text-muted-foreground text-xs">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] uppercase tracking-widest font-black text-gray-700 dark:text-gray-300 ml-1">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="h-9 rounded bg-secondary/30 border-white/5 focus:border-primary/50 text-xs"
              />
            </div>

            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] uppercase tracking-widest font-black text-gray-700 dark:text-gray-300 ml-1">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min 8 characters"
                  className="h-9 rounded bg-secondary/30 border-white/5 focus:border-primary/50 pr-12 text-xs"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <HugeiconsIcon icon={showPassword ? EyeOff : EyeIcon} className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-[10px] uppercase tracking-widest font-black text-gray-700 dark:text-gray-300 ml-1">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat password"
                  className="h-9 rounded bg-secondary/30 border-white/5 focus:border-primary/50 pr-12 text-xs"
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  <HugeiconsIcon icon={showConfirmPassword ? EyeOff : EyeIcon} className="h-4 w-4" />
                </button>
              </div>
            </div>

              <Button
                type="submit"
                className="w-full h-9 rounded shadow-lg hover:shadow-primary/20 font-bold text-xs transition-all hover:scale-[1.01] mt-2"
                disabled={loading}
              >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creating account…
                </span>
              ) : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/signin" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
