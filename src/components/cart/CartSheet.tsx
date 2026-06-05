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

      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl text-stone-800">
            Your cart{" "}
            {count > 0 && (
              <span className="text-sm font-normal text-stone-400">
                ({count} item{count !== 1 ? "s" : ""})
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-12">
            <span className="text-5xl">💐</span>
            <p className="text-stone-400">Your cart is empty.</p>
            <Link href="/bouquets">
              <Button className="bg-[#E8748A] hover:bg-[#d4607a] text-white rounded-full">
                Browse bouquets
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {items.map((item) => (
                <div
                  key={item.bouquetId}
                  className="flex gap-3 items-start p-3 bg-stone-50 rounded-xl"
                >
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-stone-200 flex-shrink-0">
                    {item.photo_url ? (
                      <Image
                        src={item.photo_url}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-2xl">
                        💐
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-stone-800 text-sm leading-tight">
                      {item.name}
                    </p>
                    <p className="text-[#E8748A] text-sm font-semibold mt-0.5">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </p>

                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() =>
                          item.quantity > 1
                            ? updateQty(item.bouquetId, item.quantity - 1)
                            : removeItem(item.bouquetId)
                        }
                        className="w-6 h-6 flex items-center justify-center bg-white rounded-md border border-stone-200 hover:bg-stone-100 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-5 text-center">
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
                        className="w-6 h-6 flex items-center justify-center bg-white rounded-md border border-stone-200 hover:bg-stone-100 transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeItem(item.bouquetId)}
                        className="ml-auto text-stone-400 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-stone-100 pt-4 space-y-3">
              <div className="flex justify-between text-sm text-stone-500">
                <span>Subtotal</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-stone-400">
                Delivery fee calculated at checkout
              </p>
              <Link href="/cart" className="block">
                <Button className="w-full bg-[#E8748A] hover:bg-[#d4607a] text-white rounded-xl">
                  Checkout →
                </Button>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
