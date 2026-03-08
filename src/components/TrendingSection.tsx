import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";

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
    <section className="py-16 md:py-24 bg-secondary/50">
      <div className="container">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-4">Trending Now</h2>
        <p className="text-muted-foreground text-center mb-12 max-w-md mx-auto">The most sought-after pieces this season</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {trending.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
