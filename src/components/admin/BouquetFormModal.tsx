"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { createBouquet, updateBouquet } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bouquet } from "@/lib/types";
import { Plus, Pencil, Upload, X } from "lucide-react";

type Props =
  | { mode: "create" }
  | { mode: "edit"; bouquet: Bouquet };

export default function BouquetFormModal(props: Props) {
  const isEdit = props.mode === "edit";
  const bouquet = isEdit ? props.bouquet : null;

  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(bouquet?.photo_url ?? null);
  const [isAvailable, setIsAvailable] = useState(bouquet?.is_available ?? true);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    formData.set("is_available", String(isAvailable));
    if (isEdit) {
      await updateBouquet(bouquet!.id, formData);
    } else {
      await createBouquet(formData);
    }
    setOpen(false);
    setPending(false);
  }

  return (
    <>
      {isEdit ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpen(true)}
          className="border-stone-200 text-stone-600 hover:bg-stone-50 text-xs gap-1"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </Button>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          className="bg-[#E8748A] hover:bg-[#d4607a] text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          Add bouquet
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-stone-800">
            {isEdit ? `Edit "${bouquet!.name}"` : "Add a new bouquet"}
          </DialogTitle>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4 pt-2">
          {/* Photo upload */}
          <div className="space-y-2">
            <Label>Photo</Label>
            <div
              className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-stone-100 border-2 border-dashed border-stone-200 cursor-pointer hover:border-[#E8748A] transition-colors group"
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                <>
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    sizes="480px"
                    className="object-cover"
                    unoptimized={preview.startsWith("blob:")}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                    <span className="ml-2 text-white text-sm font-medium">Change photo</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setPreview(null); if (fileRef.current) fileRef.current.value = ""; }}
                    className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 gap-2">
                  <Upload className="w-8 h-8" />
                  <span className="text-sm">Click to upload a photo</span>
                  <span className="text-xs">JPG, PNG, WebP</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              name="photo_file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-stone-100" />
              <span className="text-xs text-stone-400">or paste a URL</span>
              <div className="h-px flex-1 bg-stone-100" />
            </div>
            <Input
              name="photo_url"
              type="url"
              placeholder="https://..."
              defaultValue={bouquet?.photo_url ?? ""}
            />
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              name="name"
              required
              placeholder="e.g. Sunrise Garden"
              defaultValue={bouquet?.name ?? ""}
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              required
              rows={3}
              className="resize-none"
              placeholder="Describe the bouquet — what flowers, what feeling..."
              defaultValue={bouquet?.description ?? ""}
            />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">Price (₱) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step={0.01}
                required
                placeholder="850.00"
                defaultValue={bouquet?.price ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="stock_quantity">Stock *</Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                min={0}
                required
                placeholder="10"
                defaultValue={bouquet?.stock_quantity ?? ""}
              />
            </div>
          </div>

          {/* Availability */}
          <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-stone-700">Available for ordering</p>
              <p className="text-xs text-stone-400 mt-0.5">
                Customers can browse and order this bouquet
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAvailable((v) => !v)}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                isAvailable ? "bg-[#E8748A]" : "bg-stone-300"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  isAvailable ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pending}
              className="flex-1 bg-[#E8748A] hover:bg-[#d4607a] text-white"
            >
              {pending
                ? isEdit ? "Saving…" : "Adding…"
                : isEdit ? "Save changes" : "Add bouquet"}
            </Button>
          </div>
        </form>
      </DialogContent>
      </Dialog>
    </>
  );
}
