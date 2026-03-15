import { Link } from "react-router-dom";
import { ShoppingBag, Search, Menu, X, MapPin, Heart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useFavoritesStore } from "@/store/favoritesStore";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const totalItems = useCartStore((s) => s.totalItems());
  const favCount = useFavoritesStore((s) => s.items.length);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { to: "/products?category=t-shirts", label: "T-Shirts" },
    { to: "/products?category=panjabi", label: "Panjabi" },
    { to: "/products?category=polo-shirts", label: "Polo Shirts" },
    { to: "/products?category=pants", label: "Pants" },
    { to: "/products?category=trousers", label: "Trousers" },
  ];

  return (
    <>
      {/* Top announcement bar */}
      <AnnouncementBar />

      <header
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-background/95 backdrop-blur-xl border-border/60 shadow-sm"
            : "bg-background/98 backdrop-blur-xl border-border/30"
        }`}
      >
        <div className="container flex items-center justify-between h-16 md:h-20">
          <button
            className="md:hidden p-2 -ml-2 hover:bg-secondary/60 rounded-sm transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>

          <Link to="/" className="font-display text-xl md:text-2xl font-extrabold tracking-[0.15em] uppercase relative group">
            ATTIRE
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-accent transition-all duration-300 group-hover:w-full" />
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="link-underline text-[11px] font-medium tracking-[0.15em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <ThemeToggle />
            <Link to="/track-order" className="p-2.5 hover:bg-secondary/60 rounded-sm hover:text-accent transition-all" aria-label="Track Order">
              <MapPin size={18} strokeWidth={1.5} />
            </Link>
            <Link to="/products" className="p-2.5 hover:bg-secondary/60 rounded-sm hover:text-accent transition-all" aria-label="Search">
              <Search size={18} strokeWidth={1.5} />
            </Link>
            <Link to="/favorites" className="p-2.5 relative hover:bg-secondary/60 rounded-sm hover:text-accent transition-all" aria-label="Favorites">
              <Heart size={18} strokeWidth={1.5} />
              {favCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0.5 right-0.5 bg-accent text-accent-foreground text-[9px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-sm"
                >
                  {favCount}
                </motion.span>
              )}
            </Link>
            <Link to="/cart" className="p-2.5 relative hover:bg-secondary/60 rounded-sm hover:text-accent transition-all" aria-label="Cart">
              <ShoppingBag size={18} strokeWidth={1.5} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0.5 right-0.5 bg-accent text-accent-foreground text-[9px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-sm"
                >
                  {totalItems}
                </motion.span>
              )}
            </Link>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden overflow-hidden border-t border-border/50"
            >
              <div className="container py-6 flex flex-col gap-1">
                {navLinks.map((l, i) => (
                  <motion.div
                    key={l.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between text-[11px] font-medium tracking-[0.2em] uppercase py-3.5 text-muted-foreground hover:text-foreground hover:pl-2 transition-all border-b border-border/30"
                    >
                      {l.label}
                      <motion.span className="text-accent opacity-0 group-hover:opacity-100">→</motion.span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};

const defaultAnnouncement = "✦ Free Shipping on Orders Over ৳2,000 ✦ New Arrivals Every Week ✦ Premium Quality Fabrics ✦ 100% Authentic Products";

const AnnouncementBar = () => {
  const { data: text } = useQuery({
    queryKey: ["announcement-text"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "announcement_text")
        .maybeSingle();
      if (error || !data) return defaultAnnouncement;
      return data.value || defaultAnnouncement;
    },
    staleTime: 60000,
  });

  const announcement = text || defaultAnnouncement;

  return (
    <div className="bg-foreground text-primary-foreground overflow-hidden">
      <div className="animate-marquee flex whitespace-nowrap py-2">
        {[...Array(4)].map((_, i) => (
          <span key={i} className="text-[10px] tracking-[0.25em] uppercase mx-12 font-body">
            {announcement}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Header;
