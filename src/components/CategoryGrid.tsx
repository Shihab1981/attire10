import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";

const CategorySkeleton = () => (
  <section className="py-10 md:py-16">
    <div className="container">
      <div className="flex items-end justify-between mb-6 md:mb-8">
        <div className="space-y-2">
          <div className="h-2.5 w-24 bg-muted-foreground/15 rounded animate-pulse" />
          <div className="h-7 w-48 bg-muted-foreground/15 rounded animate-pulse" />
        </div>
        <div className="h-3 w-16 bg-muted-foreground/10 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="aspect-[3/4] bg-secondary animate-pulse rounded-sm" />
        ))}
      </div>
    </div>
  </section>
);

const CategoryGrid = () => {
  const { categories } = useCategories();

  if (categories.length === 0) return <CategorySkeleton />;

  return (
    <section className="py-10 md:py-16">
      <div className="container">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-body mb-1">
              Curated Selection
            </p>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold tracking-tight">
              Shop by Category
            </h2>
          </div>
          <Link to="/products" className="text-[11px] font-body font-semibold tracking-[0.15em] uppercase text-accent hover:text-accent/80 transition-colors">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Link
                to={`/products?category=${cat.slug}`}
                className="group block relative aspect-[3/4] overflow-hidden"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 brightness-[0.85] group-hover:brightness-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-500 group-hover:w-full" />
                <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
                  <div>
                    <h3 className="font-display text-sm md:text-base font-bold text-primary-foreground">
                      {cat.name}
                    </h3>
                    {cat.description && (
                      <p className="text-[9px] md:text-[10px] text-primary-foreground/70 font-body">
                        {cat.description}
                      </p>
                    )}
                  </div>
                  <ArrowUpRight size={12} className="text-primary-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
