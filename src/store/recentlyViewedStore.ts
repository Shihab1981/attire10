import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentlyViewedState {
  ids: string[];
  addProduct: (id: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      ids: [],
      addProduct: (id: string) => {
        const current = get().ids.filter((i) => i !== id);
        set({ ids: [id, ...current].slice(0, 10) });
      },
    }),
    { name: "recently-viewed" }
  )
);
