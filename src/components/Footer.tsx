import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground">
    {/* Newsletter */}
    <div className="border-b border-primary-foreground/10">
      <div className="container py-14 md:py-20 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div>
          <h3 className="font-display text-2xl md:text-3xl font-medium italic">Stay in the loop</h3>
          <p className="text-primary-foreground/50 text-sm font-body mt-2">
            Be the first to know about new collections and exclusive offers.
          </p>
        </div>
        <div className="flex w-full md:w-auto">
          <input
            type="email"
            placeholder="Your email"
            className="bg-primary-foreground/5 border border-primary-foreground/15 text-primary-foreground placeholder:text-primary-foreground/30 px-5 py-3 text-sm font-body w-full md:w-72 focus:outline-none focus:border-primary-foreground/40 transition-colors"
          />
          <button className="bg-primary-foreground text-foreground px-6 py-3 text-[11px] font-body font-semibold tracking-[0.15em] uppercase hover:bg-primary-foreground/90 transition-colors shrink-0">
            Subscribe
          </button>
        </div>
      </div>
    </div>

    {/* Links */}
    <div className="container py-14 md:py-16">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <h3 className="font-display text-2xl font-medium italic mb-4">Attire</h3>
          <p className="text-primary-foreground/40 text-sm leading-relaxed font-body font-light">
            Premium men's apparel for the modern gentleman. Quality fabrics, timeless style.
          </p>
        </div>
        <div>
          <h4 className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-primary-foreground/60 mb-5">
            Shop
          </h4>
          <ul className="space-y-3 text-sm text-primary-foreground/40 font-body">
            <li><Link to="/products?category=t-shirts" className="link-underline hover:text-primary-foreground transition-colors">T-Shirts</Link></li>
            <li><Link to="/products?category=panjabi" className="link-underline hover:text-primary-foreground transition-colors">Panjabi</Link></li>
            <li><Link to="/products?category=polo-shirts" className="link-underline hover:text-primary-foreground transition-colors">Polo Shirts</Link></li>
            <li><Link to="/products?category=pants" className="link-underline hover:text-primary-foreground transition-colors">Pants</Link></li>
            <li><Link to="/products?category=trousers" className="link-underline hover:text-primary-foreground transition-colors">Trousers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-primary-foreground/60 mb-5">
            Information
          </h4>
          <ul className="space-y-3 text-sm text-primary-foreground/40 font-body">
            <li><span className="cursor-default">Size Guide</span></li>
            <li><span className="cursor-default">Shipping & Delivery</span></li>
            <li><span className="cursor-default">Returns & Exchange</span></li>
            <li><span className="cursor-default">Contact Us</span></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[10px] font-body font-semibold tracking-[0.25em] uppercase text-primary-foreground/60 mb-5">
            Connect
          </h4>
          <ul className="space-y-3 text-sm text-primary-foreground/40 font-body">
            <li><span className="cursor-default">Facebook</span></li>
            <li><span className="cursor-default">Instagram</span></li>
          </ul>
        </div>
      </div>
    </div>

    {/* Bottom bar */}
    <div className="border-t border-primary-foreground/8">
      <div className="container py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <p className="text-[11px] text-primary-foreground/30 font-body tracking-wider">
          © 2026 Attire. All rights reserved.
        </p>
        <div className="flex gap-6 text-[11px] text-primary-foreground/30 font-body tracking-wider">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
