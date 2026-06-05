"use client";

import { useState } from "react";
import { cancelOrder } from "@/app/actions";
import { XCircle } from "lucide-react";

export default function CancelOrderButton({ orderId }: { orderId: string }) {
  const [step, setStep] = useState<"idle" | "confirming" | "pending">("idle");

  async function handleCancel() {
    setStep("pending");
    await cancelOrder(orderId);
  }

  if (step === "confirming") {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleCancel}
          className="px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold transition-colors"
        >
          Yes, cancel
        </button>
        <button
          onClick={() => setStep("idle")}
          className="px-2 py-1 rounded-lg text-stone-400 hover:text-stone-600 text-xs transition-colors"
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep("confirming")}
      disabled={step === "pending"}
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-stone-400 hover:bg-red-50 hover:text-red-500 text-xs font-medium transition-colors disabled:opacity-50"
    >
      <XCircle className="w-3.5 h-3.5" />
      {step === "pending" ? "Cancelling…" : "Cancel order"}
    </button>
  );
}
