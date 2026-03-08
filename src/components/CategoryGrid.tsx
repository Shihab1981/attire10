import { Link } from "react-router-dom";
import { categories } from "@/data/products";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const CategoryGrid = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 md:mb-20"
        >
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 40 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="h-[2px] bg-accent mx-auto mb-6"
          />
          <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-muted-foreground font-body mb-3">
            Curated Selection
          </p>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Shop by Category
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6 }}
            >
              <Link
                to={`/products?category=${cat.slug}`}
                className="group block relative aspect-[3/4] overflow-hidden"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 brightness-[0.85] group-hover:brightness-100"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent transition-opacity duration-500" />
                {/* Hover accent line */}
                <div className="absolute bottom-0 left-0 w-0 h-[3px] bg-accent transition-all duration-500 group-hover:w-full" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 flex items-end justify-between">
                  <div>
                    <h3 className="font-display text-base md:text-lg font-bold text-primary-foreground drop-shadow-sm">
                      {cat.name}
                    </h3>
                    <p className="text-[10px] text-primary-foreground/50 mt-1 tracking-wider uppercase font-body">
                      {cat.description}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-y-0 translate-y-2">
                    <ArrowUpRight
                      size={14}
                      className="text-primary-foreground"
                    />
                  </div>
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
