"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CartSheet from "@/components/cart/CartSheet";
import { Flower2, Menu, User } from "lucide-react";
import { useState } from "react";

type HeaderProps = {
  userEmail?: string | null;
  isAdmin?: boolean;
};

export default function Header({ userEmail, isAdmin }: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) =>
    pathname.startsWith(path)
      ? "text-[#E8748A] font-medium"
      : "text-stone-600 hover:text-[#E8748A]";

  const navLinks = [
    ...(userEmail ? [{ href: "/orders", label: "My Orders" }] : []),
    ...(userEmail ? [{ href: "/profile", label: "Profile" }] : []),
    ...(isAdmin ? [{ href: "/admin", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-[#E8748A] flex-shrink-0">
          <Flower2 className="w-5 h-5" />
          <span className="text-xl font-serif font-bold tracking-tight">Bouqt</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm flex-1 justify-center">
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className={`transition-colors ${isActive(l.href)}`}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Cart */}
          <CartSheet />

          {/* Desktop user */}
          {userEmail ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-xs text-stone-400 max-w-[140px] truncate hidden md:block">
                {userEmail}
              </span>
              <form action={logout}>
                <Button variant="ghost" size="sm" type="submit" className="text-stone-500 hover:text-stone-800 text-xs">
                  Sign out
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-stone-600 text-sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-[#E8748A] hover:bg-[#d4607a] text-white text-sm">Join us</Button>
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="sm:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors">
              <Menu className="w-5 h-5 text-stone-600" />
            </SheetTrigger>

            <SheetContent side="right" className="w-72">
              <SheetHeader className="text-left mb-6">
                <SheetTitle className="font-serif text-[#E8748A] flex items-center gap-2">
                  <Flower2 className="w-4 h-4" />Bouqt
                </SheetTitle>
              </SheetHeader>

              <nav className="space-y-1">
                {navLinks.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2.5 rounded-xl text-sm transition-colors ${pathname.startsWith(l.href) ? "bg-[#fde8ec] text-[#E8748A] font-medium" : "text-stone-600 hover:bg-stone-50"}`}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-stone-100">
                {userEmail ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 px-3">
                      <User className="w-4 h-4 text-stone-400" />
                      <span className="text-xs text-stone-500 truncate">{userEmail}</span>
                    </div>
                    <form action={logout}>
                      <Button variant="outline" size="sm" type="submit" className="w-full text-stone-600">
                        Sign out
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link href="/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" className="w-full">Sign in</Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full bg-[#E8748A] hover:bg-[#d4607a] text-white">Join us</Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
