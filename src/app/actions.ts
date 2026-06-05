"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isValidUUID, validateCartItems, validateBouquetInputs, validateImageFile } from "@/lib/validation";
import { CartItem } from "@/lib/types";

async function assertAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") redirect("/bouquets");
  return user;
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function placeCartOrder(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const cartItemsJson = formData.get("cart_items") as string;
  let cartItems: CartItem[];
  try {
    cartItems = JSON.parse(cartItemsJson);
  } catch {
    redirect("/cart?error=Invalid+cart+data");
  }
  const cartErr = validateCartItems(cartItems!);
  if (cartErr) redirect(`/cart?error=${encodeURIComponent(cartErr)}`);

  const fulfillment = formData.get("fulfillment") as string;
  if (fulfillment !== "pickup" && fulfillment !== "delivery") {
    redirect("/cart?error=Invalid+fulfillment+option");
  }
  const deliveryAddress =
    fulfillment === "delivery"
      ? ((formData.get("delivery_address") as string) ?? "").trim().slice(0, 200)
      : null;

  if (fulfillment === "delivery" && !deliveryAddress) {
    redirect("/cart?error=Delivery+address+is+required");
  }

  // Fetch current server-side prices + availability
  const ids = cartItems.map((i) => i.bouquetId);
  const { data: bouquets } = await supabase
    .from("bouquets")
    .select("id, price, stock_quantity, is_available, name")
    .in("id", ids);

  for (const item of cartItems) {
    const b = bouquets?.find((b) => b.id === item.bouquetId);
    if (!b || !b.is_available || b.stock_quantity < item.quantity) {
      redirect(
        `/cart?error=${encodeURIComponent(
          `"${item.name}" is no longer available in that quantity`
        )}`
      );
    }
  }

  const deliveryFee = fulfillment === "delivery" ? 150 : 0;

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({ customer_id: user.id, fulfillment, delivery_address: deliveryAddress, delivery_fee: deliveryFee, status: "pending" })
    .select("id")
    .single();

  if (orderErr || !order) redirect("/cart?error=Failed+to+create+order");

  const orderItems = cartItems.map((item) => ({
    order_id: order.id,
    bouquet_id: item.bouquetId,
    quantity: item.quantity,
    note: item.note?.trim() || null,
    price_snapshot: bouquets!.find((b) => b.id === item.bouquetId)!.price,
  }));

  await supabase.from("order_items").insert(orderItems);

  // Optionally save address to profile
  if (formData.get("save_address") === "true" && deliveryAddress) {
    await supabase
      .from("profiles")
      .update({ saved_address: deliveryAddress })
      .eq("id", user.id);
  }

  revalidatePath("/orders");
  revalidatePath("/cart");
  redirect(`/orders/${order.id}/success`);
}

export async function deleteOrder(orderId: string) {
  if (!isValidUUID(orderId)) return { error: "Invalid order ID." };
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Soft delete — hides from customer view only, admin data stays intact
  const { error } = await admin
    .from("orders")
    .update({ hidden_by_customer: true })
    .eq("id", orderId)
    .eq("customer_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/orders");
  return { success: true };
}

export async function cancelOrder(orderId: string) {
  if (!isValidUUID(orderId)) redirect("/admin?error=Invalid+order+ID");
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("orders").update({ status: "cancelled" }).eq("id", orderId);
  revalidatePath("/admin");
  redirect("/admin");
}

export async function confirmOrder(orderId: string) {
  if (!isValidUUID(orderId)) redirect("/admin?error=Invalid+order+ID");
  const admin = createAdminClient();
  await assertAdmin();

  const { data: order } = await admin
    .from("orders")
    .select("status, customer_id, fulfillment, delivery_address, delivery_fee, order_items(*, bouquet:bouquets(name))")
    .eq("id", orderId)
    .single();

  if (!order || order.status !== "pending") {
    redirect("/admin?error=Order+not+found+or+already+confirmed");
  }

  await admin
    .from("orders")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", orderId);

  // Decrement stock — one batch fetch, then parallel updates
  const items = order.order_items as { bouquet_id: string; quantity: number }[];
  const bouquetIds = (items ?? []).map((i) => i.bouquet_id);
  const { data: currentStock } = await admin
    .from("bouquets")
    .select("id, stock_quantity")
    .in("id", bouquetIds);

  await Promise.all(
    (items ?? []).map((item) => {
      const b = currentStock?.find((b) => b.id === item.bouquet_id);
      if (!b) return Promise.resolve();
      const newQty = Math.max(0, b.stock_quantity - item.quantity);
      return admin
        .from("bouquets")
        .update({ stock_quantity: newQty, is_available: newQty > 0 })
        .eq("id", item.bouquet_id);
    })
  );

  revalidatePath("/admin");
  revalidatePath(`/orders/${orderId}`);
  redirect("/admin");
}

