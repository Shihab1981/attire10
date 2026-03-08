import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categories, type Category, type Size } from "@/data/products";
import { SlidersHorizontal, X, ArrowUpDown, Grid3X3, LayoutGrid, ChevronDown, Tag, Ruler, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFlashSales } from "@/hooks/useFlashSales";

const allSizes: Size[] = ["S", "M", "L", "XL", "XXL"];

type SortOption = "newest" | "price-low" | "price-high" | "name-az";
const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low → High" },
  { value: "price-high", label: "Price: High → Low" },
  { value: "name-az", label: "Name: A → Z" },
];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") as Category | null;
  const filterParam = searchParams.get("filter");

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(categoryParam);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [gridCols, setGridCols] = useState<2 | 3>(3);
  const [sortOpen, setSortOpen] = useState(false);

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
    let result = [...allProducts];
    if (selectedCategory) result = result.filter((p) => p.category === selectedCategory);
    if (selectedSize) result = result.filter((p) => p.sizes.includes(selectedSize));
    if (filterParam === "new") result = result.filter((p) => p.new_arrival);
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-az":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }
    return result;
  }, [allProducts, selectedCategory, selectedSize, priceRange, filterParam, sortBy]);

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

  const activeFilters: { label: string; onClear: () => void }[] = [];
  if (selectedCategory) {
    activeFilters.push({
      label: categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory,
      onClear: () => handleCategoryClick(null),
    });
  }
  if (selectedSize) {
    activeFilters.push({ label: `Size: ${selectedSize}`, onClear: () => setSelectedSize(null) });
  }
  if (priceRange[0] > 0 || priceRange[1] < 5000) {
    activeFilters.push({ label: `৳${priceRange[0]}–৳${priceRange[1]}`, onClear: () => setPriceRange([0, 5000]) });
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Page Header */}
        <div className="border-b border-border/60 bg-secondary/30 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="container py-14 md:py-24 text-center relative z-10">
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
              className="font-display text-3xl md:text-5xl font-bold"
            >
              {selectedCategory
                ? categories.find((c) => c.slug === selectedCategory)?.name
                : filterParam === "new"
                ? "New Arrivals"
                : "All Products"}
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-12 h-[2px] bg-accent mx-auto mt-5"
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-sm font-body font-light mt-4"
            >
              {filtered.length} piece{filtered.length !== 1 ? "s" : ""} curated for you
            </motion.p>
          </div>
        </div>

        <div className="container py-8 md:py-14">
          {/* Toolbar: Mobile filter + Sort + Grid toggle */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="md:hidden flex items-center gap-2 text-[11px] font-body font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors border border-border px-4 py-2.5"
            >
              <SlidersHorizontal size={14} strokeWidth={1.5} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-accent text-accent-foreground text-[9px] w-4 h-4 flex items-center justify-center rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Active filter chips - desktop */}
            <div className="hidden md:flex items-center gap-2 flex-1 flex-wrap">
              {activeFilters.map((f, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={f.onClear}
                  className="inline-flex items-center gap-1.5 text-[10px] font-body font-medium tracking-[0.1em] uppercase bg-secondary text-foreground px-3 py-1.5 border border-border hover:border-accent hover:text-accent transition-colors group"
                >
                  {f.label}
                  <X size={10} strokeWidth={2} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
              {activeFilters.length > 1 && (
                <button onClick={clearFilters} className="text-[10px] font-body text-accent tracking-[0.1em] uppercase hover:underline underline-offset-4 ml-1">
                  Clear All
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 text-[11px] font-body font-medium tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors border border-border px-4 py-2.5"
                >
                  <ArrowUpDown size={13} strokeWidth={1.5} />
                  <span className="hidden sm:inline">{sortOptions.find((s) => s.value === sortBy)?.label}</span>
                  <span className="sm:hidden">Sort</span>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 bg-background border border-border shadow-lg z-30 min-w-[180px]"
                    >
                      {sortOptions.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                          className={`block w-full text-left px-4 py-2.5 text-[11px] font-body tracking-[0.05em] transition-colors ${
                            sortBy === opt.value
                              ? "bg-secondary text-foreground font-semibold"
                              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Grid toggle - desktop */}
              <div className="hidden md:flex items-center border border-border">
                <button
                  onClick={() => setGridCols(2)}
                  className={`p-2.5 transition-colors ${gridCols === 2 ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                  title="2 columns"
                >
                  <LayoutGrid size={14} strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => setGridCols(3)}
                  className={`p-2.5 transition-colors ${gridCols === 3 ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
                  title="3 columns"
                >
                  <Grid3X3 size={14} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-12">
            {/* Sidebar Filters */}
            <AnimatePresence>
              {(filtersOpen || true) && (
                <aside
                  className={`${
                    filtersOpen
                      ? "fixed inset-0 z-40 bg-background p-8 overflow-auto"
                      : "hidden"
                  } md:block md:static md:w-60 shrink-0`}
                >
                  {/* Mobile header */}
                  <div className="flex items-center justify-between md:hidden mb-8">
                    <h2 className="font-display text-xl font-bold">Filters</h2>
                    <button onClick={() => setFiltersOpen(false)} className="p-1 hover:bg-secondary rounded transition-colors">
                      <X size={18} strokeWidth={1.5} />
                    </button>
                  </div>

                  <div className="space-y-8">
                    {/* Category */}
                    <div className="border border-border/60 p-5">
                      <h3 className="flex items-center gap-2 text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-4">
                        <Tag size={12} strokeWidth={1.5} />
                        Category
                      </h3>
                      <div className="space-y-1">
                        <button
                          onClick={() => handleCategoryClick(null)}
                          className={`block w-full text-left text-sm font-body transition-all px-3 py-2 ${
                            !selectedCategory
                              ? "text-accent font-medium bg-accent/5 border-l-2 border-accent"
                              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                          }`}
                        >
                          All Categories
                        </button>
                        {categories.map((c) => (
                          <button
                            key={c.slug}
                            onClick={() => handleCategoryClick(c.slug)}
                            className={`block w-full text-left text-sm font-body transition-all px-3 py-2 ${
                              selectedCategory === c.slug
                                ? "text-accent font-medium bg-accent/5 border-l-2 border-accent"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size */}
                    <div className="border border-border/60 p-5">
                      <h3 className="flex items-center gap-2 text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-4">
                        <Ruler size={12} strokeWidth={1.5} />
                        Size
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {allSizes.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSize(selectedSize === s ? null : s)}
                            className={`w-11 h-11 text-xs font-body font-medium border transition-all duration-200 ${
                              selectedSize === s
                                ? "border-accent bg-accent text-accent-foreground shadow-sm"
                                : "border-border hover:border-foreground/40 hover:bg-secondary/50"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="border border-border/60 p-5">
                      <h3 className="flex items-center gap-2 text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-muted-foreground mb-4">
                        <Banknote size={12} strokeWidth={1.5} />
                        Price Range
                      </h3>
                      <div className="space-y-3">
                        <div className="flex gap-3 items-center text-sm">
                          <div className="flex-1">
                            <label className="text-[9px] font-body text-muted-foreground tracking-wider uppercase mb-1 block">Min</label>
                            <input
                              type="number"
                              value={priceRange[0]}
                              onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                              className="w-full border border-border px-3 py-2.5 bg-background text-sm font-body focus:outline-none focus:border-accent transition-colors"
                              min={0}
                            />
                          </div>
                          <span className="text-muted-foreground text-xs mt-4">—</span>
                          <div className="flex-1">
                            <label className="text-[9px] font-body text-muted-foreground tracking-wider uppercase mb-1 block">Max</label>
                            <input
                              type="number"
                              value={priceRange[1]}
                              onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                              className="w-full border border-border px-3 py-2.5 bg-background text-sm font-body focus:outline-none focus:border-accent transition-colors"
                              min={0}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between text-[10px] font-body text-muted-foreground">
                          <span>৳{priceRange[0].toLocaleString()}</span>
                          <span>৳{priceRange[1].toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Clear */}
                    {activeFilterCount > 0 && (
                      <button
                        onClick={clearFilters}
                        className="w-full text-[11px] text-center text-accent font-body font-medium tracking-[0.1em] uppercase hover:underline underline-offset-4 py-2"
                      >
                        Clear all filters
                      </button>
                    )}

                    <button
                      onClick={() => setFiltersOpen(false)}
                      className="md:hidden w-full shimmer-btn text-accent-foreground py-3.5 text-[11px] font-body font-semibold tracking-[0.15em] uppercase mt-2"
                    >
                      Show {filtered.length} results
                    </button>
                  </div>
                </aside>
              )}
            </AnimatePresence>

            {/* Product Grid */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-4 animate-pulse">
                      <div className="aspect-[3/4] bg-secondary rounded" />
                      <div className="space-y-2">
                        <div className="h-3 bg-secondary rounded w-1/3" />
                        <div className="h-4 bg-secondary rounded w-2/3" />
                        <div className="h-3 bg-secondary rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-24 border border-dashed border-border"
                >
                  <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-secondary flex items-center justify-center">
                    <SlidersHorizontal size={24} className="text-muted-foreground" />
                  </div>
                  <p className="font-display text-xl text-foreground mb-2">No products found</p>
                  <p className="text-muted-foreground text-sm font-body mb-5">Try adjusting your filters to find what you're looking for.</p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center gap-2 text-accent text-[11px] font-body font-semibold tracking-[0.15em] uppercase border border-accent px-6 py-2.5 hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <X size={12} />
                    Clear all filters
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className={`grid grid-cols-2 ${gridCols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4 md:gap-6`}
                >
                  {filtered.map((p, index) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.3 }}
                    >
                      <ProductCard product={p} />
                    </motion.div>
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
