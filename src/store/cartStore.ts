import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, Size } from "@/data/products";

export interface CartItem {
  product: Product;
  size: Size;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, size: Size) => void;
  removeItem: (productId: string, size: Size) => void;
  updateQuantity: (productId: string, size: Size, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, size) => {
        const items = get().items;
        const existing = items.find(
          (i) => i.product.id === product.id && i.size === size
        );
        if (existing) {
          set({
            items: items.map((i) =>
              i.product.id === product.id && i.size === size
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
        } else {
          set({ items: [...items, { product, size, quantity: 1 }] });
        }
      },
      removeItem: (productId, size) => {
        set({
          items: get().items.filter(
            (i) => !(i.product.id === productId && i.size === size)
          ),
        });
      },
      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.product.id === productId && i.size === size
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
