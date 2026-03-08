import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";

const FlashSale = () => {
  const { data: sales = [] } = useQuery({
    queryKey: ["flash-sales"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("flash_sales")
        .select("*, products(*)")
        .eq("active", true)
        .gte("ends_at", now)
        .lte("starts_at", now)
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  if (sales.length === 0) return null;

  // Use the first sale's end time for the main countdown
  const endTime = sales[0]?.ends_at;

  return (
    <section className="bg-foreground text-primary-foreground overflow-hidden">
      <div className="container py-12 md:py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} className="text-accent" />
              <p className="text-[10px] tracking-[0.3em] uppercase font-body text-primary-foreground/50">
                Limited Time Offer
              </p>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Flash Sale</h2>
          </div>
          <CountdownTimer endTime={endTime} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {sales.map((sale: any, i: number) => {
            const product = sale.products;
            if (!product) return null;
            const discount = product.price - sale.sale_price;
            const discountPct = Math.round((discount / product.price) * 100);

            return (
              <motion.div
                key={sale.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
              >
                <Link to={`/product/${product.id}`} className="group block">
                  <div className="relative aspect-[3/4] bg-primary-foreground/5 overflow-hidden mb-3">
                    <img
                      src={product.image_url || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[9px] font-body font-bold tracking-[0.15em] uppercase px-2.5 py-1">
                      -{discountPct}%
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-sm line-clamp-1 group-hover:text-accent transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="font-display font-bold text-accent">৳{sale.sale_price.toLocaleString()}</span>
                    <span className="text-primary-foreground/40 line-through text-xs font-body">৳{product.price.toLocaleString()}</span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-[11px] tracking-[0.15em] uppercase font-body text-primary-foreground/50 hover:text-accent transition-colors"
          >
            View All Products <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
};

const CountdownTimer = ({ endTime }: { endTime: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(endTime).getTime() - Date.now());
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Min", value: timeLeft.minutes },
    { label: "Sec", value: timeLeft.seconds },
  ];

  return (
    <div className="flex items-center gap-2">
      {units.map((u, i) => (
        <div key={u.label} className="flex items-center gap-2">
          <div className="bg-primary-foreground/10 border border-primary-foreground/10 px-3 py-2 text-center min-w-[52px]">
            <span className="font-display text-xl md:text-2xl font-bold block leading-none">
              {String(u.value).padStart(2, "0")}
            </span>
            <span className="text-[8px] tracking-[0.2em] uppercase text-primary-foreground/40 font-body mt-1 block">
              {u.label}
            </span>
          </div>
          {i < units.length - 1 && <span className="text-accent font-bold text-lg">:</span>}
        </div>
      ))}
    </div>
  );
};

export default FlashSale;
