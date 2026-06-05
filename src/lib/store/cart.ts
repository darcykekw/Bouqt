"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "@/lib/types";

type CartStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity" | "note">) => void;
  removeItem: (bouquetId: string) => void;
  updateQty: (bouquetId: string, qty: number) => void;
  updateNote: (bouquetId: string, note: string) => void;
  clearCart: () => void;
};

export const useCart = create<CartStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (incoming) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.bouquetId === incoming.bouquetId
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.bouquetId === incoming.bouquetId
                  ? { ...i, quantity: Math.min(i.quantity + 1, i.maxStock) }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...incoming, quantity: 1, note: "" }],
          };
        }),
      removeItem: (bouquetId) =>
        set((state) => ({
          items: state.items.filter((i) => i.bouquetId !== bouquetId),
        })),
      updateQty: (bouquetId, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.bouquetId === bouquetId ? { ...i, quantity: qty } : i
          ),
        })),
      updateNote: (bouquetId, note) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.bouquetId === bouquetId ? { ...i, note } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
    }),
    { name: "bouqt-cart" }
  )
);

export const cartItemCount = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0);

export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);
