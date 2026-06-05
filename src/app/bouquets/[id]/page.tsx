import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { ChevronLeft } from "lucide-react";
import FadeInUp from "@/components/motion/FadeInUp";

export default async function BouquetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: bouquet } = await supabase
    .from("bouquets")
    .select("*")
    .eq("id", id)
    .single();

  if (!bouquet) notFound();

  const isOrderable = bouquet.is_available && bouquet.stock_quantity > 0;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12">
      <Link
        href="/bouquets"
        className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-[#E8748A] transition-colors mb-10 group"
      >
        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        All bouquets
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[55fr_45fr] gap-10 lg:gap-16 items-start">
        {/* Photo */}
        <FadeInUp className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-stone-100 shadow-sm">
          {bouquet.photo_url ? (
            <Image
              src={bouquet.photo_url}
              alt={bouquet.name}
              fill
              sizes="(max-width:1024px) 100vw, 55vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-8xl bg-[#F3EFE9]">
              💐
            </div>
          )}
          {!isOrderable && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-sm font-semibold tracking-widest uppercase text-stone-400 bg-white px-4 py-2 rounded-full border border-stone-200">
                Sold out
              </span>
            </div>
          )}
        </FadeInUp>

        {/* Info */}
        <FadeInUp delay={0.1} className="flex flex-col gap-7 lg:sticky lg:top-24">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-serif font-bold text-[#1C1917] leading-tight"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)" }}>
                {bouquet.name}
              </h1>
              <span className="text-2xl font-bold text-[#E8748A] whitespace-nowrap">
                ₱{bouquet.price.toFixed(2)}
              </span>
            </div>
            <p className="mt-3 text-stone-500 leading-relaxed font-light">{bouquet.description}</p>
          </div>

          {/* Stock badge */}
          <div className="flex items-center gap-2">
            {isOrderable ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-[#A8B5A2]/20 text-[#6B8A65]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A8B5A2] inline-block" />
                {bouquet.stock_quantity} in stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-stone-100 text-stone-400">
                Out of stock
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="bg-white rounded-3xl border border-[#E7E5E1] p-6 shadow-sm">
            {isOrderable ? (
              <>
                <p className="text-sm text-stone-400 mb-4 font-light">
                  Add to your cart and keep browsing, or go straight to checkout.
                </p>
                <AddToCartButton bouquet={bouquet} />
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-stone-400 text-sm font-light">
                  This bouquet is currently unavailable. Browse our other arrangements.
                </p>
                <Link href="/bouquets" className="mt-3 inline-block text-sm text-[#E8748A] font-medium link-underline">
                  See all bouquets →
                </Link>
              </div>
            )}
          </div>

          <p className="text-xs text-stone-400 font-light leading-relaxed">
            Every order is personally confirmed by our team. You&apos;ll get a notification
            the moment it&apos;s being prepared.
          </p>
        </FadeInUp>
      </div>
    </div>
  );
}
