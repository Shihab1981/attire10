import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { categories, type Category, type Size } from "@/data/products";
import { SlidersHorizontal, X } from "lucide-react";

const allSizes: Size[] = ["S", "M", "L", "XL", "XXL"];

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category") as Category | null;
  const filterParam = searchParams.get("filter");

  const [selectedCategory, setSelectedCategory] = useState<Category | null>(categoryParam);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">
                {selectedCategory ? categories.find((c) => c.slug === selectedCategory)?.name : filterParam === "new" ? "New Arrivals" : "All Products"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">{filtered.length} product{filtered.length !== 1 ? "s" : ""}</p>
            </div>
            <button onClick={() => setFiltersOpen(!filtersOpen)} className="md:hidden flex items-center gap-2 text-sm font-medium border border-border px-4 py-2">
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>

          <div className="flex gap-8">
            <aside className={`${filtersOpen ? "fixed inset-0 z-40 bg-background p-6 overflow-auto" : "hidden"} md:block md:static md:w-56 shrink-0`}>
              <div className="flex items-center justify-between md:hidden mb-6">
                <h2 className="font-display font-semibold text-lg">Filters</h2>
                <button onClick={() => setFiltersOpen(false)}><X size={20} /></button>
              </div>
              <div className="space-y-8">
                <div>
                  <h3 className="font-display font-semibold text-sm mb-3 tracking-wide">CATEGORY</h3>
                  <div className="space-y-2">
                    <button onClick={() => handleCategoryClick(null)} className={`block text-sm transition-colors ${!selectedCategory ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>All</button>
                    {categories.map((c) => (
                      <button key={c.slug} onClick={() => handleCategoryClick(c.slug)} className={`block text-sm transition-colors ${selectedCategory === c.slug ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"}`}>{c.name}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm mb-3 tracking-wide">SIZE</h3>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map((s) => (
                      <button key={s} onClick={() => setSelectedSize(selectedSize === s ? null : s)} className={`w-10 h-10 text-xs font-medium border transition-colors ${selectedSize === s ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"}`}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-sm mb-3 tracking-wide">PRICE RANGE</h3>
                  <div className="flex gap-2 items-center text-sm">
                    <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])} className="w-20 border border-border px-2 py-1.5 bg-background text-sm" min={0} />
                    <span className="text-muted-foreground">—</span>
                    <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], +e.target.value])} className="w-20 border border-border px-2 py-1.5 bg-background text-sm" min={0} />
                  </div>
                </div>
                {(selectedCategory || selectedSize || priceRange[0] > 0 || priceRange[1] < 5000) && (
                  <button onClick={clearFilters} className="text-xs text-accent hover:underline font-medium">Clear all filters</button>
                )}
                <button onClick={() => setFiltersOpen(false)} className="md:hidden w-full bg-foreground text-background py-3 font-display font-semibold text-sm tracking-wide mt-4">Show {filtered.length} results</button>
              </div>
            </aside>

            <div className="flex-1">
              {isLoading ? (
                <p className="text-muted-foreground text-center py-20">Loading products...</p>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-muted-foreground">No products found matching your filters.</p>
                  <button onClick={clearFilters} className="text-accent hover:underline text-sm mt-2">Clear filters</button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
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
