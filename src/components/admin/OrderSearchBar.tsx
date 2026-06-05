"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function OrderSearchBar({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "orders");
      if (value) params.set(key, value);
      else params.delete(key);
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-48">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <Input
          placeholder="Search by email…"
          defaultValue={defaultValue}
          onChange={(e) => update("search", e.target.value)}
          className="pl-9"
        />
      </div>

      <select
        defaultValue={searchParams.get("status") ?? ""}
        onChange={(e) => update("status", e.target.value)}
        className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#E8748A]"
      >
        <option value="">All statuses</option>
        <option value="pending">Pending</option>
        <option value="confirmed">Confirmed</option>
      </select>

      <select
        defaultValue={searchParams.get("fulfillment") ?? ""}
        onChange={(e) => update("fulfillment", e.target.value)}
        className="h-10 rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#E8748A]"
      >
        <option value="">All fulfillment</option>
        <option value="pickup">Pickup</option>
        <option value="delivery">Delivery</option>
      </select>
    </div>
  );
}
