import { Truck, Shield, RefreshCw, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over ৳2,000", color: "hsl(var(--accent))" },
  { icon: Shield, title: "Authentic Products", desc: "100% genuine quality", color: "hsl(var(--gold))" },
  { icon: RefreshCw, title: "Easy Returns", desc: "7-day return policy", color: "hsl(24, 60%, 55%)" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here to help", color: "hsl(200, 60%, 50%)" },
];

const TrustBanner = () => (
  <section className="relative overflow-hidden bg-background">
    <div className="section-divider" />
    <div className="container py-12 md:py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="group text-center px-4 py-6 rounded-sm hover:bg-secondary/60 transition-all duration-300"
          >
            <div
              className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
              style={{ backgroundColor: `${f.color}15` }}
            >
              <f.icon size={20} strokeWidth={1.5} style={{ color: f.color }} />
            </div>
            <h4 className="font-display text-sm font-bold mb-1.5">{f.title}</h4>
            <p className="text-[11px] text-muted-foreground font-body leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
    <div className="section-divider" />
  </section>
);

export default TrustBanner;
