"use client";

import { useState } from "react";
import { confirmOrder } from "@/app/actions";
import { CheckCircle2 } from "lucide-react";

export default function ConfirmOrderButton({ orderId }: { orderId: string }) {
  const [step, setStep] = useState<"idle" | "confirming" | "pending">("idle");

  async function handleConfirm() {
    setStep("pending");
    await confirmOrder(orderId);
  }

  if (step === "confirming") {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleConfirm}
          className="px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-colors"
        >
          Yes, confirm
        </button>
        <button
          onClick={() => setStep("idle")}
          className="px-2 py-1 rounded-lg text-stone-400 hover:text-stone-600 text-xs transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep("confirming")}
      disabled={step === "pending"}
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 hover:bg-green-100 text-green-700 text-xs font-semibold transition-colors disabled:opacity-50"
    >
      <CheckCircle2 className="w-3.5 h-3.5" />
      {step === "pending" ? "Confirming…" : "Confirm"}
    </button>
  );
}
