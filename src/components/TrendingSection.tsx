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
    <section className="py-10 md:py-16 bg-secondary/30">
      <div className="container">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-1">
              Most Wanted
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
              Trending Now
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-[11px] font-body font-semibold tracking-[0.15em] uppercase text-accent hover:text-accent/80 transition-colors group"
          >
            View All
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {trending.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
