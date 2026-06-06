"use client";

import { Trash2 } from "lucide-react";
import { deleteOrder } from "@/app/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function DeleteOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();

  async function handleDelete() {
    const result = await deleteOrder(orderId);
    if (result?.error) {
      toast.error("Could not delete order.");
      return;
    }
    router.refresh();
  }

  return (
    <ConfirmDialog
      title="Remove this order?"
      description="This will hide the order from your history. Your order data is preserved for our records."
      confirmText="Yes, remove it"
      confirmClassName="bg-red-600 hover:bg-red-700 text-white"
      onConfirm={handleDelete}
    >
      <button className="flex items-center gap-1 text-xs text-stone-300 hover:text-red-400 transition-colors">
        <Trash2 className="w-3 h-3" />
        Delete
      </button>
    </ConfirmDialog>
  );
}
