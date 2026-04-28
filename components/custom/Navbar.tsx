"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Login01Icon,
  UserAdd02Icon,
  ShoppingCartIcon,
  UserIcon,
  Menu01Icon,
  Logout01Icon,
  Settings01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons";
import { CartSheet } from "./CartSheet";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/cart?t=${Date.now()}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const data = await res.json();
      setCartCount(data.cart?.items?.length || 0);
    } catch (error) {
      console.error("Failed to fetch cart count:", error);
    }
  };
  useEffect(() => {
    // Check if user is logged in (you can adjust this based on your auth system)
    const loginStatus = async () => {
      const token = localStorage.getItem("token");
      const userRole = localStorage.getItem("role");

      if (token) {
        // Verify token with backend
        try {
          const res = await fetch("/api/users/me", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            setIsLoggedIn(true);
            fetchCartCount();
          } else if (res.status === 401 || res.status === 404) {
            // Token invalid or user deleted
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            setIsLoggedIn(false);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Auth verification failed:", error);
          // Don't log out yet, maybe it's just a network error
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
      
      if (userRole === "admin" && token) {
        setIsAdmin(true);
      } else if (!token) {
        setIsAdmin(false);
      }
    };
    loginStatus();
  }, []);

  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCartCount();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setCartCount(0);
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (pathname?.startsWith('/auth')) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full glassmorphism dark:glassmorphism-dark border-b border-white/10">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* LEFT SECTION: BACK BUTTON & LOGO */}
        <div className="flex items-center">
          {pathname !== "/" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="mr-2 h-8 w-8 rounded-full hover:bg-primary/10 hover:text-primary transition-colors flex-shrink-0"
              title="Go Back"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
            </Button>
          )}
          <Link href="/" className="flex items-center text-primary font-semibold text-sm">
            <Image
              src="/logo.png"
              alt="BuyBee Logo"
              width={28}
              height={28}
              className="mr-2"
            />
            BuyBee
          </Link>
        </div>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-8 relative">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative text-sm font-medium"
            >
              <span
                className={cn(
                  "transition-colors truncate max-w-[100px]",
                  isActive(link.href)
                    ? "text-primary"
                    : "text-foreground hover:text-primary",
                )}
              >
                {link.label}
              </span>

              {/* underline animation */}
              <span
                className={cn(
                  "absolute left-0 -bottom-1 h-0.5 w-full origin-left scale-x-0 transition-transform duration-300",
                  "bg-primary",
                  isActive(link.href) && "scale-x-100",
                )}
              />
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
          )}
        </div>

        {/* DESKTOP RIGHT */}
        <div className="hidden md:flex items-center gap-2">
          {!isLoggedIn ? (
            <>
              <Link href="/auth/signin">
                <Button variant="ghost" className="flex items-center gap-2">
                  <HugeiconsIcon icon={Login01Icon} className="h-4 w-4" />
                  Login
                </Button>
              </Link>

              <Link href="/auth/signup">
                <Button variant="default" className="flex items-center gap-2">
                  <HugeiconsIcon icon={UserAdd02Icon} className="h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-1">
              {/* CART */}
              <CartSheet
                trigger={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full hover:bg-secondary/60 transition-colors"
                  >
                    <HugeiconsIcon
                      icon={ShoppingCartIcon}
                      className="h-5 w-5"
                    />

                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                }
              />

              {/* PROFILE */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer hover:bg-secondary py-1 pl-2 pr-4 rounded-md">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary">
                    <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
                  </span>

                  <span className="text-xs font-medium leading-none truncate max-w-[80px]">
                    Account
                  </span>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52">
                  <Link href="/profile">
                    <DropdownMenuItem className="gap-2">
                      <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                  </Link>

                  <Link href="/orders">
                    <DropdownMenuItem className="gap-2">
                      <HugeiconsIcon icon={ShoppingCartIcon} />
                      Orders
                    </DropdownMenuItem>
                  </Link>

                  <DropdownMenuItem
                    className="gap-2 text-red-500"
                    onClick={handleLogout}
                  >
                    <HugeiconsIcon icon={Logout01Icon} className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        {/* MOBILE */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger>
              <HugeiconsIcon icon={Menu01Icon} className="h-5 w-5" />
            </SheetTrigger>

            <SheetContent side="left" className="w-64 px-5 py-6">
              <div className="flex flex-col gap-8">
                {/* Logo */}
                <Link
                  href="/"
                  className="flex items-center text-primary font-semibold"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Image
                    src="/logo.png"
                    alt="BuyBee Logo"
                    width={28}
                    height={28}
                    className="mr-2"
                  />
                  BuyBee
                </Link>

                {/* NAV LINKS */}
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="relative w-fit text-sm font-medium"
                    >
                      <span
                        className={cn(
                          "transition-colors",
                          isActive(link.href)
                            ? "text-primary"
                            : "text-foreground hover:text-primary",
                        )}
                      >
                        {link.label}
                      </span>
                      {/* underline animation */}
                      <span
                        className={cn(
                          "absolute left-0 -bottom-1 h-0.5 w-full origin-left scale-x-0 transition-transform duration-300",
                          "bg-primary",
                          isActive(link.href) && "scale-x-100",
                        )}
                      />
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "text-sm font-black uppercase tracking-widest flex items-center gap-2",
                        isActive("/admin")
                          ? "text-primary"
                          : "text-foreground hover:text-primary",
                      )}
                    >
                      <HugeiconsIcon icon={Settings01Icon} className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}
                </div>

                {/* AUTH */}
                <div className="flex flex-col gap-3 pt-6 border-t border-border">
                  {!isLoggedIn ? (
                    <>
                      <Link href="/auth/signin" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2"
                        >
                          <HugeiconsIcon
                            icon={Login01Icon}
                            className="h-4 w-4"
                          />
                          Login
                        </Button>
                      </Link>
                      <Link href="/auth/signup" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full justify-start gap-2">
                          <HugeiconsIcon
                            icon={UserAdd02Icon}
                            className="h-4 w-4"
                          />
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <CartSheet
                        trigger={
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                          >
                            <HugeiconsIcon
                              icon={ShoppingCartIcon}
                              className="h-4 w-4"
                            />
                            Cart ({cartCount})
                          </Button>
                        }
                      />
                      <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                          variant="secondary"
                          className="w-full justify-start gap-2"
                        >
                          <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
                          Profile
                        </Button>
                      </Link>
                      <Link href="/orders" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start gap-2"
                        >
                          <HugeiconsIcon
                            icon={ShoppingCartIcon}
                            className="h-4 w-4"
                          />
                          Orders
                        </Button>
                      </Link>
                      {isAdmin && (
                        <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-2"
                          >
                            <HugeiconsIcon
                              icon={Settings01Icon}
                              className="h-4 w-4"
                            />
                            Admin
                          </Button>
                        </Link>
                      )}
                      <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-red-500"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        <HugeiconsIcon
                          icon={Logout01Icon}
                          className="h-4 w-4"
                        />
                        Logout
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
