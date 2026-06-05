import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReceiptDocument } from "@/components/ReceiptDocument";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*, bouquet:bouquets(*))")
    .eq("id", id)
    .eq("customer_id", user.id)
    .eq("hidden_by_customer", false)
    .single();

  if (!order || order.status !== "confirmed") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pdfBuffer = await renderToBuffer(
    <ReceiptDocument
      order={order}
      items={order.order_items ?? []}
      customerEmail={user.email ?? ""}
    />
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="receipt_${id}.pdf"`,
    },
  });
}
