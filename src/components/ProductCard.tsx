import { Link } from "react-router-dom";
import { categoryImages, type Category } from "@/data/products";
import type { Tables } from "@/integrations/supabase/types";
import { motion } from "framer-motion";
import { Eye, Heart, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import type { FlashSaleData } from "@/hooks/useFlashSales";
import { useFavoritesStore } from "@/store/favoritesStore";
type Product = Tables<"products">;

const MiniCountdown = ({ endsAt }: { endsAt: string }) => {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(0, new Date(endsAt).getTime() - Date.now());
      if (diff === 0) { setLabel(""); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLabel(h > 0 ? `${h}h ${m}m` : `${m}m ${s}s`);
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endsAt]);

  if (!label) return null;
  return <span className="text-[9px] text-accent font-body font-medium">{label} left</span>;
};

const ProductCard = ({ product, flashSale }: { product: Product; flashSale?: FlashSaleData }) => {
  const effectivePrice = flashSale ? flashSale.sale_price : product.price;
  const originalPrice = flashSale ? product.price : product.original_price;
  const hasDiscount = originalPrice && originalPrice > effectivePrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice! - effectivePrice) / originalPrice!) * 100)
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
        <div className="relative aspect-[3/4] overflow-hidden bg-secondary mb-3">
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-500" />
          
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <span className="glass px-4 py-2.5 text-primary-foreground text-[10px] font-body font-semibold tracking-[0.2em] uppercase flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <Eye size={14} />
              Quick View
            </span>
          </div>

          <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-500 group-hover:w-full" />

          {/* Favorite button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFavorite(product); }}
            className="absolute top-2.5 right-2.5 z-10 w-8 h-8 bg-background/70 backdrop-blur-sm flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-background"
            aria-label="Toggle favorite"
          >
            <Heart
              size={14}
              strokeWidth={1.5}
              className={`transition-colors ${isFav ? "fill-accent text-accent" : "text-muted-foreground hover:text-accent"}`}
            />
          </button>

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {flashSale && (
              <span className="bg-accent text-accent-foreground text-[9px] font-body font-bold tracking-wider uppercase px-2 py-1 flex items-center gap-1">
                <Zap size={10} /> Flash Sale
              </span>
            )}
            {!flashSale && product.new_arrival && (
              <span className="bg-foreground text-background text-[9px] font-body font-semibold tracking-[0.2em] uppercase px-2.5 py-1">
                New
              </span>
            )}
          </div>
          {hasDiscount && (
            <span className="absolute top-11 right-2.5 bg-accent text-accent-foreground text-[9px] font-body font-semibold tracking-[0.2em] uppercase px-2.5 py-1">
              -{discountPercent}%
            </span>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-body">
            {product.sub_category}
          </p>
          <h3 className="font-display text-sm font-bold leading-snug group-hover:text-accent transition-colors duration-300 line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 pt-0.5">
            <span className={`font-body font-bold text-sm tracking-wide ${flashSale ? "text-accent" : ""}`}>
              ৳{effectivePrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-muted-foreground line-through text-xs font-body">
                ৳{originalPrice!.toLocaleString()}
              </span>
            )}
            {flashSale && <MiniCountdown endsAt={flashSale.ends_at} />}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
