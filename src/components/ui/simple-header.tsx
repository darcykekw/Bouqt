"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Flower2, User, ShoppingBag, ClipboardList, Settings, LogOut, LayoutDashboard, X } from "lucide-react";
import { logout } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import CartSheet from "@/components/cart/CartSheet";

type BouqtHeaderProps = {
  userEmail?: string | null;
  isAdmin?: boolean;
};

export default function BouqtHeader({ userEmail, isAdmin }: BouqtHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const isHome = pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  const transparent = isHome && !scrolled;

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href));

  const sidebarLinks = [
    ...(userEmail ? [
      { href: "/orders", label: "My orders", icon: ClipboardList },
      { href: "/profile", label: "Profile", icon: Settings },
      ...(isAdmin ? [{ href: "/admin", label: "Admin dashboard", icon: LayoutDashboard }] : []),
    ] : []),
  ];

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: transparent
            ? "transparent"
            : "color-mix(in srgb, #FAF8F5 92%, transparent)",
          backdropFilter: transparent ? "none" : "blur(16px)",
          borderBottom: transparent ? "1px solid transparent" : "1px solid #E7E5E1",
        }}
      >
        <div
          className="max-w-6xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-4 transition-all duration-300"
          style={{ height: scrolled ? "56px" : "64px" }}
        >
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 flex-shrink-0"
            style={{ color: transparent ? "#FAF8F5" : "#E8748A" }}
          >
            <Flower2 className="w-5 h-5" />
            <span className="text-xl font-serif font-bold tracking-tight">Bouqt</span>
          </Link>

          {/* Center nav — Browse only */}
          <nav className="hidden lg:flex items-center gap-7 text-sm flex-1 justify-center">
            {[{ href: "/bouquets", label: "Browse" }].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="relative py-1 transition-colors"
                style={{ color: transparent ? "rgba(250,248,245,0.85)" : "#78716C" }}
              >
                <span
                  className="transition-colors hover:text-[#E8748A]"
                  style={{ color: isActive(l.href) ? "#E8748A" : "inherit" }}
                >
                  {l.label}
                </span>
                {isActive(l.href) && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#E8748A]"
                    transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-2">
            <CartSheet />

            {userEmail ? (
              <button
                onClick={() => setSidebarOpen(true)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                style={{
                  background: transparent ? "rgba(250,248,245,0.15)" : "#F3EFE9",
                  color: transparent ? "#FAF8F5" : "#78716C",
                }}
                aria-label="Open menu"
              >
                <span className="text-sm font-semibold uppercase leading-none">
                  {userEmail[0]}
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm"
                    className="rounded-full text-sm"
                    style={{ color: transparent ? "rgba(250,248,245,0.85)" : "#78716C" }}>
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm"
                    className="rounded-full text-sm bg-[#E8748A] hover:bg-[#d4607a] text-white border-0 px-5">
                    Get started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              key="sidebar"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-72 bg-[#FAF8F5] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-5 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E8748A] flex items-center justify-center text-white text-sm font-semibold uppercase">
                    {userEmail?.[0] ?? <User className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-stone-700 truncate max-w-[160px]">{userEmail}</p>
                    {isAdmin && (
                      <span className="text-[10px] font-medium text-[#E8748A] tracking-wide uppercase">Admin</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex-1 px-3 py-4 space-y-0.5">
                {/* Browse — always visible */}
                <Link
                  href="/bouquets"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    isActive("/bouquets")
                      ? "bg-[#fde8ec] text-[#E8748A] font-medium"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                  Browse bouquets
                </Link>

                {sidebarLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                      isActive(href)
                        ? "bg-[#fde8ec] text-[#E8748A] font-medium"
                        : "text-stone-600 hover:bg-stone-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </Link>
                ))}
              </nav>

              {/* Sign out */}
              <div className="px-3 pb-6 pt-2 border-t border-stone-100">
                <form action={logout}>
                  <button
                    type="submit"
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    Sign out
                  </button>
                </form>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
