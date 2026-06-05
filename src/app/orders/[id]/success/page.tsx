import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { orderTotal } from "@/lib/types";
import { CheckCircle2, MapPin, Store } from "lucide-react";

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, bouquet:bouquets(name, photo_url))")
    .eq("id", id)
    .eq("customer_id", user.id)
    .eq("hidden_by_customer", false)
    .single();

  if (!order) redirect("/orders");

  const items = order.order_items ?? [];
  const total = orderTotal(order);

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-20 flex flex-col items-center text-center">

      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>

      <h1 className="text-3xl font-serif font-bold text-stone-800 mb-2">
        Your order is in! 🌸
      </h1>
      <p className="text-stone-500 leading-relaxed mb-10">
        We&apos;ll confirm it personally and you&apos;ll get a notification the moment it&apos;s being prepared.
      </p>

      {/* Items strip */}
      <div className="w-full bg-white rounded-2xl border border-stone-100 shadow-sm p-5 mb-6 text-left space-y-3">
        {items.map((item: { bouquet?: { name: string; photo_url: string | null }; quantity: number; price_snapshot: number; note: string | null }) => (
          <div key={(item as { id?: string }).id ?? item.bouquet?.name} className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
              {item.bouquet?.photo_url ? (
                <Image
                  src={item.bouquet.photo_url}
                  alt={item.bouquet.name}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xl">💐</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-stone-800 text-sm truncate">{item.bouquet?.name}</p>
              {item.note && (
                <p className="text-xs text-stone-400 italic truncate">&ldquo;{item.note}&rdquo;</p>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-semibold text-[#E8748A]">
                ₱{(item.price_snapshot * item.quantity).toFixed(2)}
              </p>
              <p className="text-xs text-stone-400">×{item.quantity}</p>
            </div>
          </div>
        ))}

        <div className="border-t border-stone-100 pt-3 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-sm text-stone-500">
            {order.fulfillment === "delivery" ? (
              <><MapPin className="w-3.5 h-3.5" /> Delivery</>
            ) : (
              <><Store className="w-3.5 h-3.5" /> Pickup</>
            )}
          </div>
          <span className="font-bold text-stone-800">₱{total.toFixed(2)}</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link href={`/orders/${id}`} className="flex-1">
          <Button variant="outline" className="w-full">
            Track order status
          </Button>
        </Link>
        <Link href="/bouquets" className="flex-1">
          <Button className="w-full bg-[#E8748A] hover:bg-[#d4607a] text-white">
            Browse more bouquets
          </Button>
        </Link>
      </div>

      <Link href="/orders" className="mt-5 text-sm text-stone-400 hover:text-stone-600 transition-colors">
        View all my orders →
      </Link>
    </div>
  );
}
