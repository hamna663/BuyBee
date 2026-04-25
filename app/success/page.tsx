"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark flex items-center justify-center px-6">
      <div className="text-center max-w-lg space-y-8">
        {/* Animated checkmark */}
        <div className="flex items-center justify-center">
          <div
            className={`relative h-32 w-32 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center transition-all duration-700 ${
              mounted ? "scale-100 opacity-100" : "scale-50 opacity-0"
            }`}
          >
            <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
            <svg
              className={`h-16 w-16 text-green-500 transition-all duration-700 delay-300 ${
                mounted ? "scale-100 opacity-100" : "scale-50 opacity-0"
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Text */}
        <div
          className={`space-y-4 transition-all duration-700 delay-200 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h1 className="text-5xl font-black tracking-tight text-gray-900 dark:text-white">
            Payment <span className="text-gradient">Successful!</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Your order has been placed and is being processed. You&apos;ll receive a
            confirmation shortly.
          </p>
          {sessionId && (
            <p className="text-xs text-muted-foreground font-mono bg-muted/50 rounded-xl px-4 py-2 inline-block">
              Session: {sessionId.slice(-16)}
            </p>
          )}
        </div>

        {/* CTA */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-400 ${
            mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <Link href="/orders">
            <Button
              size="lg"
              className="h-14 px-10 rounded-2xl shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all font-bold"
            >
              View My Orders
            </Button>
          </Link>
          <Link href="/products">
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-10 rounded-2xl border-white/20 hover:bg-white/10 transition-all font-bold"
            >
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Confetti dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-bounce"
              style={{
                left: `${10 + i * 7}%`,
                top: `${15 + (i % 3) * 25}%`,
                backgroundColor: ["#6366f1", "#22c55e", "#f59e0b", "#ec4899", "#3b82f6"][i % 5],
                animationDelay: `${i * 0.15}s`,
                animationDuration: `${1.5 + (i % 3) * 0.5}s`,
                opacity: mounted ? 0.6 : 0,
                transition: `opacity 0.5s ${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center">
          <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