// ─── Bouquets ─────────────────────────────────────────────────────────────────

export async function toggleBouquetAvailability(bouquetId: string, currentValue: boolean) {
  await assertAdmin();
  const admin = createAdminClient();
  await admin.from("bouquets").update({ is_available: !currentValue }).eq("id", bouquetId);
  revalidatePath("/admin");
  revalidatePath("/bouquets");
}

export async function createBouquet(formData: FormData) {
  await assertAdmin();
  const admin = createAdminClient();

  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string).trim();
  const price = parseFloat(formData.get("price") as string);
  const stock_quantity = parseInt(formData.get("stock_quantity") as string, 10);
  const is_available = formData.get("is_available") === "true";

  const validErr = validateBouquetInputs(name, description, price, stock_quantity);
  if (validErr) redirect(`/admin?tab=bouquets&error=${encodeURIComponent(validErr)}`);

  let photo_url = (formData.get("photo_url") as string)?.trim() || null;
  const file = formData.get("photo_file") as File | null;
  if (file && file.size > 0) {
    const fileErr = validateImageFile(file);
    if (fileErr) redirect(`/admin?tab=bouquets&error=${encodeURIComponent(fileErr)}`);
    const ext = file.name.split(".").pop()?.toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data: upload } = await admin.storage
      .from("bouquet-photos")
      .upload(filename, await file.arrayBuffer(), { contentType: file.type });
    if (upload) {
      photo_url = admin.storage.from("bouquet-photos").getPublicUrl(upload.path).data.publicUrl;
    }
  }

  const { error } = await admin.from("bouquets").insert({ name, description, price, stock_quantity, is_available, photo_url });
  if (error) redirect(`/admin?tab=bouquets&error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  revalidatePath("/bouquets");
  revalidatePath("/");
  redirect("/admin?tab=bouquets");
}

export async function updateBouquet(bouquetId: string, formData: FormData) {
  if (!isValidUUID(bouquetId)) redirect("/admin?tab=bouquets&error=Invalid+bouquet+ID");
  await assertAdmin();
  const admin = createAdminClient();

  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string).trim();
  const price = parseFloat(formData.get("price") as string);
  const stock_quantity = parseInt(formData.get("stock_quantity") as string, 10);
  const is_available = formData.get("is_available") === "true";

  const validErr = validateBouquetInputs(name, description, price, stock_quantity);
  if (validErr) redirect(`/admin?tab=bouquets&error=${encodeURIComponent(validErr)}`);

  let photo_url = (formData.get("photo_url") as string)?.trim() || null;
  const file = formData.get("photo_file") as File | null;
  if (file && file.size > 0) {
    const fileErr = validateImageFile(file);
    if (fileErr) redirect(`/admin?tab=bouquets&error=${encodeURIComponent(fileErr)}`);
    const ext = file.name.split(".").pop()?.toLowerCase();
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { data: upload } = await admin.storage
      .from("bouquet-photos")
      .upload(filename, await file.arrayBuffer(), { contentType: file.type });
    if (upload) {
      photo_url = admin.storage.from("bouquet-photos").getPublicUrl(upload.path).data.publicUrl;
    }
  }

  const { error } = await admin.from("bouquets").update({ name, description, price, stock_quantity, is_available, photo_url }).eq("id", bouquetId);
  if (error) redirect(`/admin?tab=bouquets&error=${encodeURIComponent(error.message)}`);

  revalidatePath("/admin");
  revalidatePath("/bouquets");
  revalidatePath(`/bouquets/${bouquetId}`);
  revalidatePath("/");
  redirect("/admin?tab=bouquets");
}

export async function deleteBouquet(bouquetId: string) {
  if (!isValidUUID(bouquetId)) redirect("/admin?tab=bouquets&error=Invalid+bouquet+ID");
  await assertAdmin();
  const admin = createAdminClient();
  const { error } = await admin.from("bouquets").delete().eq("id", bouquetId);
  if (error) redirect(`/admin?tab=bouquets&error=${encodeURIComponent(error.message)}`);
  revalidatePath("/admin");
  revalidatePath("/bouquets");
  revalidatePath("/");
  redirect("/admin?tab=bouquets");
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const display_name = (formData.get("display_name") as string)?.trim() || null;
  const saved_address = (formData.get("saved_address") as string)?.trim() || null;

  await supabase
    .from("profiles")
    .update({ display_name, saved_address })
    .eq("id", user.id);

  revalidatePath("/profile");
  redirect("/profile?saved=1");
}
