"use client";

import { useState } from "react";
import { toggleBouquetAvailability } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default function ToggleAvailabilityButton({
  bouquetId,
  currentValue,
}: {
  bouquetId: string;
  currentValue: boolean;
}) {
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    await toggleBouquetAvailability(bouquetId, currentValue);
  }

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleClick}
      disabled={pending}
      className={`text-xs ${
        currentValue
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-green-200 text-green-600 hover:bg-green-50"
      } disabled:opacity-50`}
    >
      {pending ? "…" : currentValue ? "Disable" : "Enable"}
    </Button>
  );
}
