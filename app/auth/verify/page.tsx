"use client";

import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

function VerifyForm() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(true);
  const [alreadyVerified, setAlreadyVerified] = useState(false);
  const [accountEmail, setAccountEmail] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        if (email) {
          const res = await fetch(
            `/api/auth/verify/status?email=${encodeURIComponent(email)}`
          );
          const data = await res.json();
          if (res.ok && data?.isVerified) {
            setAlreadyVerified(true);
          }
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) return;

        const meRes = await fetch("/api/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const meData = await meRes.json();
        if (meRes.ok && meData?.user?.isVerified) {
          setAlreadyVerified(true);
          setAccountEmail(meData.user.email ?? null);
        }
      } catch {
        // Silently fail and keep OTP flow available.
      } finally {
        setStatusLoading(false);
      }
    };

    checkVerificationStatus();
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Missing email for verification.");
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Email verified successfully!");
        window.location.href = "/auth/signin";
      } else {
        toast.error(data.message || "Verification failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (statusLoading) {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">
          Checking Verification...
        </p>
      </div>
    );
  }

  if (alreadyVerified) {
    return (
      <Card className="w-full max-w-md glassmorphism dark:glassmorphism-dark border-none shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-black text-gradient uppercase tracking-tighter">
            Already Verified
          </CardTitle>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
            Account Confirmed
          </p>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="bg-primary/5 rounded-md p-4 border border-primary/10">
            <p className="text-center text-xs font-medium text-muted-foreground">
              This account is already verified.
              <br />
              <span className="text-primary font-bold">
                {email || accountEmail || "You can continue to sign in."}
              </span>
            </p>
          </div>
          <Button className="w-full h-10 font-black uppercase tracking-widest text-xs">
            <Link href="/auth/signin">Go To Sign In</Link>
          </Button>
        </CardContent>
      </Card> 
    );
  }

  return (
    <Card className="w-full max-w-md glassmorphism dark:glassmorphism-dark border-none shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-3xl font-black text-gradient uppercase tracking-tighter">
          Verify Identity
        </CardTitle>
        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Security Protocol</p>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
          <p className="text-center text-xs font-medium text-muted-foreground">
            We&apos;ve dispatched a security code to:
            <br />
            <span className="text-primary font-bold">{email || "your inbox"}</span>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="otp" className="text-[10px] uppercase tracking-widest font-black text-muted-foreground ml-1">Verification Code</Label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="000000"
              className="h-12 bg-white/50 dark:bg-black/20 rounded-md text-center text-2xl font-black tracking-[1em] pl-[1em] focus:border-primary/50"
              maxLength={6}
            />
          </div>
          <Button type="submit" className="w-full h-12 shadow-lg shadow-primary/20 font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.01]" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Verifying...
              </span>
            ) : "Authenticate Account"}
          </Button>
        </form>
        <div className="text-center">
          <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
            Resend Code
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyPage() {
  return (
    <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark flex items-center justify-center px-4">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Initializing Security...</p>
        </div>
      }>
        <VerifyForm />
      </Suspense>
    </main>
  );
}
