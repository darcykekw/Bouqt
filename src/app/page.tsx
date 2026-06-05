import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import BouquetCard from "@/components/BouquetCard";
import FadeInUp from "@/components/motion/FadeInUp";
import { StaggerContainer, StaggerItem } from "@/components/motion/StaggerChildren";
import HeroArrowButton from "@/components/landing/HeroArrowButton";
import WhySection from "@/components/landing/WhySection";

export const revalidate = 60;

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: featured } = await supabase
    .from("bouquets")
    .select("*")
    .eq("is_available", true)
    .gt("stock_quantity", 0)
    .order("created_at", { ascending: false })
    .limit(3);

  return (
    <div className="flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative -mt-16 min-h-screen flex items-center justify-center overflow-hidden bg-[#1C1917]">
        {/* Radial glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #E8748A 0%, transparent 70%)" }} />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #A8B5A2 0%, transparent 70%)" }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 lg:px-12 text-center">
          <FadeInUp delay={0.1}>
            <p className="text-[#E8748A] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
              Handcrafted · Fresh · Delivered with care
            </p>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <h1 className="font-serif font-bold text-[#FAF8F5] leading-[1.08]"
              style={{ fontSize: "clamp(3rem, 8vw, 4.75rem)" }}>
              Beautiful flowers
              <br />
              <span style={{ color: "#E8748A" }}>for every occasion.</span>
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.35}>
            <p className="mt-7 text-lg text-[#A8A29E] max-w-xl mx-auto leading-relaxed font-light">
              Each bouquet is carefully arranged by hand and prepared fresh for your order —
              whether for a celebration, a gesture of appreciation, or simply to brighten someone&apos;s day.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.45}>
            <div className="mt-10 flex justify-center">
              <HeroArrowButton href="/bouquets">Order Now</HeroArrowButton>
            </div>
          </FadeInUp>
        </div>

        {/* Scroll cue */}
        <FadeInUp delay={0.8} className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 opacity-40">
            <span className="text-xs text-[#FAF8F5] tracking-widest uppercase">Scroll</span>
            <div className="w-px h-8 bg-[#FAF8F5]/40" />
          </div>
        </FadeInUp>
      </section>

      {/* ── Why Bouqt ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="bg-[#FAF8F5] py-28">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <FadeInUp>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E8748A] mb-4">
              Why Bouqt
            </p>
            <h2 className="font-serif font-bold text-[#1C1917] mb-16"
              style={{ fontSize: "clamp(2rem, 4vw, 2.75rem)" }}>
              A thoughtful experience,<br className="hidden sm:block" />
              from selection to delivery.
            </h2>
          </FadeInUp>
          <WhySection />
        </div>
      </section>

      {/* ── Featured Bouquets ─────────────────────────────────────────── */}
      {featured && featured.length > 0 && (
        <section className="bg-white py-28">
          <div className="max-w-6xl mx-auto px-6 lg:px-12">
            <FadeInUp>
              <div className="flex items-end justify-between mb-12">
                <div>
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#E8748A] mb-2">
                    Favourites
                  </p>
                  <h2 className="font-serif font-bold text-[#1C1917]"
                    style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}>
                    Our most popular arrangements
                  </h2>
                </div>
                <Link href="/bouquets"
                  className="link-underline hidden sm:block text-sm text-stone-500 hover:text-[#E8748A] transition-colors">
                  See all →
                </Link>
              </div>
            </FadeInUp>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((bouquet) => (
                <StaggerItem key={bouquet.id}>
                  <BouquetCard bouquet={bouquet} />
                </StaggerItem>
              ))}
            </StaggerContainer>

            <FadeInUp className="mt-12 text-center sm:hidden">
              <Link href="/bouquets">
                <Button size="lg" className="rounded-full px-10 bg-[#E8748A] hover:bg-[#d4607a] text-white border-0">
                  See all bouquets
                </Button>
              </Link>
            </FadeInUp>
          </div>
        </section>
      )}

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section className="bg-[#1C1917] py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #E8748A 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 lg:px-12 text-center">
          <FadeInUp>
            <h2 className="font-serif font-bold text-[#FAF8F5] mb-4"
              style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}>
              The right bouquet is waiting for you.
            </h2>
            <p className="text-[#A8A29E] text-lg font-light mb-8 leading-relaxed">
              Browse our collection and place your order in minutes.
              We&apos;ll take care of the rest.
            </p>
            <HeroArrowButton href="/bouquets">Browse bouquets</HeroArrowButton>
          </FadeInUp>
        </div>
      </section>

    </div>
  );
}
