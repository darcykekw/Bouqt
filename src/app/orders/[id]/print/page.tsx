import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { orderTotal } from "@/lib/types";
import { Flower2 } from "lucide-react";
import PrintButton from "@/components/PrintButton";

export default async function PrintOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, bouquet:bouquets(name, price))")
    .eq("id", id)
    .eq("customer_id", user.id)
    .eq("hidden_by_customer", false)
    .single();

  if (!order) notFound();

  const items = order.order_items ?? [];
  const total = orderTotal(order);

  return (
    <>
      {/* Print button — hidden when printing */}
      <div className="print:hidden flex justify-end p-4 bg-stone-50 border-b border-stone-100">
        <PrintButton />
      </div>

      <div className="max-w-lg mx-auto px-8 py-8 font-sans text-stone-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#E8748A] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-[#E8748A]" />
            <span className="text-2xl font-bold text-[#E8748A]">Bouqt</span>
          </div>
          <div className="text-right">
            <p className="text-xs text-stone-400 uppercase tracking-wide">Order Ticket</p>
            <p className="text-xs font-mono text-stone-500 mt-0.5 max-w-[180px] truncate">{id}</p>
          </div>
        </div>

        {/* Status + Fulfillment */}
        <div className="flex items-center justify-between mb-6">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${order.status === "confirmed" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {order.status}
          </span>
          <span className="text-sm font-semibold">
            {order.fulfillment === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}
          </span>
        </div>

        {/* Delivery address */}
        {order.delivery_address && (
          <div className="mb-6 p-3 bg-stone-50 rounded-lg text-sm">
            <p className="text-stone-500 text-xs uppercase tracking-wide mb-1">Deliver to</p>
            <p className="font-medium">{order.delivery_address}</p>
          </div>
        )}

        {/* Items */}
        <div className="space-y-3 mb-6">
          {items.map((item: { id: string; bouquet?: { name: string }; quantity: number; price_snapshot: number; note: string | null }) => (
            <div key={item.id} className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <p className="font-semibold">{item.bouquet?.name ?? "Bouquet"}</p>
                <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                {item.note && <p className="text-xs text-stone-400 italic mt-0.5">Note: {item.note}</p>}
              </div>
              <p className="font-medium">₱{(item.price_snapshot * item.quantity).toFixed(2)}</p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="border-t-2 border-stone-800 pt-3 flex justify-between items-center">
          <span className="font-bold text-lg">Total</span>
          <span className="font-bold text-lg text-[#E8748A]">₱{total.toFixed(2)}</span>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-stone-400">
          {new Date(order.created_at).toLocaleString("en-PH", { dateStyle: "long", timeStyle: "short" })}
          {" · "}Thank you for choosing Bouqt!
        </p>
      </div>

      <style>{`@media print { .print\\:hidden { display: none !important; } }`}</style>
    </>
  );
}
