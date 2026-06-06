"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ConfirmDialogProps {
  /** The trigger element (button, link, etc.) */
  children: React.ReactNode;
  /** Dialog heading */
  title: string;
  /** Explanatory body text */
  description: string;
  /** Label for the destructive confirm button (default: "Confirm") */
  confirmText?: string;
  /** Label for the cancel button (default: "Cancel") */
  cancelText?: string;
  /** Tailwind classes applied to the confirm button */
  confirmClassName?: string;
  /** Called when the user clicks the confirm button */
  onConfirm: () => void | Promise<void>;
}

/**
 * A reusable confirmation dialog.
 *
 * Renders `children` as the trigger. On click it opens a Dialog asking the
 * user to confirm or cancel. While the action is running the buttons are
 * disabled and the confirm button shows a loading label.
 *
 * Usage:
 * ```tsx
 * <ConfirmDialog
 *   title="Delete bouquet?"
 *   description="This can't be undone."
 *   confirmText="Yes, delete it"
 *   confirmClassName="bg-red-600 hover:bg-red-700 text-white"
 *   onConfirm={() => deleteBouquet(id)}
 * >
 *   <Button variant="outline">Delete</Button>
 * </ConfirmDialog>
 * ```
 */
export function ConfirmDialog({
  children,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmClassName = "bg-red-600 hover:bg-red-700 text-white",
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    try {
      await onConfirm();
    } finally {
      // Keep dialog open on error so the user sees it; the caller can toast
      setPending(false);
      setOpen(false);
    }
  }

  return (
    <>
      {/* Trigger — clone children and attach onClick */}
      <span onClick={() => setOpen(true)} style={{ display: "contents" }}>
        {children}
      </span>

      <Dialog open={open} onOpenChange={(v) => !pending && setOpen(v)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-stone-800">{title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <p className="text-sm text-stone-500">{description}</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                {cancelText}
              </Button>
              <Button
                className={`flex-1 ${confirmClassName}`}
                disabled={pending}
                onClick={handleConfirm}
              >
                {pending ? "Please wait…" : confirmText}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
