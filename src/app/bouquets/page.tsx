import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import BouquetCard from "@/components/BouquetCard";
import BouquetFilters from "@/components/BouquetFilters";
import { BouquetGridSkeleton } from "@/components/skeletons/BouquetCardSkeleton";
import FadeInUp from "@/components/motion/FadeInUp";
import { StaggerContainer, StaggerItem } from "@/components/motion/StaggerChildren";
import { Flower2 } from "lucide-react";

export const revalidate = 30;

type FilterParams = { sort?: string; maxPrice?: string; search?: string };

async function BouquetGrid({ searchParams }: { searchParams: Promise<FilterParams> }) {
  const { sort, maxPrice, search } = await searchParams;
  const supabase = await createClient();

  const safeSearch = search?.slice(0, 100);
  const safeMaxPrice = maxPrice ? Math.min(Math.max(0, parseInt(maxPrice) || 0), 1_000_000) : null;

  let query = supabase.from("bouquets").select("*");
  if (safeSearch) query = query.ilike("name", `%${safeSearch}%`);
  if (safeMaxPrice) query = query.lte("price", safeMaxPrice);
  if (sort === "price-asc") query = query.order("price", { ascending: true });
  else if (sort === "price-desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data: bouquets } = await query;
  const available = bouquets?.filter((b) => b.is_available && b.stock_quantity > 0) ?? [];
  const unavailable = bouquets?.filter((b) => !b.is_available || b.stock_quantity === 0) ?? [];

  if (!bouquets?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <Flower2 className="w-10 h-10 text-stone-300 mb-4" />
        <p className="text-stone-400 text-lg font-light">
          {search
            ? `No bouquets found for "${search}".`
            : maxPrice
            ? `No bouquets available under ₱${Number(maxPrice).toLocaleString()} right now.`
            : "No bouquets available right now. Check back soon!"}
        </p>
      </div>
    );
  }

  return (
    <>
      {available.length > 0 && (
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {available.map((b) => (
            <StaggerItem key={b.id}>
              <BouquetCard bouquet={b} />
            </StaggerItem>
          ))}
        </StaggerContainer>
      )}
      {unavailable.length > 0 && (
        <div className="mt-16">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-stone-400 mb-6">
            Currently unavailable
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 opacity-50">
            {unavailable.map((b) => <BouquetCard key={b.id} bouquet={b} />)}
          </div>
        </div>
      )}
    </>
  );
}

export default function BouquetsPage({ searchParams }: { searchParams: Promise<FilterParams> }) {
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-16">
      <FadeInUp className="mb-10">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E8748A] mb-3">Collection</p>
        <h1 className="font-serif font-bold text-[#1C1917]" style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)" }}>
          Our bouquets
        </h1>
        <p className="mt-2 text-stone-500 font-light max-w-md">
          Everything here is made with care and available for pickup or delivery.
        </p>
      </FadeInUp>

      <Suspense fallback={null}>
        <BouquetFilters />
      </Suspense>

      <Suspense fallback={<BouquetGridSkeleton count={6} />}>
        <BouquetGrid searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
