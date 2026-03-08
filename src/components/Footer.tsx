import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-foreground text-primary-foreground py-12 md:py-16">
    <div className="container">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <h3 className="font-display text-xl font-bold mb-4">ATTIRE</h3>
          <p className="text-primary-foreground/60 text-sm leading-relaxed">
            Premium men's apparel for the modern gentleman. Quality fabrics, timeless style.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm tracking-wide mb-4">SHOP</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/60">
            <li><Link to="/products?category=t-shirts" className="hover:text-primary-foreground transition-colors">T-Shirts</Link></li>
            <li><Link to="/products?category=panjabi" className="hover:text-primary-foreground transition-colors">Panjabi</Link></li>
            <li><Link to="/products?category=polo-shirts" className="hover:text-primary-foreground transition-colors">Polo Shirts</Link></li>
            <li><Link to="/products?category=pants" className="hover:text-primary-foreground transition-colors">Pants</Link></li>
            <li><Link to="/products?category=trousers" className="hover:text-primary-foreground transition-colors">Trousers</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm tracking-wide mb-4">HELP</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/60">
            <li><span className="cursor-default">Size Guide</span></li>
            <li><span className="cursor-default">Shipping</span></li>
            <li><span className="cursor-default">Returns</span></li>
            <li><span className="cursor-default">Contact Us</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display font-semibold text-sm tracking-wide mb-4">FOLLOW US</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/60">
            <li><span className="cursor-default">Facebook</span></li>
            <li><span className="cursor-default">Instagram</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-xs text-primary-foreground/40">
        © 2026 ATTIRE. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
