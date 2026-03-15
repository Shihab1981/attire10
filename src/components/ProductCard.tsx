import { Link, useNavigate } from "react-router-dom";
import { categoryImages, type Category, type Size } from "@/data/products";
import type { Tables } from "@/integrations/supabase/types";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, Heart, Zap, ShoppingBag, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import type { FlashSaleData } from "@/hooks/useFlashSales";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useCartStore } from "@/store/cartStore";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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

const QuickViewModal = ({
  open,
  onClose,
  product,
  flashSale,
}: {
  open: boolean;
  onClose: () => void;
  product: Product;
  flashSale?: FlashSaleData;
}) => {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFav = useFavoritesStore((s) => s.isFavorite)(product.id);

  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const effectivePrice = flashSale ? flashSale.sale_price : product.price;
  const originalPrice = flashSale ? product.price : product.original_price;
  const hasDiscount = originalPrice && originalPrice > effectivePrice;

  const allImages = [
    product.image_url && product.image_url !== "/placeholder.svg" ? product.image_url : categoryImages[product.category as Category] || "/placeholder.svg",
    ...(product.images || []).filter((img) => img && img !== "/placeholder.svg"),
  ];
  const uniqueImages = [...new Set(allImages)];

  const sizes = (product.sizes || []) as Size[];
  const colors = product.colors || [];

  const handleAdd = () => {
    if (!selectedSize) return;
    addItem(product, selectedSize, selectedColor || undefined);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl p-0 gap-0 overflow-hidden border-border/50">
        <VisuallyHidden><DialogTitle>{product.name}</DialogTitle></VisuallyHidden>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-secondary overflow-hidden">
            <img
              src={uniqueImages[imgIdx]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {uniqueImages.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx((i) => (i - 1 + uniqueImages.length) % uniqueImages.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/70 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setImgIdx((i) => (i + 1) % uniqueImages.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/70 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {uniqueImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? "bg-accent w-4" : "bg-background/60"}`}
                    />
                  ))}
                </div>
              </>
            )}
            {flashSale && (
              <span className="absolute top-3 left-3 bg-accent text-accent-foreground text-[9px] font-body font-bold tracking-wider uppercase px-2 py-1 flex items-center gap-1">
                <Zap size={10} /> Flash Sale
              </span>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col">
            <p className="text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-body mb-1">
              {product.sub_category}
            </p>
            <h3 className="font-display text-xl font-bold leading-tight mb-2">{product.name}</h3>

            <div className="flex items-center gap-2 mb-4">
              <span className={`font-body font-bold text-lg ${flashSale ? "text-accent" : ""}`}>
                ৳{effectivePrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-muted-foreground line-through text-sm font-body">
                  ৳{originalPrice!.toLocaleString()}
                </span>
              )}
              {flashSale && <MiniCountdown endsAt={flashSale.ends_at} />}
            </div>

            <p className="text-sm text-muted-foreground font-body line-clamp-3 mb-4">
              {product.description || "Premium quality fabric with expert craftsmanship."}
            </p>

            {product.fabric && (
              <p className="text-[11px] text-muted-foreground font-body mb-4">
                <span className="font-semibold text-foreground">Fabric:</span> {product.fabric}
              </p>
            )}

            {/* Sizes */}
            {sizes.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] tracking-[0.2em] uppercase font-body font-semibold mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[36px] h-9 px-2.5 border text-xs font-body font-medium transition-all ${
                        selectedSize === s
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {colors.length > 0 && (
              <div className="mb-4">
                <p className="text-[10px] tracking-[0.2em] uppercase font-body font-semibold mb-2">Color</p>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3 h-8 border text-[11px] font-body transition-all ${
                        selectedColor === c
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-auto flex gap-2 pt-4">
              <button
                onClick={handleAdd}
                disabled={!selectedSize || !product.in_stock}
                className="flex-1 h-11 bg-foreground text-background text-[11px] font-body font-semibold tracking-[0.15em] uppercase flex items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={14} />
                {added ? "Added ✓" : "Add to Cart"}
              </button>
              <button
                onClick={() => toggleFavorite(product)}
                className={`w-11 h-11 border flex items-center justify-center transition-all ${
                  isFav ? "border-accent text-accent" : "border-border text-muted-foreground hover:text-accent hover:border-accent"
                }`}
              >
                <Heart size={16} strokeWidth={1.5} className={isFav ? "fill-accent" : ""} />
              </button>
            </div>

            <button
              onClick={() => { onClose(); navigate(`/product/${product.id}`); }}
              className="mt-3 text-[10px] tracking-[0.15em] uppercase font-body font-medium text-muted-foreground hover:text-accent transition-colors text-center"
            >
              View Full Details →
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProductCard = ({ product, flashSale }: { product: Product; flashSale?: FlashSaleData }) => {
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFav = useFavoritesStore((s) => s.isFavorite)(product.id);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const stockQty = (product as any).stock_quantity ?? 10;
  const isOutOfStock = !product.in_stock || stockQty <= 0;
  const isLowStock = stockQty > 0 && stockQty <= 3;
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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="group"
      >
        <Link to={`/product/${product.id}`} className="block">
          <div className={`relative aspect-[3/4] overflow-hidden bg-secondary mb-3 ${isOutOfStock ? 'opacity-70' : ''}`}>
            <img
              src={image}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale' : ''}`}
              loading="lazy"
            />
            {isOutOfStock && (
              <div className="absolute inset-0 bg-background/60 z-[5] flex items-center justify-center">
                <div className="text-center">
                  <span className="bg-foreground text-background text-[10px] font-body font-bold tracking-[0.2em] uppercase px-3 py-1.5 block">
                    Out of Stock
                  </span>
                  <span className="text-[9px] text-muted-foreground font-body mt-1.5 block">Stock in Soon</span>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-500" />

            {/* Quick View button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuickViewOpen(true); }}
                className="glass px-4 py-2.5 text-primary-foreground text-[10px] font-body font-semibold tracking-[0.2em] uppercase flex items-center gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 cursor-pointer hover:bg-foreground/20"
              >
                <Eye size={14} />
                Quick View
              </button>
            </div>

            <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent transition-all duration-500 group-hover:w-full" />

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
              {isLowStock && !isOutOfStock && (
                <span className="bg-destructive text-destructive-foreground text-[9px] font-body font-semibold tracking-[0.1em] uppercase px-2.5 py-1">
                  Only {stockQty} left
                </span>
              )}
            </div>
            {hasDiscount && (
              <span className="absolute top-11 right-2.5 bg-accent text-accent-foreground text-[9px] font-body font-semibold tracking-[0.2em] uppercase px-2.5 py-1">
                -{discountPercent}%
              </span>
            )}
          </div>
          <div className={`space-y-1 ${isOutOfStock ? 'opacity-60' : ''}`}>
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

      <QuickViewModal
        open={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
        product={product}
        flashSale={flashSale}
      />
    </>
  );
};

export default ProductCard;
