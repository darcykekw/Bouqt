"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCart } from "@/lib/store/cart";

export default function CartInitializer() {
  const clearCart = useCart((s) => s.clearCart);

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUserId = session?.user?.id ?? null;
      const storedUserId = localStorage.getItem("bouqt-cart-uid");

      if (storedUserId !== currentUserId) {
        clearCart();
        if (currentUserId) {
          localStorage.setItem("bouqt-cart-uid", currentUserId);
        } else {
          localStorage.removeItem("bouqt-cart-uid");
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [clearCart]);

  return null;
}
