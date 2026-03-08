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
    title: "Modern\nElegance",
    subtitle: "Crafted for the man who values substance over spectacle",
    cta: "Discover Collection",
    link: "/products?filter=new",
  },
  {
    image: hero2,
    overline: "Premium Essentials",
    title: "Everyday\nStyle",
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
        return p + 100 / 60;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [current]);

  const slide = slides[current];
  const goTo = (i: number) => { setCurrent(i); setProgress(0); };

  return (
    <section className="relative w-full h-[50vh] md:h-[60vh] overflow-hidden bg-foreground">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
        >
          <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-foreground/20" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 container h-full flex items-center">
        <motion.div
          key={`text-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="max-w-xl"
        >
          <div className="h-[2px] w-8 bg-accent mb-5" />
          <p className="text-primary-foreground/50 text-[10px] md:text-xs tracking-[0.4em] uppercase font-body mb-3">
            {slide.overline}
          </p>
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground whitespace-pre-line leading-[1.05] tracking-tight">
            {slide.title}
          </h1>
          <p className="mt-3 text-primary-foreground/60 text-sm md:text-base font-body font-light max-w-sm leading-relaxed">
            {slide.subtitle}
          </p>
          <div className="mt-6 md:mt-8 flex items-center gap-4">
            <Link
              to={slide.link}
              className="shimmer-btn inline-flex items-center gap-2.5 px-6 py-3 text-accent-foreground text-[11px] font-semibold tracking-[0.2em] uppercase font-body transition-all hover:shadow-lg hover:shadow-accent/25 active:scale-[0.98]"
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
          </div>
        </motion.div>
      </div>

      {/* Nav arrows */}
      <div className="absolute bottom-1/2 translate-y-1/2 right-4 md:right-8 z-10 flex flex-col gap-2">
        <button onClick={() => goTo((current - 1 + slides.length) % slides.length)} className="glass w-9 h-9 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground transition-all" aria-label="Previous">
          <ChevronLeft size={16} />
        </button>
        <button onClick={() => goTo((current + 1) % slides.length)} className="glass w-9 h-9 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground transition-all" aria-label="Next">
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Progress */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10">
        <span className="text-primary-foreground/30 text-xs font-display font-bold">{String(current + 1).padStart(2, "0")}</span>
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className="relative h-[2px] rounded-full overflow-hidden bg-primary-foreground/15 transition-all duration-500" style={{ width: i === current ? 40 : 14 }} aria-label={`Slide ${i + 1}`}>
              {i === current && <motion.div className="absolute inset-y-0 left-0 bg-accent rounded-full" style={{ width: `${progress}%` }} />}
            </button>
          ))}
        </div>
        <span className="text-primary-foreground/30 text-xs font-display font-bold">{String(slides.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
};

export default HeroSlider;
