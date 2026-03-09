import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useFavoritesStore } from "@/store/favoritesStore";
import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Favorites = () => {
  const items = useFavoritesStore((s) => s.items);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="container py-10 md:py-16">
          <div className="text-center mb-10 md:mb-14">
            <div className="h-[2px] w-10 bg-accent mx-auto mb-6" />
            <p className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-muted-foreground font-body mb-3">
              Your Collection
            </p>
            <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight">
              Favorites
            </h1>
          </div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                <Heart size={32} strokeWidth={1.5} className="text-muted-foreground" />
              </div>
              <h2 className="font-display text-xl font-bold mb-2">No favorites yet</h2>
              <p className="text-muted-foreground text-sm font-body mb-6 max-w-sm">
                Browse our collection and tap the heart icon on products you love to save them here.
              </p>
              <Link
                to="/products"
                className="shimmer-btn text-accent-foreground px-8 py-3.5 text-[11px] font-body font-bold tracking-[0.2em] uppercase"
              >
                Explore Products
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Favorites;
