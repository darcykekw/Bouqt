"use client";

import { useState } from "react";
import { deleteBouquet } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

export default function DeleteBouquetButton({
  bouquetId,
  bouquetName,
}: {
  bouquetId: string;
  bouquetName: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    setPending(true);
    await deleteBouquet(bouquetId);
    setOpen(false);
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="border-red-200 text-red-500 hover:bg-red-50 text-xs gap-1"
      >
        <Trash2 className="w-3 h-3" />
        Delete
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-stone-800">Delete bouquet?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <p className="text-sm text-stone-500">
            You&apos;re about to permanently delete{" "}
            <span className="font-semibold text-stone-700">{bouquetName}</span>. This
            can&apos;t be undone, and it will be removed from the shop immediately.
          </p>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={pending}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {pending ? "Deleting…" : "Yes, delete it"}
            </Button>
          </div>
        </div>
      </DialogContent>
      </Dialog>
    </>
  );
}
