import { z } from "zod";

// ── Constants ───────────────────────────────────────────────────────────────

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

// ── Simple helpers ──────────────────────────────────────────────────────────

export function isValidUUID(id: string): boolean {
  return UUID_RE.test(id);
}

export function isSafeRedirect(path: string): boolean {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//")
  );
}

// ── Zod schemas ─────────────────────────────────────────────────────────────

export const BouquetSchema = z.object({
  name: z
    .string()
    .min(1, "Name must be at least 1 character.")
    .max(100, "Name must be under 100 characters."),
  description: z.string().max(500, "Description must be under 500 characters."),
  price: z
    .number()
    .min(0.01, "Price must be at least ₱0.01.")
    .max(999_999, "Price must be under ₱999,999."),
  stock_quantity: z
    .number()
    .int("Stock must be a whole number.")
    .min(0, "Stock cannot be negative.")
    .max(9_999, "Stock must be under 9,999."),
});

export const CartItemSchema = z.object({
  bouquetId: z
    .string()
    .regex(UUID_RE, "Invalid item ID."),
  quantity: z
    .number()
    .int("Quantity must be a whole number.")
    .min(1, "Quantity must be at least 1.")
    .max(99, "Quantity must be under 99."),
  name: z.string(),
  price: z.number(),
  photo_url: z.string().nullable().optional(),
  note: z.string().optional(),
  maxStock: z.number().optional(),
});

export const CartSchema = z
  .array(CartItemSchema)
  .min(1, "Cart is empty.");

// ── Image file validation (non-Zod — File objects can't be Zod-parsed server-side) ──

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type))
    return "Only JPEG, PNG, WebP, or GIF images are allowed.";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be under 5 MB.";
  return null;
}

// ── Backward-compatible wrappers (powered by Zod internally) ───────────────

export function validateBouquetInputs(
  name: string,
  description: string,
  price: number,
  stock: number
): string | null {
  const result = BouquetSchema.safeParse({
    name,
    description,
    price,
    stock_quantity: stock,
  });
  if (!result.success) return result.error.issues[0].message;
  return null;
}

export function validateCartItems(items: unknown): string | null {
  const result = CartSchema.safeParse(items);
  if (!result.success) return result.error.issues[0].message;
  return null;
}
