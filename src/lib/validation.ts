const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export function isValidUUID(id: string): boolean {
  return UUID_RE.test(id);
}

export function isSafeRedirect(path: string): boolean {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}

export function validateBouquetInputs(name: string, description: string, price: number, stock: number) {
  if (!name || name.length < 1 || name.length > 100) return "Name must be 1–100 characters.";
  if (description.length > 500) return "Description must be under 500 characters.";
  if (isNaN(price) || price < 0.01 || price > 999_999) return "Price must be between ₱0.01 and ₱999,999.";
  if (!Number.isInteger(stock) || stock < 0 || stock > 9_999) return "Stock must be a whole number between 0 and 9,999.";
  return null;
}

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Only JPEG, PNG, WebP, or GIF images are allowed.";
  if (file.size > MAX_IMAGE_BYTES) return "Image must be under 5 MB.";
  return null;
}

export function validateCartItems(items: unknown[]): string | null {
  if (!Array.isArray(items) || items.length === 0) return "Cart is empty.";
  for (const item of items) {
    if (typeof item !== "object" || item === null) return "Invalid cart data.";
    const i = item as Record<string, unknown>;
    if (typeof i.bouquetId !== "string" || !isValidUUID(i.bouquetId)) return "Invalid item ID.";
    if (typeof i.quantity !== "number" || !Number.isInteger(i.quantity) || i.quantity < 1 || i.quantity > 99)
      return "Quantity must be between 1 and 99.";
  }
  return null;
}
