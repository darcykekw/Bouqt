import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import RealtimeOrderStatus from "@/components/RealtimeOrderStatus";

export default async function OrderStatusPage({
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
    .select("*, order_items(*, bouquet:bouquets(*))")
    .eq("id", id)
    .eq("customer_id", user.id)
    .eq("hidden_by_customer", false)
    .single();

  if (!order) notFound();

  return <RealtimeOrderStatus initialOrder={order} />;
}
