"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { EyeIcon, EyeOff } from "@hugeicons/core-free-icons";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Password changed successfully!");
        // Redirect to profile or home
        window.location.href = "/";
      } else {
        alert(data.message || "Failed to change password");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark flex items-center justify-center px-4">
      <Card className="w-full max-w-md glassmorphism dark:glassmorphism-dark border-none rounded-xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-3xl font-black text-gradient uppercase tracking-tighter">
            Security Update
          </CardTitle>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Credentials Management</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 relative">
              <Label htmlFor="currentPassword" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-11 bg-white/50 dark:bg-black/20 rounded-lg text-xs border-white/10 focus:border-primary/50 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <HugeiconsIcon
                    icon={showCurrentPassword ? EyeOff : EyeIcon}
                    className="h-4 w-4"
                  />
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-1.5 relative">
                <Label htmlFor="newPassword" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-11 bg-white/50 dark:bg-black/20 rounded-lg text-xs border-white/10 focus:border-primary/50 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <HugeiconsIcon
                      icon={showNewPassword ? EyeOff : EyeIcon}
                      className="h-4 w-4"
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <Label htmlFor="confirmPassword" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Confirm New Password</Label>
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
                      icon={showConfirmPassword ? EyeOff : EyeIcon}
                      className="h-4 w-4"
                    />
                  </button>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-lg shadow-xl shadow-primary/20 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.01] mt-4" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Updating...
                </span>
              ) : "Update Credentials"}
            </Button>
          </form>
          <div className="mt-8 text-center border-t border-white/5 pt-6">
            <button 
              onClick={() => window.history.back()}
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
            >
              ← Cancel and Return
            </button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
