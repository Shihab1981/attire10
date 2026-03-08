import { Link } from "react-router-dom";
import { categoryImages, type Category } from "@/data/products";
import type { Tables } from "@/integrations/supabase/types";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";

type Product = Tables<"products">;

const ProductCard = ({ product }: { product: Product }) => {
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;
  const image = product.image_url && product.image_url !== "/placeholder.svg"
    ? product.image_url
    : categoryImages[product.category as Category] || "/placeholder.svg";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-4">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-500" />
          
          {/* Quick view overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="glass px-4 py-2.5 text-primary-foreground text-[10px] font-body font-semibold tracking-[0.2em] uppercase flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <Eye size={14} />
              Quick View
            </span>
          </div>

          {/* Bottom accent bar */}
          <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-500 group-hover:w-full" />

          {product.new_arrival && (
            <span className="absolute top-3 left-3 bg-foreground text-background text-[9px] font-body font-semibold tracking-[0.2em] uppercase px-3 py-1.5">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-[9px] font-body font-semibold tracking-[0.2em] uppercase px-3 py-1.5">
              -{discountPercent}%
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-body">
            {product.sub_category}
          </p>
          <h3 className="font-display text-sm md:text-base font-bold leading-snug group-hover:text-accent transition-colors duration-300">
            {product.name}
          </h3>
          <div className="flex items-center gap-2.5 pt-0.5">
            <span className="font-body font-bold text-sm tracking-wide">
              ৳{product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-muted-foreground line-through text-xs font-body">
                ৳{product.original_price!.toLocaleString()}
              </span>
            )}
          </div>
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 pt-1">
              {product.colors.slice(0, 5).map((color) => (
                <span
                  key={color}
                  className="w-3.5 h-3.5 rounded-full border border-border shrink-0 transition-transform duration-200 hover:scale-125"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
              {product.colors.length > 5 && (
                <span className="text-[10px] text-muted-foreground font-body">+{product.colors.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
