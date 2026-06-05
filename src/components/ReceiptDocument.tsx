import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Order, OrderItem, orderTotal } from "@/lib/types";

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", backgroundColor: "#ffffff", padding: 48, fontSize: 11, color: "#1c1917" },
  header: { marginBottom: 28, borderBottom: "2px solid #E8748A", paddingBottom: 18, flexDirection: "row", justifyContent: "space-between" },
  brand: { fontSize: 26, fontFamily: "Helvetica-Bold", color: "#E8748A" },
  tagline: { fontSize: 9, color: "#a8a29e", marginTop: 2 },
  receiptLabel: { fontSize: 9, color: "#a8a29e", textAlign: "right", marginBottom: 2 },
  orderId: { fontSize: 8, color: "#a8a29e", textAlign: "right", maxWidth: 200 },
  badge: { backgroundColor: "#dcfce7", color: "#15803d", borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, fontSize: 9, fontFamily: "Helvetica-Bold", alignSelf: "flex-end", marginTop: 4 },
  sectionTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#E8748A", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginTop: 18 },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  label: { color: "#78716c", flex: 1 },
  value: { color: "#1c1917", textAlign: "right", flex: 1 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderBottom: "1px solid #f5ede8" },
  itemName: { flex: 2, color: "#1c1917", fontFamily: "Helvetica-Bold" },
  itemQty: { flex: 1, textAlign: "center", color: "#78716c" },
  itemPrice: { flex: 1, textAlign: "right", color: "#1c1917" },
  itemNote: { fontSize: 9, color: "#a8a29e", fontStyle: "italic", marginTop: 2 },
  divider: { borderBottom: "1px solid #e7e5e4", marginVertical: 10 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTop: "1.5px solid #E8748A" },
  totalLabel: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#1c1917" },
  totalValue: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#E8748A" },
  footer: { position: "absolute", bottom: 40, left: 48, right: 48, textAlign: "center", fontSize: 9, color: "#a8a29e", borderTop: "1px solid #e7e5e4", paddingTop: 12 },
});

type Props = {
  order: Order;
  items: OrderItem[];
  customerEmail: string;
};

export function ReceiptDocument({ order, items, customerEmail }: Props) {
  const total = orderTotal({ ...order, order_items: items });
  const subtotal = total - order.delivery_fee;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <Document title={`Bouqt Receipt — ${order.id}`} author="Bouqt">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <View>
            <Text style={s.brand}>Bouqt</Text>
            <Text style={s.tagline}>Fresh bouquets, made with heart.</Text>
          </View>
          <View>
            <Text style={s.receiptLabel}>ORDER RECEIPT</Text>
            <Text style={s.orderId}>{order.id}</Text>
            <View style={s.badge}><Text>CONFIRMED</Text></View>
          </View>
        </View>

        <Text style={s.sectionTitle}>Items</Text>
        <View style={s.row}>
          <Text style={[s.itemName, { color: "#78716c", fontSize: 9 }]}>Bouquet</Text>
          <Text style={[s.itemQty, { color: "#78716c", fontSize: 9 }]}>Qty</Text>
          <Text style={[s.itemPrice, { color: "#78716c", fontSize: 9 }]}>Subtotal</Text>
        </View>
        {items.map((item) => (
          <View key={item.id} style={s.itemRow}>
            <View style={{ flex: 2 }}>
              <Text style={s.itemName}>{item.bouquet?.name ?? "Bouquet"}</Text>
              {item.note && <Text style={s.itemNote}>"{item.note}"</Text>}
            </View>
            <Text style={s.itemQty}>×{item.quantity}</Text>
            <Text style={s.itemPrice}>₱{(item.price_snapshot * item.quantity).toFixed(2)}</Text>
          </View>
        ))}

        <Text style={s.sectionTitle}>Order Details</Text>
        <View style={s.row}><Text style={s.label}>Customer</Text><Text style={s.value}>{customerEmail}</Text></View>
        <View style={s.row}><Text style={s.label}>Placed</Text><Text style={s.value}>{fmt(order.created_at)}</Text></View>
        {order.confirmed_at && (
          <View style={s.row}><Text style={s.label}>Confirmed</Text><Text style={s.value}>{fmt(order.confirmed_at)}</Text></View>
        )}
        <View style={s.row}><Text style={s.label}>Fulfillment</Text><Text style={s.value}>{order.fulfillment === "delivery" ? "Delivery" : "Pickup"}</Text></View>
        {order.delivery_address && (
          <View style={s.row}><Text style={s.label}>Delivery address</Text><Text style={s.value}>{order.delivery_address}</Text></View>
        )}

        <View style={s.divider} />
        <View style={s.row}><Text style={s.label}>Subtotal</Text><Text style={s.value}>₱{subtotal.toFixed(2)}</Text></View>
        {order.fulfillment === "delivery" && (
          <View style={s.row}><Text style={s.label}>Delivery fee</Text><Text style={s.value}>₱{order.delivery_fee.toFixed(2)}</Text></View>
        )}
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total paid</Text>
          <Text style={s.totalValue}>₱{total.toFixed(2)}</Text>
        </View>

        <Text style={s.footer}>Thank you for choosing Bouqt. Every arrangement is made with love, just for you.{"\n"}This is your official order receipt.</Text>
      </Page>
    </Document>
  );
}
