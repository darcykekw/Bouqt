"use client";

import { XCircle } from "lucide-react";
import { cancelOrder } from "@/app/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  return (
    <ConfirmDialog
      title="Cancel this order?"
      description="Cancelling an order cannot be undone. The customer will need to place a new order if they change their mind."
      confirmText="Yes, cancel order"
      confirmClassName="bg-red-600 hover:bg-red-700 text-white"
      onConfirm={() => cancelOrder(orderId)}
    >
      <button className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-500 text-xs font-medium transition-colors">
        <XCircle className="w-3.5 h-3.5" />
        Cancel order
      </button>
    </ConfirmDialog>
  );
}
