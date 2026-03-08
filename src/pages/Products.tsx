import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categories, type Category, type Size } from "@/data/products";
import { SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const allSizes: Size[] = ["S", "M", "L", "XL", "XXL"];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") as Category | null;
  const filterParam = searchParams.get("filter");

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(categoryParam);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);

  // Sync category state with URL params when navigating via header links
  React.useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { data: allProducts = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("in_stock", true).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const filtered = useMemo(() => {
    let result = allProducts;
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    if (selectedSize) result = result.filter((p) => p.sizes.includes(selectedSize));
    if (filterParam === "new") result = result.filter((p) => p.new_arrival);
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    return result;
  }, [allProducts, selectedCategory, selectedSize, priceRange, filterParam]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedSize(null);
    setPriceRange([0, 5000]);
    setSearchParams({});
  };

  const handleCategoryClick = (slug: Category | null) => {
    setSelectedCategory(slug);
    if (slug) setSearchParams({ category: slug });
    else setSearchParams({});
  };

  const activeFilterCount = [selectedCategory, selectedSize, priceRange[0] > 0 || priceRange[1] < 5000].filter(Boolean).length;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-border/60 bg-secondary/30">
          <div className="container py-12 md:py-20 text-center">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-muted-foreground font-body mb-3"
            >
              {selectedCategory ? "Category" : filterParam === "new" ? "Latest" : "Our Collection"}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl md:text-5xl font-medium italic"
            >
              {selectedCategory
                ? categories.find((c) => c.slug === selectedCategory)?.name
                : filterParam === "new"
                ? "New Arrivals"
                : "All Products"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-sm font-body font-light mt-3"
            >
              {filtered.length} piece{filtered.length !== 1 ? "s" : ""} curated for you
            </motion.p>
          </div>
        </div>

        <div className="container py-10 md:py-14">
          {/* Mobile filter toggle */}
          <div className="flex items-center justify-between mb-8 md:hidden">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2.5 text-[11px] font-body font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            >
              <SlidersHorizontal size={14} strokeWidth={1.5} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-foreground text-background text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          <div className="flex gap-12">
            {/* Sidebar Filters */}
            <AnimatePresence>
              <aside
                className={`${
                  filtersOpen
                    ? "fixed inset-0 z-40 bg-background p-8 overflow-auto"
                    : "hidden"
                } md:block md:static md:w-56 shrink-0`}
              >
                <div className="flex items-center justify-between md:hidden mb-8">
                  <h2 className="font-display text-xl font-medium italic">Filters</h2>
                  <button onClick={() => setFiltersOpen(false)}>
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="space-y-10">
                  {/* Category */}
                  <div>
                    <h3 className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-4">
                      Category
                    </h3>
                    <div className="space-y-2.5">
                      <button
                        onClick={() => handleCategoryClick(null)}
                        className={`block text-sm font-body transition-colors ${
                          !selectedCategory
                            ? "text-foreground font-medium"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        All
                      </button>
                      {categories.map((c) => (
                        <button
                          key={c.slug}
                          onClick={() => handleCategoryClick(c.slug)}
                          className={`block text-sm font-body transition-colors ${
                            selectedCategory === c.slug
                              ? "text-foreground font-medium"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Size */}
                  <div>
                    <h3 className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-4">
                      Size
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {allSizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(selectedSize === s ? null : s)}
                          className={`w-10 h-10 text-xs font-body font-medium border transition-all duration-200 ${
                            selectedSize === s
                              ? "border-foreground bg-foreground text-background"
                              : "border-border hover:border-foreground"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <h3 className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-4">
                      Price Range
                    </h3>
                    <div className="flex gap-3 items-center text-sm">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                        className="w-20 border border-border px-3 py-2 bg-background text-sm font-body focus:outline-none focus:border-foreground transition-colors"
                        min={0}
                      />
                      <span className="text-muted-foreground text-xs">to</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                        className="w-20 border border-border px-3 py-2 bg-background text-sm font-body focus:outline-none focus:border-foreground transition-colors"
                        min={0}
                      />
                    </div>
                  </div>

                  {/* Clear */}
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="text-[11px] text-accent font-body font-medium tracking-[0.1em] uppercase hover:underline underline-offset-4"
                    >
                      Clear all filters
                    </button>
                  )}

                  <button
                    onClick={() => setFiltersOpen(false)}
                    className="md:hidden w-full bg-foreground text-background py-3.5 text-[11px] font-body font-semibold tracking-[0.15em] uppercase mt-4"
                  >
                    Show {filtered.length} results
                  </button>
                </div>
              </aside>
            </AnimatePresence>

            {/* Product Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="text-center py-24">
                  <p className="text-muted-foreground font-body text-sm">Loading products...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-24">
                  <p className="font-display text-xl italic text-muted-foreground mb-3">No products found</p>
                  <button
                    onClick={clearFilters}
                    className="text-accent text-[11px] font-body font-medium tracking-[0.1em] uppercase hover:underline underline-offset-4"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
                >
                  {filtered.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
