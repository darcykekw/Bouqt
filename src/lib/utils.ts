import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Bouquet } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Helper to add a bouquet to cart without duplicating logic
 * Used by AddToCartButton, PlaceOrderButton, ReorderButton
 */
export function createCartItem(bouquet: Bouquet) {
  return {
    bouquetId: bouquet.id,
    name: bouquet.name,
    price: bouquet.price,
    photo_url: bouquet.photo_url,
    maxStock: bouquet.stock_quantity,
  };
}
