import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";

const slides = [
  {
    image: hero1,
    title: "New Season\nEssentials",
    subtitle: "Refined basics for the modern man",
    cta: "Shop New Arrivals",
    link: "/products?filter=new",
  },
  {
    image: hero2,
    title: "Premium\nPolo Collection",
    subtitle: "Elevated everyday wear",
    cta: "Explore Polos",
    link: "/products?category=polo-shirts",
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[current];

  return (
    <section className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-secondary">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/20 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 container h-full flex items-center">
        <motion.div
          key={`text-${current}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="max-w-lg"
        >
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground whitespace-pre-line leading-tight">
            {slide.title}
          </h1>
          <p className="mt-4 text-primary-foreground/80 text-base md:text-lg font-body">
            {slide.subtitle}
          </p>
          <Link
            to={slide.link}
            className="inline-block mt-8 px-8 py-3.5 bg-background text-foreground font-display text-sm font-semibold tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {slide.cta}
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-8 h-1 rounded-full transition-colors ${
              i === current ? "bg-primary-foreground" : "bg-primary-foreground/30"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
