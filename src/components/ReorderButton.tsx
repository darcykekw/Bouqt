"use client";

import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { OrderItem } from "@/lib/types";

export default function ReorderButton({ items }: { items: OrderItem[] }) {
  const { addItem } = useCart();
  const router = useRouter();

  function handleReorder() {
    for (const item of items) {
      if (!item.bouquet) continue;
      addItem({
        bouquetId: item.bouquet_id,
        name: item.bouquet.name,
        price: item.bouquet.price,
        photo_url: item.bouquet.photo_url,
        maxStock: item.bouquet.stock_quantity,
      });
    }
    toast.success("Items added to cart!");
    router.push("/cart");
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleReorder}
      className="text-stone-400 hover:text-[#E8748A] text-xs gap-1"
    >
      <RotateCcw className="w-3 h-3" />
      Reorder
    </Button>
  );
}
