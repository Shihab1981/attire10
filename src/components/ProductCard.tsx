import { Link } from "react-router-dom";
import type { Product } from "@/data/products";
import { motion } from "framer-motion";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {product.newArrival && (
            <span className="absolute top-3 left-3 bg-foreground text-background text-[10px] font-display font-semibold tracking-wider px-2.5 py-1">
              NEW
            </span>
          )}
          {hasDiscount && (
            <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-[10px] font-display font-semibold tracking-wider px-2.5 py-1">
              SALE
            </span>
          )}
        </div>
        <div>
          <p className="text-xs text-muted-foreground tracking-wide uppercase mb-1">
            {product.subCategory}
          </p>
          <h3 className="font-display text-sm font-medium leading-snug">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-display font-semibold text-sm">
              ৳{product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-muted-foreground line-through text-xs">
                ৳{product.originalPrice!.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
