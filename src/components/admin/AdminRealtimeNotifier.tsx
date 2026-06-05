"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AdminRealtimeNotifier() {
  const router = useRouter();
  const mountedRef = useRef(false);

  useEffect(() => {
    // Skip the initial mount to avoid toasting on page load
    const supabase = createClient();

    const channel = supabase
      .channel("admin-new-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => {
          if (!mountedRef.current) return;
          toast("New order received!", {
            description: "A customer just placed an order.",
            duration: 8000,
            action: {
              label: "View",
              onClick: () => router.push("/admin?tab=orders"),
            },
          });
          router.refresh();
        }
      )
      .subscribe();

    // Mark as mounted after first subscription tick
    const t = setTimeout(() => { mountedRef.current = true; }, 500);

    return () => {
      clearTimeout(t);
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
