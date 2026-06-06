"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Bouquet } from "@/lib/types";

type BouquetCardProps = {
  bouquet: Bouquet;
  href?: string;
  large?: boolean;
};

export default function BouquetCard({ bouquet, href }: BouquetCardProps) {
  const link = href ?? `/bouquets/${bouquet.id}`;
  const reduce = useReducedMotion();
  const isAvailable = bouquet.is_available && bouquet.stock_quantity > 0;

  return (
    <Link href={link} className="group block" tabIndex={0}>
      <motion.div
        whileHover={reduce ? {} : { scale: 1.02 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative overflow-hidden rounded-2xl bg-stone-100 shadow-sm aspect-[4/3]"
      >
        {/* Photo */}
        {bouquet.photo_url ? (
          <Image
            src={bouquet.photo_url}
            alt={bouquet.name}
            fill
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#F3EFE9]">
            <span className="text-5xl">💐</span>
          </div>
        )}

        {/* Sold-out overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10">
            <span className="text-xs font-semibold tracking-widest uppercase text-stone-400 bg-white px-3 py-1.5 rounded-full border border-stone-200">
              Sold out
            </span>
          </div>
        )}

        {/* Low stock badge */}
        {isAvailable && bouquet.stock_quantity <= 3 && (
          <div className="absolute top-3 left-3 z-10">
            <span className="text-[10px] font-semibold tracking-wider uppercase bg-[#A8B5A2] text-white px-2.5 py-1 rounded-full">
              Only {bouquet.stock_quantity} left
            </span>
          </div>
        )}

        {/* Hover overlay: name + price */}
        <div className="absolute inset-0 flex flex-col justify-end z-10">
          <div
            className="p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
            style={{ background: "linear-gradient(to top, rgba(28,25,23,0.88) 0%, transparent 100%)" }}
          >
            <p className="font-serif font-bold text-[#FAF8F5] text-lg leading-tight">{bouquet.name}</p>
            {bouquet.description && (
              <p className="text-[#A8A29E] text-xs mt-0.5 line-clamp-1 font-light">{bouquet.description}</p>
            )}
            <p className="text-[#E8748A] font-bold mt-1">₱{bouquet.price.toFixed(2)}</p>
          </div>
        </div>

        {/* Always-visible bottom strip for non-hovered state */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-[5]"
          style={{ background: "linear-gradient(to top, rgba(28,25,23,0.6) 0%, transparent 100%)" }}>
          <div className="group-hover:opacity-0 transition-opacity duration-200">
            <p className="font-semibold text-[#FAF8F5] text-sm leading-tight truncate">{bouquet.name}</p>
            <p className="text-[#E8748A] font-bold text-sm mt-0.5">₱{bouquet.price.toFixed(2)}</p>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
