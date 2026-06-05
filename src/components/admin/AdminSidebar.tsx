"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Flower2, Package, ShoppingBag, ArrowLeft } from "lucide-react";

export default function AdminSidebar() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "orders";

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#1C1917] fixed top-0 left-0 z-50 h-screen">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <Flower2 className="w-5 h-5 text-[#E8748A] flex-shrink-0" />
          <span className="font-serif font-bold text-lg text-[#FAF8F5]">Bouqt</span>
        </Link>
        <p className="text-white/25 text-xs mt-1 ml-[1.6rem]">Admin panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <NavItem
          href="/admin?tab=orders"
          icon={<Package className="w-4 h-4" />}
          label="Orders"
          active={tab === "orders"}
        />
        <NavItem
          href="/admin?tab=bouquets"
          icon={<ShoppingBag className="w-4 h-4" />}
          label="Bouquets"
          active={tab === "bouquets"}
        />
      </nav>

      {/* Back to site */}
      <div className="px-4 pb-6 border-t border-white/10 pt-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-white/40 hover:text-white/70 hover:bg-white/5 transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to site
        </Link>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all border-l-2 ${
        active
          ? "bg-white/10 text-[#FAF8F5] border-[#E8748A]"
          : "text-white/40 hover:text-white/70 hover:bg-white/5 border-transparent"
      }`}
    >
      <span className={`flex-shrink-0 ${active ? "text-[#E8748A]" : ""}`}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
