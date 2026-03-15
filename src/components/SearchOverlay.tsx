import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Ruler, Banknote, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { categoryImages, type Category, type Size } from "@/data/products";
import type { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;
const allSizes: Size[] = ["S", "M", "L", "XL", "XXL"];

const SearchOverlay = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: products = [] } = useQuery({
    queryKey: ["search-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("in_stock", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedSize(null);
      setPriceRange([0, 5000]);
      setShowFilters(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  const results = useMemo(() => {
    if (!query.trim() && !selectedSize && priceRange[0] === 0 && priceRange[1] === 5000) return [];
    let filtered = [...products];
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.sub_category.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }
    if (selectedSize) filtered = filtered.filter((p) => p.sizes.includes(selectedSize));
    filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    return filtered.slice(0, 8);
  }, [products, query, selectedSize, priceRange]);

  const trending = useMemo(() => products.filter((p) => p.trending).slice(0, 4), [products]);

  const handleSelect = (product: Product) => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  const handleSearchAll = () => {
    onClose();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    navigate(`/products?${params.toString()}`);
  };

  const hasActiveFilters = selectedSize || priceRange[0] > 0 || priceRange[1] < 5000;
  const showResults = query.trim() || hasActiveFilters;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-0 left-0 right-0 z-[61] bg-background border-b border-border shadow-2xl max-h-[85vh] overflow-auto"
          >
            <div className="container py-6">
              {/* Search input */}
              <div className="flex items-center gap-3 mb-4">
                <Search size={20} className="text-muted-foreground shrink-0" strokeWidth={1.5} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchAll()}
                  placeholder="Search products, categories..."
                  className="flex-1 bg-transparent text-lg font-body outline-none placeholder:text-muted-foreground/50"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2 rounded-sm transition-colors text-[10px] font-body font-medium tracking-[0.15em] uppercase flex items-center gap-1.5 border ${
                      showFilters || hasActiveFilters
                        ? "border-accent text-accent bg-accent/5"
                        : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
                    }`}
                  >
                    <Ruler size={13} strokeWidth={1.5} />
                    Filter
                    {hasActiveFilters && (
                      <span className="bg-accent text-accent-foreground text-[8px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                        {(selectedSize ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 5000 ? 1 : 0)}
                      </span>
                    )}
                  </button>
                  <button onClick={onClose} className="p-2 hover:bg-secondary rounded-sm transition-colors">
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Filters panel */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-6 py-4 border-t border-b border-border/50 mb-4">
                      {/* Size filter */}
                      <div>
                        <p className="text-[9px] tracking-[0.2em] uppercase font-body font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Ruler size={11} /> Size
                        </p>
                        <div className="flex gap-1.5">
                          {allSizes.map((s) => (
                            <button
                              key={s}
                              onClick={() => setSelectedSize(selectedSize === s ? null : s)}
                              className={`w-9 h-9 text-[11px] font-body font-medium border transition-all ${
                                selectedSize === s
                                  ? "border-accent bg-accent text-accent-foreground"
                                  : "border-border hover:border-foreground/40"
                              }`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Price filter */}
                      <div>
                        <p className="text-[9px] tracking-[0.2em] uppercase font-body font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                          <Banknote size={11} /> Price Range
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                            className="w-20 border border-border px-2.5 py-1.5 bg-background text-sm font-body focus:outline-none focus:border-accent transition-colors"
                            placeholder="Min"
                            min={0}
                          />
                          <span className="text-muted-foreground text-xs">—</span>
                          <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                            className="w-20 border border-border px-2.5 py-1.5 bg-background text-sm font-body focus:outline-none focus:border-accent transition-colors"
                            placeholder="Max"
                            min={0}
                          />
                        </div>
                      </div>

                      {hasActiveFilters && (
                        <div className="flex items-end">
                          <button
                            onClick={() => { setSelectedSize(null); setPriceRange([0, 5000]); }}
                            className="text-[10px] font-body text-accent tracking-[0.1em] uppercase hover:underline underline-offset-4"
                          >
                            Clear Filters
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results */}
              {showResults ? (
                <div>
                  <p className="text-[10px] tracking-[0.15em] uppercase font-body text-muted-foreground mb-3">
                    {results.length} result{results.length !== 1 ? "s" : ""} found
                  </p>
                  {results.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {results.map((p) => {
                        const img = p.image_url && p.image_url !== "/placeholder.svg"
                          ? p.image_url
                          : categoryImages[p.category as Category] || "/placeholder.svg";
                        return (
                          <button
                            key={p.id}
                            onClick={() => handleSelect(p)}
                            className="flex gap-3 p-2.5 border border-border/50 hover:border-accent/40 hover:bg-secondary/30 transition-all text-left group"
                          >
                            <img src={img} alt={p.name} className="w-14 h-14 object-cover bg-secondary shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] text-muted-foreground tracking-[0.15em] uppercase font-body truncate">
                                {p.sub_category}
                              </p>
                              <p className="text-sm font-display font-bold truncate group-hover:text-accent transition-colors">
                                {p.name}
                              </p>
                              <p className="text-sm font-body font-bold mt-0.5">৳{p.price.toLocaleString()}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground font-body text-sm py-8">
                      No products match your search. Try different keywords or filters.
                    </p>
                  )}
                </div>
              ) : (
                /* Trending suggestions when no search */
                trending.length > 0 && (
                  <div>
                    <p className="text-[10px] tracking-[0.15em] uppercase font-body text-muted-foreground mb-3 flex items-center gap-1.5">
                      <TrendingUp size={12} /> Trending Now
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {trending.map((p) => {
                        const img = p.image_url && p.image_url !== "/placeholder.svg"
                          ? p.image_url
                          : categoryImages[p.category as Category] || "/placeholder.svg";
                        return (
                          <button
                            key={p.id}
                            onClick={() => handleSelect(p)}
                            className="flex gap-3 p-2.5 border border-border/50 hover:border-accent/40 hover:bg-secondary/30 transition-all text-left group"
                          >
                            <img src={img} alt={p.name} className="w-14 h-14 object-cover bg-secondary shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-display font-bold truncate group-hover:text-accent transition-colors">
                                {p.name}
                              </p>
                              <p className="text-sm font-body font-bold mt-0.5">৳{p.price.toLocaleString()}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
