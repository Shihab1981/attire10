import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

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
    <section className="py-20 md:py-32 bg-secondary/40 relative overflow-hidden">
      {/* Subtle decorative circle */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full border border-border/30 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full border border-border/20 pointer-events-none" />

      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-14 md:mb-20"
        >
          <div>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: 40 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="h-[2px] bg-accent mb-6"
            />
            <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-muted-foreground font-body mb-3">
              Most Wanted
            </p>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Trending Now
            </h2>
          </div>
          <div className="mt-6 md:mt-0 flex flex-col items-start md:items-end gap-4">
            <p className="text-muted-foreground text-sm font-body font-light max-w-sm md:text-right">
              The most sought-after pieces this season, handpicked for the discerning gentleman.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-[11px] font-body font-semibold tracking-[0.15em] uppercase text-accent hover:text-accent/80 transition-colors group"
            >
              View All
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {trending.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
