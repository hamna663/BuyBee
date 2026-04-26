"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  ViewIcon, 
  ViewOffSlashIcon,
  StarIcon,
  SecurityIcon
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `/api/auth/reset-password?email=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();

      if (res.ok) {
        setStep(2);
      } else {
        alert(data.error || data.message || "Failed to send reset email");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, otp, password, confirmPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        alert(data.error || data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark flex items-center justify-center px-4">
        <Card className="w-full max-w-md glassmorphism dark:glassmorphism-dark border-none rounded-xl shadow-2xl animate-in fade-in duration-700">
          <CardHeader className="text-center pb-2">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <HugeiconsIcon icon={StarIcon} className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-3xl font-black text-gradient uppercase tracking-tighter">
              Reset Success
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 pt-4">
            <p className="text-sm font-medium text-muted-foreground">Your account security has been updated. You can now access your account with your new credentials.</p>
            <Link href="/auth/signin">
              <Button className="w-full h-12 rounded-lg shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-xs">Access Account →</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark flex items-center justify-center px-4">
      <Card className="w-full max-w-md glassmorphism dark:glassmorphism-dark border-none rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-black text-gradient uppercase tracking-tighter">
            {step === 1 ? "Reset Access" : "Secure Account"}
          </CardTitle>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Authentication Protocol</p>
        </CardHeader>
        <CardContent className="pt-6">
          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
                <p className="text-center text-xs font-medium text-muted-foreground">
                  Provide your account email to receive a secure verification code.
                </p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Account Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="h-11 bg-white/50 dark:bg-black/20 rounded-lg text-xs border-white/10 focus:border-primary/50"
                />
              </div>
              <Button type="submit" className="w-full h-12 rounded-lg shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.01]" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Dispatching...
                  </span>
                ) : "Send Secure Code"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-1.5">
                <Label htmlFor="otp" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Security Code</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  placeholder="000000"
                  className="h-11 bg-white/50 dark:bg-black/20 rounded-lg text-xs text-center font-bold tracking-[0.5em] border-white/10 focus:border-primary/50"
                  maxLength={6}
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="h-11 bg-white/50 dark:bg-black/20 rounded-lg text-xs border-white/10 focus:border-primary/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <HugeiconsIcon
                        icon={showPassword ? ViewOffSlashIcon : ViewIcon}
                        className="h-4 w-4"
                      />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Confirm Identity</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="h-11 bg-white/50 dark:bg-black/20 rounded-lg text-xs border-white/10 focus:border-primary/50 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <HugeiconsIcon
                        icon={showConfirmPassword ? ViewOffSlashIcon : ViewIcon}
                        className="h-4 w-4"
                      />
                    </button>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full h-12 rounded-lg shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.01]" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Securing...
                  </span>
                ) : "Update Password"}
              </Button>
            </form>
          )}
          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Recall your credentials?{" "}
              <Link href="/auth/signin" className="text-primary hover:underline ml-1">
                Back to Entry
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
