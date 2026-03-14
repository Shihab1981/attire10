import { useParams, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categoryImages, type Category, type Size } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useRecentlyViewedStore } from "@/store/recentlyViewedStore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SizeGuide from "@/components/SizeGuide";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import RecentlyViewed from "@/components/RecentlyViewed";
import BackToTop from "@/components/BackToTop";
import { ShoppingBag, ArrowLeft, Check, Truck, Shield, RefreshCw, ChevronRight, ChevronLeft, Minus, Plus, Heart, ZoomIn, X, Share2, MessageCircle, Facebook, Link as LinkIcon, Copy } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const presetColorNames: Record<string, string> = {
  "#000000": "Black", "#FFFFFF": "White", "#1B2A4A": "Navy", "#6B7280": "Grey",
  "#556B2F": "Olive", "#800000": "Maroon", "#D4C5A9": "Beige", "#8B4513": "Brown",
  "#87CEEB": "Sky Blue", "#DC2626": "Red", "#0D9488": "Teal", "#FFFDD0": "Cream",
};

const ProductDetail = () => {
  const { id } = useParams();
  const addItem = useCartStore((s) => s.addItem);
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const isFavorite = useFavoritesStore((s) => s.isFavorite);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [shareOpen, setShareOpen] = useState(false);
  const imgContainerRef = useRef<HTMLDivElement>(null);
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.addProduct);

  // Track recently viewed
  useEffect(() => {
    if (id) addRecentlyViewed(id);
  }, [id]);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: related = [] } = useQuery({
    queryKey: ["related-products", product?.category],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", product!.category)
        .neq("id", product!.id)
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!product,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          {/* Breadcrumb skeleton */}
          <div className="border-b border-border/40">
            <div className="container py-4 flex items-center gap-2">
              <div className="h-2.5 w-10 bg-muted-foreground/15 rounded animate-pulse" />
              <div className="h-2.5 w-2 bg-muted-foreground/10 rounded animate-pulse" />
              <div className="h-2.5 w-16 bg-muted-foreground/15 rounded animate-pulse" />
              <div className="h-2.5 w-2 bg-muted-foreground/10 rounded animate-pulse" />
              <div className="h-2.5 w-24 bg-muted-foreground/15 rounded animate-pulse" />
            </div>
          </div>
          <div className="container py-10 md:py-16">
            <div className="grid md:grid-cols-2 gap-8 md:gap-16 lg:gap-20">
              {/* Image skeleton */}
              <div className="flex gap-3">
                <div className="hidden md:flex flex-col gap-2.5 w-[72px] shrink-0">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="aspect-square bg-secondary animate-pulse rounded-sm" />
                  ))}
                </div>
                <div className="flex-1 aspect-[3/4] bg-secondary animate-pulse rounded-sm" />
              </div>
              {/* Details skeleton */}
              <div className="flex flex-col gap-5">
                <div className="h-2.5 w-24 bg-muted-foreground/15 rounded animate-pulse" />
                <div className="space-y-2">
                  <div className="h-9 w-3/4 bg-muted-foreground/15 rounded animate-pulse" />
                  <div className="h-9 w-1/2 bg-muted-foreground/15 rounded animate-pulse" />
                </div>
                <div className="h-8 w-28 bg-muted-foreground/15 rounded animate-pulse" />
                <div className="h-px w-full bg-border/40" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-muted-foreground/10 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-muted-foreground/10 rounded animate-pulse" />
                  <div className="h-3 w-4/6 bg-muted-foreground/10 rounded animate-pulse" />
                </div>
                <div className="h-12 w-full bg-secondary animate-pulse rounded-sm" />
                {/* Color swatches skeleton */}
                <div className="flex gap-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-11 h-11 rounded-full bg-muted-foreground/15 animate-pulse" />
                  ))}
                </div>
                {/* Size buttons skeleton */}
                <div className="flex gap-2.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-14 h-14 bg-secondary animate-pulse rounded-sm" />
                  ))}
                </div>
                {/* Add to cart skeleton */}
                <div className="flex gap-3">
                  <div className="w-36 h-14 bg-secondary animate-pulse rounded-sm" />
                  <div className="flex-1 h-14 bg-muted-foreground/15 animate-pulse rounded-sm" />
                </div>
                {/* Trust badges skeleton */}
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-secondary animate-pulse rounded-sm" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold mb-3">Product Not Found</h1>
            <Link to="/products" className="text-accent text-[11px] font-body font-medium tracking-[0.1em] uppercase hover:underline underline-offset-4">
              Back to Products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const mainImage = product.image_url && product.image_url !== "/placeholder.svg"
    ? product.image_url
    : categoryImages[product.category as Category] || "/placeholder.svg";

  const allImages = [mainImage, ...((product as any).images ?? [])];
  const colors: string[] = (product as any).colors ?? [];
  const colorImages: Record<string, string> = (product as any).color_images ?? {};

  // When a color with a specific image is selected, show it as first image
  const displayImages = selectedColor && colorImages[selectedColor]
    ? [colorImages[selectedColor], ...allImages]
    : allImages;

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error("Please select a size"); return; }
    if (colors.length > 0 && !selectedColor) { toast.error("Please select a color"); return; }
    for (let i = 0; i < quantity; i++) addItem(product, selectedSize, selectedColor || undefined);
    setAddedToCart(true);
    toast.success(`${product.name} added to cart`);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;
  const stockQty = (product as any).stock_quantity ?? 10;
  const isOutOfStock = !product.in_stock || stockQty <= 0;
  const isLowStock = stockQty > 0 && stockQty <= 3;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border/40">
          <div className="container py-4 flex items-center gap-2 text-[11px] font-body tracking-[0.1em] uppercase text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
            <ChevronRight size={12} />
            <Link to={`/products?category=${product.category}`} className="hover:text-foreground transition-colors">
              {product.category.replace("-", " ")}
            </Link>
            <ChevronRight size={12} />
            <span className="text-foreground font-medium truncate max-w-[150px]">{product.name}</span>
          </div>
        </div>

        <div className="container py-10 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 lg:gap-20">
            {/* Image Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="flex gap-3"
            >
              {/* Thumbnails */}
              {displayImages.length > 1 && (
                <div className="hidden md:flex flex-col gap-2.5 w-[72px] shrink-0">
                  {displayImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveImageIndex(i); setImageLoaded(false); }}
                      className={`aspect-square bg-secondary overflow-hidden border-2 transition-all duration-300 ${
                        activeImageIndex === i
                          ? "border-accent shadow-sm"
                          : "border-transparent hover:border-border opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {/* Main Image */}
              <div
                ref={imgContainerRef}
                className="relative flex-1 aspect-[3/4] bg-secondary overflow-hidden group cursor-zoom-in"
                onClick={() => setZoomOpen(true)}
                onMouseMove={(e) => {
                  if (!imgContainerRef.current) return;
                  const rect = imgContainerRef.current.getBoundingClientRect();
                  setZoomPos({
                    x: ((e.clientX - rect.left) / rect.width) * 100,
                    y: ((e.clientY - rect.top) / rect.height) * 100,
                  });
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={displayImages[activeImageIndex] || mainImage}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover transition-transform duration-500 hidden md:block"
                    style={{ transformOrigin: `${zoomPos.x}% ${zoomPos.y}%` }}
                    onLoad={() => setImageLoaded(true)}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.8)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />
                </AnimatePresence>
                {/* Mobile image (no hover zoom) */}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={`mobile-${activeImageIndex}`}
                    src={displayImages[activeImageIndex] || mainImage}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover md:hidden"
                    onLoad={() => setImageLoaded(true)}
                  />
                </AnimatePresence>

                {/* Zoom icon hint */}
                <div className="absolute bottom-4 right-4 w-8 h-8 bg-background/70 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <ZoomIn size={14} className="text-muted-foreground" />
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {isOutOfStock && (
                    <span className="bg-foreground text-background text-[9px] font-body font-bold tracking-[0.2em] uppercase px-3 py-1.5">
                      Out of Stock
                    </span>
                  )}
                  {product.new_arrival && !isOutOfStock && (
                    <span className="bg-foreground text-background text-[9px] font-body font-bold tracking-[0.2em] uppercase px-3 py-1.5">
                      New
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="bg-accent text-accent-foreground text-[9px] font-body font-bold tracking-[0.2em] uppercase px-3 py-1.5">
                      -{discountPercent}% Off
                    </span>
                  )}
                  {isLowStock && !isOutOfStock && (
                    <span className="bg-destructive text-destructive-foreground text-[9px] font-body font-bold tracking-[0.1em] uppercase px-3 py-1.5">
                      Only {stockQty} left
                    </span>
                  )}
                </div>

                {/* Wishlist */}
                <button
                  onClick={(e) => { e.stopPropagation(); product && toggleFavorite(product); }}
                  className="absolute top-4 right-4 w-10 h-10 bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors group/heart"
                >
                  <Heart
                    size={18}
                    strokeWidth={1.5}
                    className={`transition-colors ${
                      isFavorite(product.id)
                        ? "fill-accent text-accent"
                        : "text-muted-foreground group-hover/heart:text-accent"
                    }`}
                  />
                </button>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />

                {/* Mobile prev/next buttons */}
                {displayImages.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
                        setImageLoaded(false);
                      }}
                      className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-full shadow-md active:scale-95 transition-transform z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={18} className="text-foreground" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev + 1) % displayImages.length);
                        setImageLoaded(false);
                      }}
                      className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-full shadow-md active:scale-95 transition-transform z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight size={18} className="text-foreground" />
                    </button>
                  </>
                )}

                {/* Mobile dots */}
                {displayImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
                    {displayImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex(i); setImageLoaded(false); }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          activeImageIndex === i ? "bg-accent w-5" : "bg-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Zoom Modal */}
            <AnimatePresence>
              {zoomOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center"
                  onClick={() => setZoomOpen(false)}
                >
                  <button
                    onClick={() => setZoomOpen(false)}
                    className="absolute top-5 right-5 w-10 h-10 bg-secondary flex items-center justify-center hover:bg-muted transition-colors z-10"
                  >
                    <X size={18} />
                  </button>
                  {/* Prev/Next in zoom */}
                  {displayImages.length > 1 && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-secondary flex items-center justify-center hover:bg-muted transition-colors z-10"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setActiveImageIndex((prev) => (prev + 1) % displayImages.length); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-secondary flex items-center justify-center hover:bg-muted transition-colors z-10"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                  <motion.img
                    key={`zoom-${activeImageIndex}`}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    src={displayImages[activeImageIndex] || mainImage}
                    alt={product.name}
                    className="max-w-[90vw] max-h-[90vh] object-contain cursor-zoom-out"
                    onClick={() => setZoomOpen(false)}
                  />
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-body text-muted-foreground tracking-[0.15em] uppercase">
                    {activeImageIndex + 1} / {displayImages.length}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Product Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="flex flex-col"
            >
              {/* Category */}
              <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase font-body mb-3">
                {product.category.replace("-", " ")} — {product.sub_category}
              </p>

              {/* Name */}
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight mb-5">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-4">
                <span className="font-display text-3xl font-extrabold tracking-tight">
                  ৳{product.price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-muted-foreground line-through text-lg font-body">
                      ৳{product.original_price!.toLocaleString()}
                    </span>
                    <span className="bg-accent/10 text-accent text-xs font-body font-bold px-2.5 py-1">
                      Save ৳{(product.original_price! - product.price).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {/* Stock Status */}
              {isOutOfStock && (
                <div className="flex items-center gap-3 mb-4 bg-destructive/10 border border-destructive/20 px-4 py-3">
                  <span className="text-destructive text-sm font-body font-bold">Out of Stock</span>
                  <span className="text-muted-foreground text-xs font-body">— Stock in Soon</span>
                </div>
              )}
              {isLowStock && !isOutOfStock && (
                <div className="flex items-center gap-2 mb-4 bg-accent/10 border border-accent/20 px-4 py-3">
                  <span className="text-accent text-sm font-body font-bold">Hurry! Only {stockQty} left</span>
                </div>
              )}

              {/* Description */}
              <div className="section-divider mb-6" />
              <p className="text-muted-foreground text-sm font-body font-light leading-[1.8] mb-6">
                {product.description}
              </p>

              {/* Fabric */}
              <div className="flex items-center gap-3 mb-8 bg-secondary/50 border border-border/50 px-5 py-3.5">
                <span className="text-[10px] font-body font-bold tracking-[0.2em] uppercase text-muted-foreground">Fabric</span>
                <div className="w-px h-4 bg-border" />
                <span className="text-sm font-body font-medium">{product.fabric}</span>
              </div>

              {/* Color Selection */}
              {colors.length > 0 && (
                <div className="mb-7">
                  <h3 className="text-[10px] font-body font-bold tracking-[0.25em] uppercase text-muted-foreground mb-4">
                    Color {selectedColor && <span className="text-foreground ml-1">— {presetColorNames[selectedColor] || selectedColor}</span>}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => { setSelectedColor(selectedColor === c ? null : c); setActiveImageIndex(0); }}
                        className={`relative w-11 h-11 rounded-full transition-all duration-200 ${
                          selectedColor === c
                            ? "ring-2 ring-accent ring-offset-2 ring-offset-background scale-110"
                            : "border-2 border-border hover:border-muted-foreground hover:scale-105"
                        }`}
                        style={{ backgroundColor: c }}
                        title={presetColorNames[c] || c}
                      >
                        {selectedColor === c && (
                          <Check
                            size={16}
                            strokeWidth={2.5}
                            className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${
                              ["#FFFFFF", "#FFFDD0", "#D4C5A9", "#87CEEB"].includes(c) ? "text-foreground" : "text-background"
                            }`}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[10px] font-body font-bold tracking-[0.25em] uppercase text-muted-foreground">
                    Select Size {selectedSize && <span className="text-accent ml-1">— {selectedSize}</span>}
                  </h3>
                  <SizeGuide />
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s as Size)}
                      className={`relative min-w-[56px] h-14 px-4 text-xs font-body font-semibold border transition-all duration-200 active:scale-95 ${
                        selectedSize === s
                          ? "border-accent bg-accent text-accent-foreground shadow-md shadow-accent/20"
                          : "border-border hover:border-foreground hover:bg-secondary/40"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity + Add to Cart */}
              <div className="flex gap-3 mb-4">
                {/* Quantity */}
                <div className="flex items-center border border-border shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-14 flex items-center justify-center hover:bg-secondary transition-colors active:scale-95"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center text-sm font-display font-bold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-14 flex items-center justify-center hover:bg-secondary transition-colors active:scale-95"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={addedToCart || isOutOfStock}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 text-[11px] font-body font-bold tracking-[0.2em] uppercase transition-all duration-300 active:scale-[0.98] ${
                    isOutOfStock
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : addedToCart
                        ? "bg-accent text-accent-foreground"
                        : "shimmer-btn text-accent-foreground hover:shadow-lg hover:shadow-accent/20"
                  }`}
                >
                  {isOutOfStock ? (
                    "Out of Stock"
                  ) : addedToCart ? (
                    <>
                      <Check size={16} />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={16} strokeWidth={1.5} />
                      Add to Cart — ৳{(product.price * quantity).toLocaleString()}
                    </>
                  )}
                </button>
              </div>

              {/* WhatsApp Order */}
              <a
                href={`https://wa.me/8801833723089?text=${encodeURIComponent(`Hi! I want to order:\n\n🛍 *${product.name}*\n💰 Price: ৳${product.price.toLocaleString()}${selectedSize ? `\n📏 Size: ${selectedSize}` : ""}${selectedColor ? `\n🎨 Color: ${presetColorNames[selectedColor] || selectedColor}` : ""}\n🔢 Qty: ${quantity}\n\n🔗 ${window.location.href}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 py-3.5 bg-[#25D366] text-[#fff] text-[11px] font-body font-bold tracking-[0.15em] uppercase hover:bg-[#1DA851] transition-colors active:scale-[0.98] mb-2"
              >
                <MessageCircle size={16} strokeWidth={2} />
                Order via WhatsApp
              </a>

              {/* Share */}
              <div className="relative mb-6">
                <button
                  onClick={() => setShareOpen(!shareOpen)}
                  className="flex items-center gap-2 text-[10px] font-body font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  <Share2 size={14} strokeWidth={1.5} />
                  Share this product
                </button>
                <AnimatePresence>
                  {shareOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex gap-2 mt-2"
                    >
                      <a
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 border border-border flex items-center justify-center hover:bg-secondary hover:border-accent/30 transition-all"
                        title="Share on Facebook"
                      >
                        <Facebook size={16} className="text-muted-foreground" />
                      </a>
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(`${product.name} - ৳${product.price.toLocaleString()} ${window.location.href}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 border border-border flex items-center justify-center hover:bg-secondary hover:border-accent/30 transition-all"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle size={16} className="text-muted-foreground" />
                      </a>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success("Link copied!");
                          setShareOpen(false);
                        }}
                        className="w-10 h-10 border border-border flex items-center justify-center hover:bg-secondary hover:border-accent/30 transition-all"
                        title="Copy link"
                      >
                        <Copy size={16} className="text-muted-foreground" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Trust indicators */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Truck, label: "Free Shipping", sub: "Over ৳2,000" },
                  { icon: RefreshCw, label: "7-Day Returns", sub: "Easy process" },
                  { icon: Shield, label: "100% Authentic", sub: "Guaranteed" },
                ].map((t) => (
                  <div key={t.label} className="flex flex-col items-center text-center py-4 border border-border/50 hover:border-accent/30 hover:bg-accent/5 transition-all duration-300">
                    <t.icon size={18} strokeWidth={1.5} className="text-accent mb-2" />
                    <p className="text-[10px] font-body font-bold tracking-wider uppercase leading-none">{t.label}</p>
                    <p className="text-[9px] text-muted-foreground font-body mt-1">{t.sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Reviews */}
          <ProductReviews productId={product.id} />

          {/* Related Products */}
          {related.length > 0 && (
            <section className="mt-20 md:mt-32 pt-14 md:pt-20">
              <div className="section-divider mb-14" />
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-14"
              >
                <div className="h-[2px] w-10 bg-accent mx-auto mb-6" />
                <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-muted-foreground font-body mb-3">
                  Complete the Look
                </p>
                <h2 className="font-display text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
                  You May Also Like
                </h2>
              </motion.div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )}

          {/* Recently Viewed */}
          <RecentlyViewed excludeId={product.id} />
        </div>

        {/* Sticky Mobile Add to Cart */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border/60 px-4 py-3 flex items-center gap-3 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-body font-bold truncate">{product.name}</p>
            <p className="text-sm font-display font-extrabold text-accent">৳{product.price.toLocaleString()}</p>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={addedToCart || isOutOfStock}
            className={`shrink-0 flex items-center gap-2 px-5 py-3 text-[10px] font-body font-bold tracking-[0.15em] uppercase transition-all active:scale-95 ${
              isOutOfStock
                ? "bg-muted text-muted-foreground"
                : addedToCart
                  ? "bg-accent text-accent-foreground"
                  : "shimmer-btn text-accent-foreground"
            }`}
          >
            {isOutOfStock ? "Sold Out" : addedToCart ? <><Check size={14} /> Added</> : <><ShoppingBag size={14} /> Add to Cart</>}
          </button>
        </div>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default ProductDetail;
