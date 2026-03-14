import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";

const RecentlyViewed = ({ excludeId }: { excludeId?: string }) => {
  const ids = useRecentlyViewedStore((s) => s.ids).filter((i) => i !== excludeId);
  const displayIds = ids.slice(0, 4);

  const { data: products = [] } = useQuery({
    queryKey: ["recently-viewed", displayIds],
    queryFn: async () => {
      if (displayIds.length === 0) return [];
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", displayIds);
      if (error) throw error;
      // Sort by the order in displayIds
      return displayIds.map((id) => data.find((p) => p.id === id)).filter(Boolean) as typeof data;
    },
    enabled: displayIds.length > 0,
  });

  if (products.length === 0) return null;

  return (
    <section className="mt-16 md:mt-24 pt-10">
      <div className="section-divider mb-10" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10"
      >
        <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-muted-foreground font-body mb-2">
          Your Browsing History
        </p>
        <h2 className="font-display text-xl md:text-3xl font-extrabold tracking-tight">
          Recently Viewed
        </h2>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
