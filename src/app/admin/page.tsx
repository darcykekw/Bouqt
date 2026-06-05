import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ConfirmOrderButton from "@/components/admin/ConfirmOrderButton";
import ToggleAvailabilityButton from "@/components/admin/ToggleAvailabilityButton";
import BouquetFormModal from "@/components/admin/BouquetFormModal";
import DeleteBouquetButton from "@/components/admin/DeleteBouquetButton";
import RevenueChart from "@/components/admin/RevenueChart";
import OrderSearchBar from "@/components/admin/OrderSearchBar";
import { orderTotal } from "@/lib/types";
import { ShoppingBag, CheckCheck, Clock, TrendingUp, AlertCircle } from "lucide-react";
import Image from "next/image";
import AdminRealtimeNotifier from "@/components/admin/AdminRealtimeNotifier";
import CancelOrderButton from "@/components/admin/CancelOrderButton";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; tab?: string; search?: string; status?: string; fulfillment?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const admin = createAdminClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/bouquets");

  const activeTab = params.tab || "orders";

  // Fetch all orders with items (profile join removed — no FK between orders and profiles in schema cache)
  let ordersQuery = admin
    .from("orders")
    .select("*, order_items(*, bouquet:bouquets(name, price, photo_url))")
    .order("created_at", { ascending: false });

  if (params.status) ordersQuery = ordersQuery.eq("status", params.status);
  if (params.fulfillment) ordersQuery = ordersQuery.eq("fulfillment", params.fulfillment);

  const { data: rawOrders } = await ordersQuery;

  // Fetch customer emails from auth (separate lookup since PostgREST can't resolve the relationship)
  const customerIds = [...new Set((rawOrders ?? []).map((o: { customer_id: string }) => o.customer_id).filter(Boolean))];
  const emailMap = new Map<string, string>();
  await Promise.all(
    customerIds.map(async (id) => {
      const { data } = await admin.auth.admin.getUserById(id);
      if (data?.user?.email) emailMap.set(id, data.user.email);
    })
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allOrders = (rawOrders ?? []).map((o: any) => ({
    ...o,
    profile: { email: emailMap.get(o.customer_id as string) ?? null },
  }));

  // Client-side search filter (email)
  const filtered = params.search
    ? allOrders?.filter((o) =>
        (o.profile as { email: string } | null)?.email
          ?.toLowerCase()
          .includes(params.search!.toLowerCase())
      )
    : allOrders;

  // Sort: pending first, then by date descending
  const orders = [...(filtered ?? [])].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return 0;
  });

  const { data: bouquets } = await admin.from("bouquets").select("*").order("created_at", { ascending: false });

  // Revenue stats
  const confirmed = orders?.filter((o) => o.status === "confirmed") ?? [];
  const pending = orders?.filter((o) => o.status === "pending") ?? [];
  const totalRevenue = confirmed.reduce((sum, o) => sum + orderTotal(o), 0);

  // Top sellers: aggregate confirmed order_items in JS (no extra query)
  const soldMap = new Map<string, { name: string; totalSold: number }>();
  for (const order of confirmed) {
    for (const item of (order.order_items ?? []) as { bouquet_id: string; quantity: number; bouquet?: { name: string } }[]) {
      const existing = soldMap.get(item.bouquet_id);
      if (existing) {
        existing.totalSold += item.quantity;
      } else {
        soldMap.set(item.bouquet_id, { name: item.bouquet?.name ?? "Unknown", totalSold: item.quantity });
      }
    }
  }
  const topSellers = Array.from(soldMap.entries())
    .map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  // Chart data: last 7 days
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const chartData = last7.map((date) => {
    const dayOrders = confirmed.filter(
      (o) => o.confirmed_at?.startsWith(date)
    );
    return {
      date: new Date(date).toLocaleDateString("en-PH", { month: "short", day: "numeric" }),
      revenue: dayOrders.reduce((s, o) => s + orderTotal(o), 0),
      orders: dayOrders.length,
    };
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <AdminRealtimeNotifier />
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-[#1C1917]">Admin dashboard</h1>
        <p className="text-stone-500 mt-1">Manage orders, bouquets, and track revenue.</p>
      </div>

      {params.error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{params.error}</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<ShoppingBag className="w-5 h-5 text-[#E8748A]" />} label="Total orders" value={orders?.length ?? 0} />
        <StatCard icon={<Clock className="w-5 h-5 text-amber-500" />} label="Pending" value={pending.length} highlight={pending.length > 0} />
        <StatCard icon={<CheckCheck className="w-5 h-5 text-green-500" />} label="Confirmed" value={confirmed.length} />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-blue-500" />} label="Revenue" value={`₱${totalRevenue.toFixed(0)}`} isText />
      </div>

      {/* Revenue Chart + Top Sellers */}
      {activeTab === "orders" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 className="font-semibold text-stone-800 mb-4">Revenue — last 7 days</h2>
            <Suspense fallback={<div className="h-48 animate-pulse bg-stone-100 rounded-xl" />}>
              <RevenueChart data={chartData} />
            </Suspense>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-5">
            <h2 className="font-semibold text-stone-800 mb-4">Top sellers</h2>
            {topSellers.length === 0 ? (
              <p className="text-stone-400 text-sm py-8 text-center">No confirmed orders yet.</p>
            ) : (
              <ol className="space-y-3">
                {topSellers.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-500 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm text-stone-700 truncate">{s.name}</span>
                    <span className="text-sm font-semibold text-[#E8748A] flex-shrink-0">
                      ×{s.totalSold}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 w-fit mb-6">
        {[{ key: "orders", label: "Orders" }, { key: "bouquets", label: "Bouquets" }].map((tab) => (
          <Link key={tab.key} href={`/admin?tab=${tab.key}`}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-700"}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Pending attention banner */}
          {pending.length > 0 && !params.search && !params.status && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-amber-800 font-medium">
                {pending.length} order{pending.length !== 1 ? "s" : ""} waiting for confirmation
              </p>
              <Link href="/admin?tab=orders&status=pending" className="ml-auto text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors whitespace-nowrap">
                View pending →
              </Link>
            </div>
          )}

          {/* Status filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "All orders", value: "" },
              { label: `Pending (${pending.length})`, value: "pending" },
              { label: `Confirmed (${confirmed.length})`, value: "confirmed" },
            ].map((f) => (
              <Link
                key={f.value}
                href={`/admin?tab=orders${f.value ? `&status=${f.value}` : ""}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  (params.status ?? "") === f.value
                    ? f.value === "pending"
                      ? "bg-amber-100 text-amber-800"
                      : f.value === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : "bg-stone-800 text-white"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                }`}
              >
                {f.label}
              </Link>
            ))}
            <div className="ml-auto">
              <Suspense>
                <OrderSearchBar defaultValue={params.search} />
              </Suspense>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {!orders?.length ? (
              <div className="p-12 text-center text-stone-400">No orders match your filters.</div>
            ) : (
              <>
                {/* Mobile cards */}
                <div className="sm:hidden divide-y divide-stone-50">
                  {orders.map((order) => {
                    const items = order.order_items ?? [];
                    const p = order.profile as { email: string } | null;
                    const total = orderTotal(order);
                    const firstPhoto = (items[0] as { bouquet?: { photo_url: string | null; name: string } } | undefined)?.bouquet;
                    const isPending = order.status === "pending";
                    return (
                      <div key={order.id} className={`p-4 space-y-3 ${isPending ? "bg-amber-50/50 border-l-2 border-amber-400" : ""}`}>
                        <div className="flex items-start gap-3">
                          {firstPhoto?.photo_url ? (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                              <Image src={firstPhoto.photo_url} alt={firstPhoto.name} fill sizes="40px" className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-lg flex-shrink-0">💐</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-stone-500 truncate">{p?.email ?? "—"}</p>
                            <p className="text-sm font-medium text-stone-800 truncate">
                              {items.map((i: { bouquet?: { name: string }; quantity: number }) => `${i.bouquet?.name ?? "?"}×${i.quantity}`).join(", ")}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <StatusBadge status={order.status} />
                            <span className="text-sm font-bold text-[#E8748A]">₱{total.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-stone-400">
                          <span>{order.fulfillment === "delivery" ? "🚚 Delivery" : "🏪 Pickup"} · {new Date(order.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}</span>
                          <div className="flex items-center gap-2">
                            {isPending && <ConfirmOrderButton orderId={order.id} />}
                            {isPending && <CancelOrderButton orderId={order.id} />}
                            <Link href={`/orders/${order.id}/print`} target="_blank" className="px-2 py-1 rounded border border-stone-200 hover:border-stone-300 text-stone-400 hover:text-stone-700 transition-colors">🖨</Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-100 bg-stone-50">
                        {["", "", "Customer", "Items", "Total", "Fulfillment", "Status", "Date", "Actions"].map((h, i) => (
                          <th key={i} className="text-left px-4 py-3 text-stone-500 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => {
                        const items = order.order_items ?? [];
                        const p = order.profile as { email: string } | null;
                        const total = orderTotal(order);
                        const notes = items.filter((i: { note: string | null }) => i.note).map((i: { note: string | null }) => i.note).join("; ");
                        const firstPhoto = (items[0] as { bouquet?: { photo_url: string | null; name: string } } | undefined)?.bouquet;
                        const isPending = order.status === "pending";

                        return (
                          <tr key={order.id} className={`border-b border-stone-50 transition-colors ${isPending ? "bg-amber-50/40 hover:bg-amber-50" : "hover:bg-stone-50/50"}`}>
                            {/* Pending indicator */}
                            <td className="pl-2 py-3 w-2">
                              {isPending && <div className="w-1 h-8 rounded-full bg-amber-400 mx-auto" />}
                            </td>
                            {/* Thumbnail */}
                            <td className="pl-2 py-3 w-10">
                              {firstPhoto?.photo_url ? (
                                <div className="relative w-9 h-9 rounded-lg overflow-hidden bg-stone-100 flex-shrink-0">
                                  <Image src={firstPhoto.photo_url} alt={firstPhoto.name} fill sizes="36px" className="object-cover" />
                                </div>
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-base">💐</div>
                              )}
                            </td>
                            <td className="px-4 py-3 max-w-[140px] truncate text-stone-700 text-xs">{p?.email ?? "—"}</td>
                            <td className="px-4 py-3 max-w-[180px] text-stone-600 text-xs">
                              {items.map((i: { bouquet?: { name: string }; quantity: number }) => `${i.bouquet?.name ?? "?"}×${i.quantity}`).join(", ")}
                              {notes && <p className="italic text-stone-400 mt-0.5 line-clamp-1">&ldquo;{notes}&rdquo;</p>}
                            </td>
                            <td className="px-4 py-3 text-[#E8748A] font-medium">₱{total.toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <span>{order.fulfillment === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}</span>
                              {order.delivery_address && <p className="text-xs text-stone-400 mt-0.5 max-w-[120px] truncate">{order.delivery_address}</p>}
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={order.status} />
                            </td>
                            <td className="px-4 py-3 text-stone-400 text-xs whitespace-nowrap">
                              {new Date(order.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                {isPending && <ConfirmOrderButton orderId={order.id} />}
                                {isPending && <CancelOrderButton orderId={order.id} />}
                                <Link href={`/orders/${order.id}/print`} target="_blank"
                                  className="text-xs text-stone-400 hover:text-stone-700 transition-colors px-2 py-1 rounded border border-stone-200 hover:border-stone-300">
                                  🖨
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Bouquets Tab */}
      {activeTab === "bouquets" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <BouquetFormModal mode="create" />
          </div>
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            {!bouquets?.length ? (
              <div className="p-12 text-center text-stone-400">No bouquets yet. Add your first one!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50">
                      {["Name", "Price", "Stock", "Status", "Added", "Actions"].map((h) => (
                        <th key={h} className={`text-left px-4 py-3 text-stone-500 font-medium ${h === "Actions" ? "text-right" : ""}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bouquets.map((bouquet) => (
                      <tr key={bouquet.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-stone-800">{bouquet.name}</td>
                        <td className="px-4 py-3 text-[#E8748A] font-medium">₱{bouquet.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-stone-600">{bouquet.stock_quantity}</td>
                        <td className="px-4 py-3">
                          <Badge className={bouquet.is_available && bouquet.stock_quantity > 0 ? "bg-green-100 text-green-700 border-0" : "bg-stone-100 text-stone-500 border-0"}>
                            {bouquet.is_available && bouquet.stock_quantity > 0 ? "Available" : "Unavailable"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-stone-400 text-xs">
                          {new Date(bouquet.created_at).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <ToggleAvailabilityButton bouquetId={bouquet.id} currentValue={bouquet.is_available} />
                            <BouquetFormModal mode="edit" bouquet={bouquet} />
                            <DeleteBouquetButton bouquetId={bouquet.id} bouquetName={bouquet.name} />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <Separator className="my-8" />
      <div className="flex items-center justify-between text-xs text-stone-400">
        <span>Bouqt Admin</span>
        <span>{new Date().toLocaleDateString("en-PH", { dateStyle: "long" })}</span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-green-100 text-green-700",
    pending: "bg-amber-100 text-amber-700",
    cancelled: "bg-stone-100 text-stone-500",
  };
  return (
    <Badge className={`${styles[status] ?? "bg-stone-100 text-stone-500"} border-0 capitalize`}>
      {status}
    </Badge>
  );
}

function StatCard({ icon, label, value, highlight, isText }: {
  icon: React.ReactNode; label: string; value: number | string; highlight?: boolean; isText?: boolean;
}) {
  return (
    <div className={`bg-white rounded-2xl border p-4 shadow-sm ${highlight ? "border-amber-200" : "border-stone-100"}`}>
      <div className="flex items-center gap-2 mb-2">{icon}</div>
      <p className="text-2xl font-bold text-stone-800">{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{label}</p>
    </div>
  );
}
