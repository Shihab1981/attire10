import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categoryImages, type Category, type Size } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SizeGuide from "@/components/SizeGuide";
import ProductCard from "@/components/ProductCard";
import { ShoppingBag, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const presetColorNames: Record<string, string> = {
  "#000000": "Black", "#FFFFFF": "White", "#1B2A4A": "Navy", "#6B7280": "Grey",
  "#556B2F": "Olive", "#800000": "Maroon", "#D4C5A9": "Beige", "#8B4513": "Brown",
  "#87CEEB": "Sky Blue", "#DC2626": "Red", "#0D9488": "Teal", "#FFFDD0": "Cream",
};

const ProductDetail = () => {
  const { id } = useParams();
  const addItem = useCartStore((s) => s.addItem);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);

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
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground font-body text-sm">Loading...</p>
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

  const allImages = [
    mainImage,
    ...((product as any).images ?? []),
  ];
  const colors: string[] = (product as any).colors ?? [];

  const handleAddToCart = () => {
    if (!selectedSize) { toast.error("Please select a size"); return; }
    addItem(product, selectedSize);
    toast.success(`${product.name} added to cart`);
  };

  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.original_price! - product.price) / product.original_price!) * 100)
    : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border/60">
          <div className="container py-4">
            <Link to="/products" className="inline-flex items-center gap-2 text-[11px] font-body font-medium tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={14} strokeWidth={1.5} />
              Back to Collection
            </Link>
          </div>
        </div>

        <div className="container py-10 md:py-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-20">
            {/* Image Gallery */}
            <div className="flex gap-3">
              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="hidden md:flex flex-col gap-2 w-16 shrink-0">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveImageIndex(i); setImageLoaded(false); }}
                      className={`aspect-square bg-secondary overflow-hidden border-2 transition-all ${
                        activeImageIndex === i ? "border-foreground" : "border-transparent hover:border-border"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              {/* Main Image */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="relative flex-1 aspect-[3/4] bg-secondary overflow-hidden"
              >
                <img
                  key={activeImageIndex}
                  src={allImages[activeImageIndex]}
                  alt={product.name}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                />
                {hasDiscount && (
                  <span className="absolute top-4 right-4 bg-accent text-accent-foreground text-[10px] font-body font-semibold tracking-[0.15em] uppercase px-3 py-1.5">
                    -{discountPercent}%
                  </span>
                )}
                {product.new_arrival && (
                  <span className="absolute top-4 left-4 bg-foreground text-background text-[10px] font-body font-semibold tracking-[0.15em] uppercase px-3 py-1.5">
                    New
                  </span>
                )}
                {/* Mobile image dots */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setActiveImageIndex(i); setImageLoaded(false); }}
                        className={`w-2 h-2 rounded-full transition-all ${
                          activeImageIndex === i ? "bg-foreground" : "bg-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="flex flex-col"
            >
              <p className="text-[10px] text-muted-foreground tracking-[0.25em] uppercase font-body mb-4">
                {product.category.replace("-", " ")} — {product.sub_category}
              </p>

              <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight mb-6">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3 mb-8">
                <span className="font-body text-2xl font-semibold tracking-wide">
                  ৳{product.price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-muted-foreground line-through text-base font-body">
                    ৳{product.original_price!.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="border-t border-border/60 pt-6 mb-8">
                <p className="text-muted-foreground text-sm font-body font-light leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Fabric info */}
              <div className="flex items-center gap-3 mb-8 bg-secondary/50 px-4 py-3">
                <span className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                  Fabric
                </span>
                <span className="text-sm font-body text-foreground">{product.fabric}</span>
              </div>

              {/* Color Selection */}
              {colors.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-4">
                    Color {selectedColor && `— ${presetColorNames[selectedColor] || selectedColor}`}
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedColor(selectedColor === c ? null : c)}
                        className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === c
                            ? "border-foreground scale-110"
                            : "border-border hover:border-muted-foreground"
                        }`}
                        style={{ backgroundColor: c }}
                        title={presetColorNames[c] || c}
                      >
                        {selectedColor === c && (
                          <Check
                            size={14}
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
                  <h3 className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground">
                    Select Size
                  </h3>
                  <SizeGuide />
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s as Size)}
                      className={`relative w-14 h-14 text-xs font-body font-medium border transition-all duration-200 ${
                        selectedSize === s
                          ? "border-foreground bg-foreground text-background"
                          : "border-border hover:border-foreground"
                      }`}
                    >
                      {s}
                      {selectedSize === s && (
                        <Check size={10} className="absolute top-1 right-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-3 bg-foreground text-background py-4 text-[11px] font-body font-semibold tracking-[0.2em] uppercase hover:bg-accent hover:text-accent-foreground transition-all duration-300 mt-auto"
              >
                <ShoppingBag size={16} strokeWidth={1.5} />
                Add to Cart
              </button>

              {/* Trust indicators */}
              <div className="grid grid-cols-2 gap-4 mt-6 text-center">
                <div className="py-3 border border-border/60">
                  <p className="text-[10px] font-body font-medium tracking-[0.15em] uppercase text-muted-foreground">
                    Free Shipping
                  </p>
                </div>
                <div className="py-3 border border-border/60">
                  <p className="text-[10px] font-body font-medium tracking-[0.15em] uppercase text-muted-foreground">
                    7-Day Returns
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <section className="mt-20 md:mt-32 border-t border-border/60 pt-14 md:pt-20">
              <div className="text-center mb-14">
                <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-muted-foreground font-body mb-3">
                  Complete the Look
                </p>
                <h2 className="font-display text-2xl md:text-4xl font-bold">
                  You May Also Like
                </h2>
              </div>
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
