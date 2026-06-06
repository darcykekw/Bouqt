"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, cartItemCount, cartSubtotal } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";

export default function CartSheet() {
  const { items, removeItem, updateQty } = useCart();
  const count = cartItemCount(items);
  const subtotal = cartSubtotal(items);

  return (
    <Sheet>
      <SheetTrigger className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-stone-100 transition-colors">
        <ShoppingBag className="w-5 h-5 text-stone-600" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] min-h-[18px] bg-[#E8748A] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none px-1">
            {count}
          </span>
        )}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md flex flex-col bg-[#FAF8F5]">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl font-bold text-[#1C1917]">
            Your cart
            {count > 0 && (
              <span className="text-lg font-normal text-stone-400 ml-2">
                ({count} item{count !== 1 ? "s" : ""})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
            <span className="text-6xl mb-4">💐</span>
            <h3 className="font-serif text-xl font-bold text-[#1C1917]">Your cart is empty</h3>
            <p className="text-stone-500 font-light max-w-[240px]">Looks like you haven't added any bouquets yet.</p>
            <Link href="/bouquets" className="mt-4">
              <Button className="bg-[#E8748A] hover:bg-[#d4607a] text-white rounded-full h-12 px-8 text-base">
                Start shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6 py-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.bouquetId}
                  className="flex gap-4 items-start"
                >
                  <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                    {item.photo_url ? (
                      <Image
                        src={item.photo_url}
                        alt={item.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-3xl bg-[#F3EFE9]">
                        💐
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-start justify-between">
                      <p className="font-semibold text-[#1C1917] text-base leading-tight">
                        {item.name}
                      </p>
                      <button
                        onClick={() => removeItem(item.bouquetId)}
                        className="text-stone-300 hover:text-red-500 transition-colors p-1 -mr-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[#E8748A] text-sm font-bold mt-1">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </p>

                    <div className="flex flex-col gap-1.5 mt-3">
                      <div className="flex items-center gap-1 bg-white rounded-full w-fit px-1 py-0.5 border border-[#E7E5E1]">
                        <button
                          onClick={() =>
                            item.quantity > 1
                              ? updateQty(item.bouquetId, item.quantity - 1)
                              : removeItem(item.bouquetId)
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F9F6F0] transition-colors"
                        >
                          <Minus className="w-3 h-3 text-stone-500" />
                        </button>
                        <span className="text-sm font-semibold w-5 text-center text-[#1C1917]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQty(
                              item.bouquetId,
                              Math.min(item.quantity + 1, item.maxStock)
                            )
                          }
                          disabled={item.quantity >= item.maxStock}
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F9F6F0] transition-colors disabled:opacity-40"
                        >
                          <Plus className="w-3 h-3 text-stone-500" />
                        </button>
                      </div>
                      {/* Stale-stock warning: quantity exceeds cached maxStock */}
                      {item.quantity > item.maxStock && (
                        <p className="text-[11px] text-amber-600 font-medium leading-tight">
                          Only {item.maxStock} in stock — please reduce quantity before checkout.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-200 pt-5 pb-2 space-y-4 bg-[#FAF8F5]">
              <div className="flex justify-between text-base text-stone-600 font-medium">
                <span>Subtotal</span>
                <span className="font-semibold text-[#1C1917]">₱{subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-stone-400 font-light text-center">
                Delivery fees and taxes calculated at checkout.
              </p>
              <Link href="/cart" className="block">
                <Button className="w-full bg-[#E8748A] hover:bg-[#d4607a] text-white rounded-full h-14 text-lg font-bold">
                  Continue to Checkout
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
