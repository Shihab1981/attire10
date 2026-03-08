import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FlashSaleData {
  product_id: string;
  sale_price: number;
  ends_at: string;
}

export const useFlashSales = () => {
  return useQuery({
    queryKey: ["flash-sales-active"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("flash_sales")
        .select("product_id, sale_price, ends_at")
        .eq("active", true)
        .gte("ends_at", now)
        .lte("starts_at", now);
      if (error) throw error;
      const map = new Map<string, FlashSaleData>();
      data?.forEach((s) => map.set(s.product_id, s));
      return map;
    },
    refetchInterval: 60000,
  });
};
