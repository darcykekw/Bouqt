"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Order, OrderItem, orderTotal } from "@/lib/types";
import { CheckCircle2, Clock, Download, Printer, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/lib/store/cart";

const DOTS = Array.from({ length: 20 }, (_, i) => ({
  x: (Math.random() - 0.5) * 300,
  y: (Math.random() - 0.5) * 300,
  size: 4 + Math.random() * 6,
  delay: i * 0.04,
}));

export default function RealtimeOrderStatus({ initialOrder }: { initialOrder: Order }) {
  const [order, setOrder] = useState(initialOrder);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiFired = useRef(false);
  const { addItem } = useCart();
  const supabase = createClient();
  const reduce = useReducedMotion();

  const isConfirmed = order.status === "confirmed";

  useEffect(() => {
    if (isConfirmed && !confettiFired.current && !reduce) {
      confettiFired.current = true;
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1400);
    }
  }, [isConfirmed, reduce]);

  useEffect(() => {
    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${order.id}` },
        (payload) => {
          setOrder((prev) => ({ ...prev, ...(payload.new as Partial<Order>) }));
          if ((payload.new as Order).status === "confirmed") {
            toast.success("Your order has been confirmed! 🌸", {
              description: "We're preparing your bouquet right now.",
              duration: 6000,
            });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [order.id]);

  const items = order.order_items ?? [];
  const total = orderTotal(order);

  function handleReorder() {
    for (const item of items) {
      if (!item.bouquet) continue;
      addItem({
        bouquetId: item.bouquet_id,
        name: item.bouquet.name,
        price: item.bouquet.price,
        photo_url: item.bouquet.photo_url,
        maxStock: item.bouquet.stock_quantity,
      });
    }
    toast.success("Items added to cart!");
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Status banner */}
      <div
        className={`relative rounded-3xl p-6 mb-8 flex items-start gap-5 overflow-hidden ${
          isConfirmed
            ? "bg-white border border-[#A8B5A2]/30"
            : "bg-white border border-amber-100"
        }`}
      >
        {/* Confetti dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
          <AnimatePresence>
            {showConfetti && DOTS.map((dot, i) => (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{ width: dot.size, height: dot.size, background: i % 3 === 0 ? "#E8748A" : i % 3 === 1 ? "#A8B5A2" : "#D4A8B0" }}
                initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                animate={{ opacity: 0, x: dot.x, y: dot.y, scale: 0.2 }}
                transition={{ duration: 1.2, delay: dot.delay, ease: "easeOut" }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Status icon */}
        <div className="relative flex-shrink-0">
          {isConfirmed ? (
            <div className="relative">
              <CheckCircle2 className="w-10 h-10 text-[#A8B5A2]" />
            </div>
          ) : (
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-200/60 animate-ping" />
              <div className="absolute -inset-2 rounded-full border-2 border-amber-300/40 animate-pulse" />
              <Clock className="relative w-10 h-10 text-amber-500" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-xl font-serif font-bold text-[#1C1917]">
            {isConfirmed ? "Your order is confirmed!" : "Waiting for confirmation…"}
          </h1>
          <p className="mt-1 text-sm text-stone-500 font-light">
            {isConfirmed
              ? "We're arranging your bouquet with care. It'll be ready soon."
              : "We received your order and will confirm it shortly. This page updates automatically."}
          </p>
          {isConfirmed && order.confirmed_at && (
            <p className="mt-1.5 text-xs text-[#A8B5A2] font-medium">
              Confirmed {new Date(order.confirmed_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
            </p>
          )}
        </div>
      </div>

      {/* Order card */}
      <div className="bg-white rounded-3xl border border-[#E7E5E1] shadow-sm overflow-hidden">
        {/* Items */}
        <div className="divide-y divide-[#F3EFE9]">
          {items.map((item: OrderItem) => (
            <div key={item.id} className="flex items-center gap-4 px-5 py-4">
              <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-stone-100 flex-shrink-0">
                {item.bouquet?.photo_url ? (
                  <Image src={item.bouquet.photo_url} alt={item.bouquet.name} fill sizes="56px" className="object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-2xl">💐</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#1C1917]">{item.bouquet?.name ?? "Bouquet"}</p>
                <p className="text-sm text-stone-400 font-light">
                  ₱{item.price_snapshot.toFixed(2)} × {item.quantity}
                </p>
                {item.note && (
                  <p className="text-xs text-stone-400 italic mt-0.5">&ldquo;{item.note}&rdquo;</p>
                )}
              </div>
              <p className="font-semibold text-[#1C1917]">₱{(item.price_snapshot * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="p-5 border-t border-[#F3EFE9] space-y-2.5 text-sm">
          <Row label="Order ID" value={<span className="font-mono text-xs text-stone-400">{order.id}</span>} />
          <Row label="Placed" value={new Date(order.created_at).toLocaleDateString("en-PH", { dateStyle: "long" })} />
          <Row label="Fulfillment" value={order.fulfillment === "delivery" ? "🚚 Delivery" : "🏪 Pickup"} />
          {order.delivery_address && <Row label="Address" value={order.delivery_address} />}
          <div className="border-t border-[#F3EFE9] pt-2.5 space-y-1.5">
            {order.fulfillment === "delivery" && (
              <Row label="Delivery fee" value={`₱${order.delivery_fee.toFixed(2)}`} />
            )}
            <div className="flex justify-between font-bold text-base pt-0.5">
              <span className="text-[#1C1917]">Total</span>
              <span className="text-[#E8748A]">₱{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-5 border-t border-[#F3EFE9] bg-[#FAFAF9] flex flex-wrap gap-3">
          {isConfirmed && (
            <>
              <Link href={`/orders/${order.id}/receipt`} className="flex-1">
                <Button variant="outline"
                  className="w-full border-[#E7E5E1] text-[#1C1917] hover:bg-[#E8748A] hover:text-white hover:border-[#E8748A] rounded-full">
                  <Download className="w-4 h-4 mr-2" />Receipt
                </Button>
              </Link>
              <Link href={`/orders/${order.id}/print`} className="flex-1">
                <Button variant="outline" className="w-full rounded-full border-[#E7E5E1]">
                  <Printer className="w-4 h-4 mr-2" />Print
                </Button>
              </Link>
            </>
          )}
          <Button variant="outline" onClick={handleReorder} className="flex-1 rounded-full border-[#E7E5E1]">
            <RotateCcw className="w-4 h-4 mr-2" />Reorder
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className={`text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full ${
          isConfirmed ? "bg-[#A8B5A2]/20 text-[#6B8A65]" : "bg-amber-100 text-amber-700"
        }`}>
          {order.status}
        </span>
        <Link href="/orders" className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
          ← All orders
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-stone-400 font-light flex-shrink-0">{label}</span>
      <span className="text-[#1C1917] text-right">{value}</span>
    </div>
  );
}
