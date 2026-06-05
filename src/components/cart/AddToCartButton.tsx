"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useCart } from "@/lib/store/cart";
import { Bouquet } from "@/lib/types";
import { ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { toast } from "sonner";

export default function AddToCartButton({ bouquet }: { bouquet: Bouquet }) {
  const { items, addItem, updateQty } = useCart();
  const [added, setAdded] = useState(false);
  const reduce = useReducedMotion();
  const existing = items.find((i) => i.bouquetId === bouquet.id);

  function handleAdd() {
    addItem({
      bouquetId: bouquet.id,
      name: bouquet.name,
      price: bouquet.price,
      photo_url: bouquet.photo_url,
      maxStock: bouquet.stock_quantity,
    });
    setAdded(true);
    toast.success(`${bouquet.name} added to cart`);
    setTimeout(() => setAdded(false), 2000);
  }

  if (existing) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between bg-[#F9F6F0] rounded-full px-2 py-1">
          <button
            onClick={() =>
              existing.quantity > 1
                ? updateQty(bouquet.id, existing.quantity - 1)
                : useCart.getState().removeItem(bouquet.id)
            }
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white transition-colors text-stone-500"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-8 text-center font-semibold text-[#1C1917] text-sm">
            {existing.quantity}
          </span>
          <button
            onClick={() => updateQty(bouquet.id, Math.min(existing.quantity + 1, bouquet.stock_quantity))}
            disabled={existing.quantity >= bouquet.stock_quantity}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-white transition-colors text-stone-500 disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <Link
          href="/cart"
          className="w-full flex items-center justify-center bg-[#1C1917] hover:bg-[#2C2824] text-[#FAF8F5] rounded-full py-3 px-5 text-sm font-semibold transition-colors"
        >
          View cart →
        </Link>
      </div>
    );
  }

  return (
    <motion.button
      onClick={handleAdd}
      disabled={!bouquet.is_available || bouquet.stock_quantity < 1}
      whileTap={reduce ? {} : { scale: 0.97 }}
      className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-base font-semibold transition-all
        ${added
          ? "bg-[#A8B5A2] text-white"
          : "bg-[#E8748A] hover:bg-[#d4607a] text-white"
        } disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {added ? (
        <><Check className="w-4 h-4" />Added to cart</>
      ) : (
        <><ShoppingBag className="w-4 h-4" />Add to cart</>
      )}
    </motion.button>
  );
}
