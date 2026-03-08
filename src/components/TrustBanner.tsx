import { Truck, Shield, RefreshCw, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Truck, title: "Free Shipping", desc: "On orders over ৳2,000" },
  { icon: Shield, title: "Authentic Products", desc: "100% genuine quality" },
  { icon: RefreshCw, title: "Easy Returns", desc: "7-day return policy" },
  { icon: Headphones, title: "24/7 Support", desc: "Always here to help" },
];

const TrustBanner = () => (
  <section className="border-y border-border/60 bg-background">
    <div className="container py-10 md:py-14">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <f.icon size={20} strokeWidth={1.5} className="mx-auto mb-3 text-muted-foreground" />
            <h4 className="font-display text-sm font-semibold mb-1">{f.title}</h4>
            <p className="text-[11px] text-muted-foreground font-body">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBanner;
