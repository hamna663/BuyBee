import { Card, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Target02Icon,
  Trophy,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

export default function AboutPage() {
  return (
    <main className="min-h-screen mesh-gradient dark:mesh-gradient-dark pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-4xl space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-black tracking-tight text-gradient">
            About BuyBee
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl mx-auto">
            Redefining the digital shopping experience with premium quality and
            unparalleled service.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-xl p-2">
            <CardContent className="p-6 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <HugeiconsIcon
                  icon={Target02Icon}
                  className="h-5 w-5 text-primary"
                />
              </div>
              <h2 className="text-xl font-black">Our Mission</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                To provide a seamless, secure, and enjoyable shopping experience
                that puts our customers first. We believe in quality,
                affordability, and exceptional customer service.
              </p>
            </CardContent>
          </Card>

          <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-xl p-2">
            <CardContent className="p-6 space-y-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <HugeiconsIcon icon={Trophy} className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-black">Why Choose Us?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                With millions of satisfied customers and a commitment to
                excellence, BuyBee is more than just an online store – it&apos;s
                your trusted shopping companion.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="glassmorphism dark:glassmorphism-dark border-none rounded-xl overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-black leading-tight">
                  What defines the <span className="text-primary">BuyBee</span>{" "}
                  experience?
                </h2>
                <div className="space-y-4">
                  {[
                    "Curated selection of global brands",
                    "Hyper-secure encrypted payments",
                    "Next-day priority shipping",
                    "24/7 dedicated VIP support",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <HugeiconsIcon
                          icon={CheckmarkCircle01Icon}
                          className="h-3 w-3 text-primary"
                        />
                      </div>
                      <span className="text-sm font-bold opacity-80">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10 relative overflow-hidden group">
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
                <HugeiconsIcon
                  icon={UserGroupIcon}
                  className="h-12 w-12 text-primary mb-4"
                />
                <h3 className="text-xl font-black mb-2">Join the Community</h3>
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Join millions of smart shoppers who have discovered the joy of
                  effortless shopping. We’re constantly evolving to bring you
                  the best.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
