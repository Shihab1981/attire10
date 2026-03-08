import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground">
    {/* Newsletter */}
    <div className="border-b border-primary-foreground/10">
      <div className="container py-16 md:py-24 flex flex-col md:flex-row md:items-center md:justify-between gap-10">
        <div className="max-w-md">
          <p className="text-[10px] tracking-[0.3em] uppercase text-primary-foreground/40 font-body mb-3">Newsletter</p>
          <h3 className="font-display text-2xl md:text-4xl font-extrabold leading-tight">Stay in the loop</h3>
          <p className="text-primary-foreground/40 text-sm font-body mt-3 leading-relaxed">
            Be the first to know about new collections and exclusive offers.
          </p>
        </div>
        <div className="flex w-full md:w-auto">
          <input
            type="email"
            placeholder="Your email address"
            className="bg-primary-foreground/5 border border-primary-foreground/15 text-primary-foreground placeholder:text-primary-foreground/25 px-5 py-3.5 text-sm font-body w-full md:w-72 focus:outline-none focus:border-accent transition-colors"
          />
          <button className="bg-accent text-accent-foreground px-6 py-3.5 text-[11px] font-body font-semibold tracking-[0.15em] uppercase hover:bg-accent/90 transition-colors shrink-0 flex items-center gap-2">
            Subscribe
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>

    {/* Links */}
    <div className="container py-14 md:py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <h3 className="font-display text-xl font-extrabold tracking-[0.15em] uppercase mb-4">ATTIRE</h3>
          <p className="text-primary-foreground/35 text-sm leading-relaxed font-body font-light">
            Premium men's apparel for the modern gentleman. Quality fabrics, timeless style.
          </p>
          <div className="mt-6 h-[2px] w-10 bg-accent/60" />
        </div>
        <div>
          <h4 className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-primary-foreground/50 mb-5">
            Shop
          </h4>
          <ul className="space-y-3 text-sm text-primary-foreground/35 font-body">
            <li><Link to="/products?category=t-shirts" className="link-underline hover:text-primary-foreground hover:pl-1 transition-all">T-Shirts</Link></li>
            <li><Link to="/products?category=panjabi" className="link-underline hover:text-primary-foreground hover:pl-1 transition-all">Panjabi</Link></li>
            <li><Link to="/products?category=polo-shirts" className="link-underline hover:text-primary-foreground hover:pl-1 transition-all">Polo Shirts</Link></li>
            <li><Link to="/products?category=pants" className="link-underline hover:text-primary-foreground hover:pl-1 transition-all">Pants</Link></li>
            <li><Link to="/products?category=trousers" className="link-underline hover:text-primary-foreground hover:pl-1 transition-all">Trousers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-primary-foreground/50 mb-5">
            Information
          </h4>
          <ul className="space-y-3 text-sm text-primary-foreground/35 font-body">
            <li><span className="cursor-default hover:text-primary-foreground transition-colors">Size Guide</span></li>
            <li><span className="cursor-default hover:text-primary-foreground transition-colors">Shipping & Delivery</span></li>
            <li><span className="cursor-default hover:text-primary-foreground transition-colors">Returns & Exchange</span></li>
            <li><span className="cursor-default hover:text-primary-foreground transition-colors">Contact Us</span></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-primary-foreground/50 mb-5">
            Connect
          </h4>
          <ul className="space-y-3 text-sm text-primary-foreground/35 font-body">
            <li><span className="cursor-default hover:text-primary-foreground transition-colors">Facebook</span></li>
            <li><span className="cursor-default hover:text-primary-foreground transition-colors">Instagram</span></li>
          </ul>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-primary-foreground/8">
      <div className="container py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p className="text-[11px] text-primary-foreground/25 font-body tracking-wider">
          © 2026 Attire. All rights reserved.
        </p>
        <div className="flex gap-6 text-[11px] text-primary-foreground/25 font-body tracking-wider">
          <span className="hover:text-primary-foreground/50 transition-colors cursor-default">Privacy Policy</span>
          <span className="hover:text-primary-foreground/50 transition-colors cursor-default">Terms of Service</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
