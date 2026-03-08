import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";

const slides = [
  {
    image: hero1,
    overline: "New Collection — SS'26",
    title: "Redefining\nModern Elegance",
    subtitle: "Crafted for the man who values substance over spectacle",
    cta: "Discover Collection",
    link: "/products?filter=new",
  },
  {
    image: hero2,
    overline: "Premium Essentials",
    title: "The Art of\nEveryday Style",
    subtitle: "Where comfort meets uncompromising quality",
    cta: "Shop Now",
    link: "/products?category=polo-shirts",
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setCurrent((c) => (c + 1) % slides.length);
          return 0;
        }
        return p + 100 / 60; // 6 seconds total
      });
    }, 100);
    return () => clearInterval(interval);
  }, [current]);

  const slide = slides[current];
  const goTo = (i: number) => { setCurrent(i); setProgress(0); };

  return (
    <section className="relative w-full h-[80vh] md:h-[92vh] overflow-hidden bg-foreground">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 1.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {/* Premium multi-layer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-foreground/20" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 container h-full flex items-end pb-20 md:pb-0 md:items-center">
        <motion.div
          key={`text-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-2xl"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 48 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="h-[2px] bg-accent mb-8"
          />
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-primary-foreground/50 text-[10px] md:text-xs tracking-[0.4em] uppercase font-body mb-5"
          >
            {slide.overline}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-display text-4xl md:text-6xl lg:text-8xl font-extrabold text-primary-foreground whitespace-pre-line leading-[1.05] tracking-tight"
          >
            {slide.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-6 text-primary-foreground/60 text-sm md:text-lg font-body font-light max-w-md leading-relaxed"
          >
            {slide.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-10 md:mt-12 flex items-center gap-5"
          >
            <Link
              to={slide.link}
              className="shimmer-btn inline-flex items-center gap-3 px-8 py-4 text-accent-foreground text-[11px] font-semibold tracking-[0.2em] uppercase font-body transition-all hover:shadow-lg hover:shadow-accent/25 hover:scale-[1.02] active:scale-[0.98]"
            >
              {slide.cta}
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/products"
              className="hidden md:inline-flex items-center gap-2 text-primary-foreground/50 text-[11px] font-body tracking-[0.15em] uppercase hover:text-primary-foreground transition-colors"
            >
              Browse All
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Navigation arrows */}
      <div className="absolute bottom-1/2 translate-y-1/2 right-6 md:right-12 z-10 flex flex-col gap-3">
        <button
          onClick={() => goTo((current - 1 + slides.length) % slides.length)}
          className="glass w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft size={18} />
        </button>
        <button
          onClick={() => goTo((current + 1) % slides.length)}
          className="glass w-10 h-10 md:w-12 md:h-12 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 transition-all"
          aria-label="Next slide"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:bottom-12 md:right-16 flex items-center gap-6 z-10">
        <span className="text-primary-foreground/30 text-xs font-display font-bold">
          {String(current + 1).padStart(2, "0")}
        </span>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="relative h-[3px] rounded-full overflow-hidden bg-primary-foreground/15 transition-all duration-500"
              style={{ width: i === current ? 48 : 16 }}
              aria-label={`Slide ${i + 1}`}
            >
              {i === current && (
                <motion.div
                  className="absolute inset-y-0 left-0 bg-accent rounded-full"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          ))}
        </div>
        <span className="text-primary-foreground/30 text-xs font-display font-bold">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
};

export default HeroSlider;
