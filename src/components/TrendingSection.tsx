import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";

const TrendingSection = () => {
  const { data: trending = [] } = useQuery({
    queryKey: ["trending-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("trending", true)
        .eq("in_stock", true)
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  if (trending.length === 0) return null;

  return (
    <section className="py-20 md:py-32 bg-secondary/40">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 md:mb-20"
        >
          <div>
            <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-muted-foreground font-body mb-3">
              Most Wanted
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-medium italic">
              Trending Now
            </h2>
          </div>
          <p className="text-muted-foreground text-sm font-body font-light mt-4 md:mt-0 max-w-sm">
            The most sought-after pieces this season, handpicked for the discerning gentleman.
          </p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {trending.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
