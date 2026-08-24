import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";

const features = [
  { icon: Truck, title: "Free Delivery", desc: "Over ৳2,000" },
  { icon: ShieldCheck, title: "1 Year Warranty", desc: "Official coverage" },
  { icon: RefreshCw, title: "7-Day Replacement", desc: "Faulty units" },
  { icon: Headphones, title: "Tech Support", desc: "Setup help" },
];

const TrustBanner = () => (
  <section className="border-y border-border bg-secondary/30">
    <div className="container py-4">
      <div className="flex items-center justify-between gap-4 overflow-x-auto">
        {features.map((f) => (
          <div key={f.title} className="flex items-center gap-2.5 shrink-0">
            <f.icon size={16} strokeWidth={1.5} className="text-accent" />
            <div>
              <span className="text-xs font-display font-bold">{f.title}</span>
              <span className="text-[10px] text-muted-foreground font-body ml-1.5">{f.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBanner;
