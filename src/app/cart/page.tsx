import { createClient } from "@/lib/supabase/server";
import CartClient from "@/components/cart/CartClient";
import { Bouquet } from "@/lib/types";

export default async function CartPage() {
  const supabase = await createClient();
  const { data: featured } = await supabase
    .from("bouquets")
    .select("*")
    .eq("is_available", true)
    .gt("stock_quantity", 0)
    .order("created_at", { ascending: false })
    .limit(3);

  return <CartClient featuredBouquets={(featured ?? []) as Bouquet[]} />;
}
