import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
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

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative w-full h-[75vh] md:h-[90vh] overflow-hidden bg-foreground">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-foreground/10" />
          <div className="absolute inset-0 bg-foreground/10" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 container h-full flex items-end pb-16 md:pb-24 md:items-center">
        <motion.div
          key={`text-${current}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-2xl"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-primary-foreground/60 text-[10px] md:text-xs tracking-[0.3em] uppercase font-body mb-6"
          >
            {slide.overline}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground whitespace-pre-line leading-[1.1]"
          >
            {slide.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-5 text-primary-foreground/70 text-sm md:text-base font-body font-light max-w-md"
          >
            {slide.subtitle}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Link
              to={slide.link}
              className="inline-flex items-center gap-3 mt-8 md:mt-10 group"
            >
              <span className="text-primary-foreground text-[11px] font-medium tracking-[0.2em] uppercase font-body">
                {slide.cta}
              </span>
              <ArrowRight size={16} className="text-primary-foreground transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-8 right-8 md:right-16 flex items-center gap-4 z-10">
        <span className="text-primary-foreground/40 text-[10px] font-body tracking-wider">
          {String(current + 1).padStart(2, "0")}
        </span>
        <div className="flex gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-[2px] rounded-full transition-all duration-500 ${
                i === current ? "w-8 bg-primary-foreground" : "w-4 bg-primary-foreground/25"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
        <span className="text-primary-foreground/40 text-[10px] font-body tracking-wider">
          {String(slides.length).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
};

export default HeroSlider;
