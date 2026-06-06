"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, useRef } from "react";
import { SlidersHorizontal, Search, X } from "lucide-react";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price ↑" },
  { value: "price-desc", label: "Price ↓" },
];

const PRICE_OPTIONS = [
  { value: "", label: "Any" },
  { value: "500", label: "Under ₱500" },
  { value: "1000", label: "Under ₱1k" },
  { value: "2000", label: "Under ₱2k" },
];

export default function BouquetFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Tracks whether the user is actively typing so the URL-sync effect
  // doesn't overwrite the input during debounce.
  const isTypingRef = useRef(false);

  const sort = searchParams.get("sort") ?? "newest";

  // NaN guard: only accept positive integers from the URL; fall back to "".
  const maxPriceRaw = searchParams.get("maxPrice") ?? "";
  const maxPriceParsed = parseInt(maxPriceRaw, 10);
  const maxPrice =
    !Number.isNaN(maxPriceParsed) && maxPriceParsed > 0 ? maxPriceRaw : "";

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? ""
  );

  // Sync input value when URL changes due to external navigation (back/forward).
  // The isTypingRef guard prevents overwriting the input while the user is
  // mid-keystroke waiting for the debounce to fire.
  useEffect(() => {
    if (!isTypingRef.current) {
      setSearchValue(searchParams.get("search") ?? "");
    }
  }, [searchParams]);

  const push = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  function handleSearch(value: string) {
    setSearchValue(value);
    isTypingRef.current = true;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      isTypingRef.current = false;
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set("search", value.trim());
      else params.delete("search");
      router.push(`${pathname}?${params.toString()}`);
    }, 350);
  }

  const isActive = (key: string, value: string) =>
    key === "sort" ? sort === value : maxPrice === value;

  return (
    <div className="flex flex-col gap-4 mb-10">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search bouquets…"
          className="w-full h-10 pl-9 pr-9 rounded-full border border-[#E7E5E1] bg-white text-sm text-[#1C1917] placeholder:text-stone-400 focus:outline-none focus:border-[#E8748A] input-rose-focus transition-colors"
        />
        {searchValue && (
          <button
            onClick={() => handleSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
      <span className="flex items-center gap-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-widest mr-2">
        <SlidersHorizontal className="w-3 h-3" />
        Filter
      </span>

      {SORT_OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => push("sort", o.value === "newest" ? "" : o.value)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
            isActive("sort", o.value)
              ? "bg-[#E8748A] text-white border-[#E8748A] shadow-sm"
              : "bg-white text-stone-500 border-[#E7E5E1] hover:border-[#E8748A]/50 hover:text-[#E8748A]"
          }`}
        >
          {o.label}
        </button>
      ))}

      <span className="w-px h-4 bg-[#E7E5E1] mx-1" />

      {PRICE_OPTIONS.map((o) => (
        <button
          key={o.value}
          onClick={() => push("maxPrice", o.value)}
          className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
            isActive("maxPrice", o.value)
              ? "bg-[#1C1917] text-[#FAF8F5] border-[#1C1917] shadow-sm"
              : "bg-white text-stone-500 border-[#E7E5E1] hover:border-stone-400 hover:text-stone-700"
          }`}
        >
          {o.label}
        </button>
      ))}
      </div>
    </div>
  );
}
