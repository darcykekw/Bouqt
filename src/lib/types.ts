export type Bouquet = {
  id: string;
  name: string;
  description: string;
  price: number;
  photo_url: string | null;
  stock_quantity: number;
  is_available: boolean;
  created_at: string;
};

export type OrderStatus = "pending" | "confirmed" | "cancelled";
export type Fulfillment = "pickup" | "delivery";

export type OrderItem = {
  id: string;
  order_id: string;
  bouquet_id: string;
  quantity: number;
  note: string | null;
  price_snapshot: number;
  created_at: string;
  bouquet?: Bouquet;
};

export type Order = {
  id: string;
  customer_id: string;
  fulfillment: Fulfillment;
  delivery_address: string | null;
  delivery_fee: number;
  status: OrderStatus;
  created_at: string;
  confirmed_at: string | null;
  order_items?: OrderItem[];
  customer_email?: string;
};

export type Profile = {
  id: string;
  email: string;
  role: "customer" | "admin";
  display_name: string | null;
  saved_address: string | null;
  created_at: string;
};

export type CartItem = {
  bouquetId: string;
  name: string;
  price: number;
  photo_url: string | null;
  quantity: number;
  note: string;
  maxStock: number;
};

export function orderTotal(order: Order): number {
  const itemsTotal =
    order.order_items?.reduce(
      (sum, i) => sum + i.price_snapshot * i.quantity,
      0
    ) ?? 0;
  return itemsTotal + order.delivery_fee;
}
