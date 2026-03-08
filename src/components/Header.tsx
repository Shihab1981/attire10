import { Link } from "react-router-dom";
import { ShoppingBag, Search, Menu, X, MapPin } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const totalItems = useCartStore((s) => s.totalItems());
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <div className="bg-foreground text-primary-foreground overflow-hidden">
        <div className="animate-marquee flex whitespace-nowrap py-2">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-[10px] tracking-[0.25em] uppercase mx-12 font-body">
              ✦ Free Shipping on Orders Over ৳2,000 ✦ New Arrivals Every Week ✦ Premium Quality Fabrics ✦ 100% Authentic Products
            </span>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-50 bg-background/98 backdrop-blur-xl border-b border-border/60">
        <div className="container flex items-center justify-between h-16 md:h-20">
          <button
            className="md:hidden p-2 -ml-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
          </button>

          <Link to="/" className="font-display text-xl md:text-2xl font-bold tracking-[0.1em] uppercase">
            ATTIRE
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

          <div className="flex items-center gap-4">
            <Link to="/products" className="p-2 hover:text-accent transition-colors" aria-label="Search">
              <Search size={18} strokeWidth={1.5} />
            </Link>
            <Link to="/cart" className="p-2 relative hover:text-accent transition-colors" aria-label="Cart">
              <ShoppingBag size={18} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent text-accent-foreground text-[9px] font-bold w-[18px] h-[18px] flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
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
                      className="block text-[11px] font-medium tracking-[0.2em] uppercase py-3 text-muted-foreground hover:text-foreground transition-colors border-b border-border/30"
                    >
                      {l.label}
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

export default Header;
