import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { orderTotal } from "@/lib/types";
import { Flower2, ChevronRight } from "lucide-react";
import ReorderButton from "@/components/ReorderButton";
import DeleteOrderButton from "@/components/DeleteOrderButton";
import { OrderListSkeleton } from "@/components/skeletons/OrderSkeleton";

async function OrdersList() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*, bouquet:bouquets(name, price, photo_url, stock_quantity))")
    .eq("customer_id", user.id)
    .eq("hidden_by_customer", false)
    .order("created_at", { ascending: false });

  if (!orders?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Flower2 className="w-12 h-12 text-stone-200 mb-4" />
        <p className="text-stone-400 text-lg font-light">No orders yet.</p>
        <Link href="/bouquets" className="mt-4 text-sm text-[#E8748A] font-medium link-underline">
          Browse our bouquets →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const items = order.order_items ?? [];
        const total = orderTotal(order);
        const photos = items
          .map((i: { bouquet?: { photo_url: string | null; name: string } }) => ({
            url: i.bouquet?.photo_url ?? null,
            name: i.bouquet?.name ?? "",
          }))
          .slice(0, 4);

        return (
          <div key={order.id} className="bg-white rounded-2xl border border-[#E7E5E1] shadow-sm hover:shadow-md transition-all overflow-hidden">
            {/* Header row */}
            <Link href={`/orders/${order.id}`} className="block p-5">
              <div className="flex items-start gap-4">
                {/* Photo strip */}
                <div className="flex-shrink-0">
                  {photos.length > 0 ? (
                    <div className="flex -space-x-2">
                      {photos.map((p: { url: string | null; name: string }, idx: number) => (
                        <div key={idx} className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border-2 border-white ring-1 ring-stone-100"
                          style={{ zIndex: photos.length - idx }}>
                          {p.url
                            ? <Image src={p.url} alt={p.name} fill sizes="48px" className="object-cover" />
                            : <div className="absolute inset-0 flex items-center justify-center text-lg">💐</div>
                          }
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center text-xl">💐</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#1C1917] leading-tight truncate">
                    {items.map((i: { bouquet?: { name: string } }) => i.bouquet?.name).filter(Boolean).join(", ") || "Bouquet order"}
                  </p>
                  <p className="text-sm text-stone-400 mt-0.5 font-light">
                    {new Date(order.created_at).toLocaleDateString("en-PH", { dateStyle: "medium" })}
                    {" · "}{items.length} item{items.length !== 1 ? "s" : ""}
                    {" · "}<span className="capitalize">{order.fulfillment}</span>
                  </p>
                </div>

                {/* Status + total + chevron */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`text-xs font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                      order.status === "confirmed"
                        ? "bg-[#A8B5A2]/20 text-[#6B8A65]"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-bold text-[#E8748A]">₱{total.toFixed(2)}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-300" />
                </div>
              </div>
            </Link>

            {/* Item breakdown */}
            <div className="border-t border-[#F3EFE9] px-5 py-3 bg-[#FAFAF9]">
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
                {items.map((i: { bouquet?: { name: string }; quantity: number; price_snapshot: number; note: string | null }, idx: number) => (
                  <span key={idx} className="flex items-center gap-1">
                    <span className="text-[#1C1917] font-medium">{i.bouquet?.name ?? "Bouquet"}</span>
                    <span className="text-stone-300">×{i.quantity}</span>
                    <span className="text-stone-400">₱{(i.price_snapshot * i.quantity).toFixed(2)}</span>
                    {i.note && <span className="italic text-stone-300">— &ldquo;{i.note}&rdquo;</span>}
                  </span>
                ))}
                {order.fulfillment === "delivery" && order.delivery_fee > 0 && (
                  <span className="text-stone-400">+ ₱{order.delivery_fee.toFixed(2)} delivery</span>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <DeleteOrderButton orderId={order.id} />
                <ReorderButton items={order.order_items ?? []} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-serif font-bold text-[#1C1917] mb-1">My orders</h1>
      <p className="text-stone-400 font-light mb-8">Every bouquet you&apos;ve ordered, in one place.</p>
      <Suspense fallback={<OrderListSkeleton count={3} />}>
        <OrdersList />
      </Suspense>
    </div>
  );
}
