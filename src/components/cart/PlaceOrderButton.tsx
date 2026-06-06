"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart";
import { Bouquet } from "@/lib/types";
import { createCartItem } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function PlaceOrderButton({ bouquet }: { bouquet: Bouquet }) {
  const router = useRouter();
  const { addItem } = useCart();

  function handlePlaceOrder() {
    addItem(createCartItem(bouquet));
    router.push("/cart");
  }

  return (
    <Button
      onClick={handlePlaceOrder}
      variant="outline"
      className="w-full bg-[#E8748A] hover:bg-[#d4607a] text-white text-base font-semibold py-3.5 h-auto rounded-full"
    >
      Place Order
    </Button>
  );
}
