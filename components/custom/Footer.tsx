import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Facebook02Icon, InstagramIcon, TwitterIcon } from "@hugeicons/core-free-icons";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-white/5 pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-4 md:grid-cols-2">
          {/* BRAND */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="BuyBee Logo"
                width={40}
                height={40}
                className="hover:scale-110 transition-transform duration-500"
              />
              <h4 className="text-2xl font-black tracking-tight text-primary">BuyBee</h4>
            </Link>
            <p className="text-muted-foreground leading-relaxed font-medium">
              Revolutionizing your shopping experience with curated luxury and premium essentials delivered right to your doorstep.
            </p>
            <div className="flex gap-4">
               {[Facebook02Icon, InstagramIcon, TwitterIcon].map((Icon, idx) => (
                 <a key={idx} href="#" className="h-10 w-10 rounded-xl bg-secondary/50 flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                    <HugeiconsIcon icon={Icon} className="h-5 w-5" />
                 </a>
               ))}
            </div>
          </div>

          {/* SHOP */}
          <div>
            <h5 className="text-lg font-black mb-6">Discovery</h5>
            <ul className="space-y-4 text-muted-foreground font-medium">
              <li><Link href="/" className="hover:text-primary transition-colors">Home Experience</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">Premium Catalog</Link></li>
              <li><Link href="/categories" className="hover:text-primary transition-colors">Curated Collections</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h5 className="text-lg font-black mb-6">Assistance</h5>
            <ul className="space-y-4 text-muted-foreground font-medium">
              <li><Link href="/contact" className="hover:text-primary transition-colors">Get in Touch</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Shipping Global</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Returns & Refills</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div className="space-y-6">
            <h5 className="text-lg font-black">Stay Updated</h5>
            <p className="text-sm text-muted-foreground font-medium">
              Join our exclusive club for new drops and early access to sales.
            </p>
            <div className="relative group">
               <input 
                type="email" 
                placeholder="email@example.com" 
                className="w-full h-14 bg-secondary/30 rounded-2xl px-6 border border-white/5 focus:border-primary/50 outline-none transition-all"
               />
               <button className="absolute right-2 top-2 bottom-2 bg-primary text-white px-4 rounded-xl font-bold text-sm hover:scale-105 transition-all">
                  Join
               </button>
            </div>
          </div>
        </div>

        <Separator className="my-16 bg-white/5" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground font-medium">
          <p>© {new Date().getFullYear()} BuyBee. Crafted with precision.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

