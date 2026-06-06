"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function AdminRealtimeNotifier() {
  const router = useRouter();
  // Replaces the fragile mountedRef + setTimeout pattern.
  // The subscription fires immediately on INSERT; we only want to show a toast
  // after the component has had time to settle (i.e. not on the initial page load
  // that happens to trigger a CDC event). A state-based flag cleaned up via its
  // own effect is safe against unmounts during the delay.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-new-orders")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        () => {
          if (!ready) return;
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

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, ready]);

  return null;
}
