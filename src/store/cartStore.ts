import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Size } from "@/data/products";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

export interface CartItem {
  product: Product;
  size: Size;
  color?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, size: Size, color?: string) => void;
  removeItem: (productId: string, size: Size, color?: string) => void;
  updateQuantity: (productId: string, size: Size, quantity: number, color?: string) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

const matchItem = (i: CartItem, productId: string, size: Size, color?: string) =>
  i.product.id === productId && i.size === size && (i.color || "") === (color || "");

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, size, color) => {
        const items = get().items;
        const existing = items.find((i) => matchItem(i, product.id, size, color));
        if (existing) {
          set({
            items: items.map((i) =>
              matchItem(i, product.id, size, color)
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { product, size, color, quantity: 1 }] });
        }
      },
      removeItem: (productId, size, color) => {
        set({
          items: get().items.filter((i) => !matchItem(i, productId, size, color)),
        });
      },
      updateQuantity: (productId, size, quantity, color) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }
        set({
          items: get().items.map((i) =>
            matchItem(i, productId, size, color)
              ? { ...i, quantity }
              : i
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((t, i) => t + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((t, i) => t + i.product.price * i.quantity, 0),
    }),
    { name: "cart-storage" }
  )
);
