"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useCart, cartSubtotal } from "@/lib/store/cart";
import { placeCartOrder } from "@/app/actions";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, Minus, Plus, ShoppingBag, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Bouquet } from "@/lib/types";
import BouquetCard from "@/components/BouquetCard";

export default function CartClient({ featuredBouquets }: { featuredBouquets: Bouquet[] }) {
  const { items, removeItem, updateQty, updateNote, clearCart } = useCart();
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [saveAddress, setSaveAddress] = useState(false);
  const [savedAddress, setSavedAddress] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const subtotal = cartSubtotal(items);
  const deliveryFee = fulfillment === "delivery" ? 150 : 0;
  const total = subtotal + deliveryFee;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("saved_address")
        .eq("id", user.id)
        .single();
      if (data?.saved_address) setSavedAddress(data.saved_address);
    });
  }, []);

  // Errors now come back as return values from placeCartOrder, not URL params.

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("cart_items", JSON.stringify(items));
    formData.set("fulfillment", fulfillment);
    formData.set("save_address", saveAddress ? "true" : "false");
    try {
      const result = await placeCartOrder(formData);
      if (result?.error) {
        setError(result.error);
        setPending(false);
        return;
      }
      // On success placeCartOrder redirects (throws), so this line is only
      // reached on unexpected non-redirect returns — clear cart defensively.
      clearCart();
    } catch (err) {
      if (isRedirectError(err)) throw err;
      toast.error("Something went wrong. Please try again.");
      setPending(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <ShoppingBag className="w-12 h-12 text-stone-200 mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold text-[#1C1917] mb-2">Your cart is empty</h1>
          <p className="text-stone-400 font-light">Nothing here yet — take a look at what we have.</p>
        </div>

        {featuredBouquets.length > 0 && (
          <>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-stone-400 mb-5 text-center">
              You might like
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {featuredBouquets.map((b) => (
                <BouquetCard key={b.id} bouquet={b} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/bouquets"
                className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-[#E8748A] transition-colors"
              >
                Browse all bouquets <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
      <h1 className="text-3xl font-serif font-bold text-[#1C1917] mb-8">Your cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">{error}</div>
          )}

          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.bouquetId}
                layout={!reduce}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, x: -20, transition: { duration: 0.2 } }}
                className="bg-white rounded-2xl border border-[#E7E5E1] p-4"
              >
                <div className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0">
                    {item.photo_url ? (
                      <Image src={item.photo_url} alt={item.name} fill sizes="80px" className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-3xl">💐</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-[#1C1917]">{item.name}</h3>
                      <button onClick={() => removeItem(item.bouquetId)} className="text-stone-200 hover:text-red-400 transition-colors p-1">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[#E8748A] font-bold mt-0.5">₱{(item.price * item.quantity).toFixed(2)}</p>
                    <div className="flex items-center gap-1 mt-2 bg-[#F9F6F0] rounded-full w-fit px-1 py-0.5">
                      <button
                        onClick={() => item.quantity > 1 ? updateQty(item.bouquetId, item.quantity - 1) : removeItem(item.bouquetId)}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white transition-colors"
                      >
                        <Minus className="w-3 h-3 text-stone-500" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-[#1C1917]">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.bouquetId, Math.min(item.quantity + 1, item.maxStock))}
                        disabled={item.quantity >= item.maxStock}
                        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white transition-colors disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3 text-stone-500" />
                      </button>
                      <span className="text-xs text-stone-400 px-2">₱{item.price.toFixed(2)} each</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#F3EFE9]">
                  <Textarea
                    placeholder="Special requests for this bouquet? (optional)"
                    value={item.note}
                    onChange={(e) => updateNote(item.bouquetId, e.target.value)}
                    className="resize-none text-sm rounded-xl border-[#E7E5E1] focus:border-[#E8748A] input-rose-focus"
                    rows={2}
                  />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Checkout */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-3xl border border-[#E7E5E1] p-5 shadow-sm space-y-5">
            <h2 className="font-serif font-semibold text-[#1C1917]">Checkout</h2>

            <div className="space-y-2">
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wider">How to receive it</p>
              <div className="flex gap-2 bg-[#F3EFE9] rounded-full p-1">
                {(["pickup", "delivery"] as const).map((f) => (
                  <button key={f} type="button" onClick={() => setFulfillment(f)}
                    className={`flex-1 py-2 px-3 rounded-full text-sm font-semibold transition-all ${fulfillment === f ? "bg-white text-[#1C1917] shadow-sm" : "text-stone-500"}`}>
                    {f === "pickup" ? "🏪 Pickup" : "🚚 Delivery"}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {fulfillment === "delivery" && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduce ? undefined : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5 pb-1">
                    <Input name="delivery_address" defaultValue={savedAddress}
                      placeholder="123 Jasmine St, your city" required
                      className="rounded-xl border-[#E7E5E1] focus:border-[#E8748A] input-rose-focus" />
                    <label className="flex items-center gap-2 text-xs text-stone-400 cursor-pointer">
                      <input type="checkbox" checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} className="rounded accent-[#E8748A]" />
                      Save this address to my profile
                    </label>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2 text-sm border-t border-[#F3EFE9] pt-4">
              <div className="flex justify-between text-stone-500">
                <span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span>
              </div>
              <AnimatePresence>
                {fulfillment === "delivery" && (
                  <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? undefined : { opacity: 0 }}
                    className="flex justify-between text-stone-500">
                    <span>Delivery fee</span><span>₱{deliveryFee.toFixed(2)}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex justify-between font-bold text-[#1C1917] text-base pt-1 border-t border-[#F3EFE9]">
                <span>Total</span><span className="text-[#E8748A]">₱{total.toFixed(2)}</span>
              </div>
            </div>

            <button type="submit" disabled={pending}
              className="w-full flex items-center justify-center gap-2 bg-[#E8748A] hover:bg-[#d4607a] disabled:opacity-60 text-white rounded-full py-3.5 font-semibold text-base transition-colors">
              {pending ? <><Loader2 className="w-4 h-4 animate-spin" />Placing order…</> : "Place order"}
            </button>
            <p className="text-center text-xs text-stone-400 font-light">
              Your order will be confirmed personally by our team.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
