import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categoryImages, type Category, type Size } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SizeGuide from "@/components/SizeGuide";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";
import { ShoppingBag, ArrowLeft, Check, Truck, Shield, RefreshCw, ChevronRight, Minus, Plus, Heart } from "lucide-react";
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
              <div className="relative flex-1 aspect-[3/4] bg-secondary overflow-hidden group cursor-crosshair">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={displayImages[activeImageIndex] || mainImage}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onLoad={() => setImageLoaded(true)}
                  />
                </AnimatePresence>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.new_arrival && (
                    <span className="bg-foreground text-background text-[9px] font-body font-bold tracking-[0.2em] uppercase px-3 py-1.5">
                      New
                    </span>
                  )}
                  {hasDiscount && (
                    <span className="bg-accent text-accent-foreground text-[9px] font-body font-bold tracking-[0.2em] uppercase px-3 py-1.5">
                      -{discountPercent}% Off
                    </span>
                  )}
                </div>

                {/* Wishlist */}
                <button
                  onClick={() => product && toggleFavorite(product)}
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

                {/* Mobile dots */}
                {displayImages.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
                    {displayImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setActiveImageIndex(i); setImageLoaded(false); }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          activeImageIndex === i ? "bg-accent w-5" : "bg-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

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
              <div className="flex items-baseline gap-3 mb-6">
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
                  disabled={addedToCart}
                  className={`flex-1 flex items-center justify-center gap-3 py-4 text-[11px] font-body font-bold tracking-[0.2em] uppercase transition-all duration-300 active:scale-[0.98] ${
                    addedToCart
                      ? "bg-accent text-accent-foreground"
                      : "shimmer-btn text-accent-foreground hover:shadow-lg hover:shadow-accent/20"
                  }`}
                >
                  {addedToCart ? (
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

              {/* Trust indicators */}
              <div className="grid grid-cols-3 gap-3 mt-6">
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
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
