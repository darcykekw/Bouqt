"use client";

import { Trash2 } from "lucide-react";
import { deleteBouquet } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function DeleteBouquetButton({
  bouquetId,
  bouquetName,
}: {
  bouquetId: string;
  bouquetName: string;
}) {
  return (
    <ConfirmDialog
      title="Delete bouquet?"
      description={`You're about to permanently delete "${bouquetName}". This can't be undone, and it will be removed from the shop immediately.`}
      confirmText="Yes, delete it"
      confirmClassName="bg-red-600 hover:bg-red-700 text-white"
      onConfirm={() => deleteBouquet(bouquetId)}
    >
      <Button
        size="sm"
        variant="outline"
        className="border-red-200 text-red-500 hover:bg-red-50 text-xs gap-1"
      >
        <Trash2 className="w-3 h-3" />
        Delete
      </Button>
    </ConfirmDialog>
  );
}
