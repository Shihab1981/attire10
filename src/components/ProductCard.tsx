import { Link } from "react-router-dom";
import { categoryImages, type Category } from "@/data/products";
import type { Tables } from "@/integrations/supabase/types";
import { motion } from "framer-motion";

type Product = Tables<"products">;

const ProductCard = ({ product }: { product: Product }) => {
  const hasDiscount = product.original_price && product.original_price > product.price;
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
          {product.new_arrival && (
            <span className="absolute top-3 left-3 bg-foreground text-background text-[9px] font-body font-medium tracking-[0.2em] uppercase px-3 py-1.5">
              New
            </span>
          )}
          {hasDiscount && (
            <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-[9px] font-body font-medium tracking-[0.2em] uppercase px-3 py-1.5">
              Sale
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-body">
            {product.sub_category}
          </p>
          <h3 className="font-display text-sm md:text-base font-semibold leading-snug">
            {product.name}
          </h3>
          <div className="flex items-center gap-2.5 pt-0.5">
            <span className="font-body font-semibold text-sm tracking-wide">
              ৳{product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-muted-foreground line-through text-xs font-body">
                ৳{product.original_price!.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
