import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

interface FavoritesState {
  items: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleFavorite: (product) => {
        const items = get().items;
        const exists = items.some((p) => p.id === product.id);
        set({ items: exists ? items.filter((p) => p.id !== product.id) : [...items, product] });
      },
      isFavorite: (productId) => get().items.some((p) => p.id === productId),
      clearFavorites: () => set({ items: [] }),
    }),
    { name: "favorites-storage" }
  )
);
