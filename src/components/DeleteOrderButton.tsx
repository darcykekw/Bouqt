"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteOrder } from "@/app/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DeleteOrderButton({ orderId }: { orderId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setPending(true);
    const result = await deleteOrder(orderId);
    if (result?.error) {
      toast.error("Could not delete order.");
      setPending(false);
      setConfirming(false);
    } else {
      router.refresh();
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-500">Delete this order?</span>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
        >
          {pending ? "Deleting…" : "Yes, delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1 text-xs text-stone-300 hover:text-red-400 transition-colors"
    >
      <Trash2 className="w-3 h-3" />
      Delete
    </button>
  );
}
