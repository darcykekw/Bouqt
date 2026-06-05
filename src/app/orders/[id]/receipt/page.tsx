import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { orderTotal } from "@/lib/types";
import { Download, Printer, ChevronLeft, Flower2 } from "lucide-react";

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, bouquet:bouquets(*))")
    .eq("id", id)
    .eq("customer_id", user.id)
    .eq("hidden_by_customer", false)
    .single();

  if (!order) notFound();
  if (order.status !== "confirmed") redirect(`/orders/${id}`);

  const items = order.order_items ?? [];
  const total = orderTotal(order);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <Link
        href={`/orders/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-[#E8748A] mb-10 transition-colors group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to order
      </Link>

      {/* Receipt card */}
      <div className="max-w-sm mx-auto">
        <div className="receipt-border rounded-2xl overflow-hidden bg-[#F9F6F0]">
          {/* Header */}
          <div className="text-center px-8 pt-8 pb-6 border-b-2 border-dashed border-[#D6D0C8]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Flower2 className="w-5 h-5 text-[#E8748A]" />
              <span className="font-serif font-bold text-xl text-[#1C1917]">Bouqt</span>
            </div>
            <p className="text-stone-400 text-xs tracking-wider uppercase">Order Receipt</p>
            <p className="mt-2 font-mono text-[10px] text-stone-400 break-all leading-relaxed">{order.id}</p>
          </div>

          {/* Items */}
          <div className="px-6 py-5 space-y-4 border-b-2 border-dashed border-[#D6D0C8]">
            {items.map((item: { id: string; bouquet?: { name: string; description: string; photo_url: string | null }; quantity: number; price_snapshot: number; note: string | null }) => (
              <div key={item.id} className="flex gap-3 items-start">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-200 flex-shrink-0">
                  {item.bouquet?.photo_url ? (
                    <Image src={item.bouquet.photo_url} alt={item.bouquet.name} fill sizes="48px" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-xl">💐</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif font-semibold text-[#1C1917] text-sm leading-tight">{item.bouquet?.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">₱{item.price_snapshot.toFixed(2)} × {item.quantity}</p>
                  {item.note && (
                    <p className="text-[10px] text-stone-400 italic mt-0.5">&ldquo;{item.note}&rdquo;</p>
                  )}
                </div>
                <p className="font-semibold text-[#1C1917] text-sm whitespace-nowrap">
                  ₱{(item.price_snapshot * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Order details */}
          <div className="px-6 py-4 space-y-2 text-xs border-b-2 border-dashed border-[#D6D0C8]">
            <ReceiptRow label="Customer" value={user.email ?? ""} />
            <ReceiptRow
              label="Order date"
              value={new Date(order.created_at).toLocaleDateString("en-PH", { dateStyle: "long" })}
            />
            {order.confirmed_at && (
              <ReceiptRow
                label="Confirmed"
                value={new Date(order.confirmed_at).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" })}
              />
            )}
            <ReceiptRow
              label="Fulfillment"
              value={order.fulfillment === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}
            />
            {order.delivery_address && (
              <ReceiptRow label="Address" value={order.delivery_address} />
            )}
          </div>

          {/* Totals */}
          <div className="px-6 py-4 space-y-2 text-xs border-b-2 border-dashed border-[#D6D0C8]">
            <ReceiptRow label="Subtotal" value={`₱${(total - order.delivery_fee).toFixed(2)}`} />
            {order.fulfillment === "delivery" && (
              <ReceiptRow label="Delivery fee" value={`₱${order.delivery_fee.toFixed(2)}`} />
            )}
            <div className="flex justify-between font-serif font-bold text-sm text-[#1C1917] pt-1">
              <span>Total paid</span>
              <span className="text-[#E8748A]">₱{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 text-center">
            <p className="font-serif text-[#1C1917] text-sm">Thank you. 🌸</p>
            <p className="text-stone-400 text-[10px] mt-1">bouqt.com</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <Link href={`/orders/${id}/receipt/pdf`} target="_blank" className="flex-1">
            <Button className="w-full bg-[#E8748A] hover:bg-[#d4607a] text-white rounded-full">
              <Download className="w-4 h-4 mr-2" />Download PDF
            </Button>
          </Link>
          <Link href={`/orders/${id}/print`} target="_blank" className="flex-1">
            <Button variant="outline" className="w-full rounded-full border-[#E7E5E1]">
              <Printer className="w-4 h-4 mr-2" />Print
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start gap-3">
      <span className="text-stone-400">{label}</span>
      <span className="text-[#1C1917] text-right max-w-[60%] break-words">{value}</span>
    </div>
  );
}
