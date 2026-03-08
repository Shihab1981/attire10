import { Link, useLocation } from "react-router-dom";
import { Package, ShoppingCart, Tag, LayoutDashboard, ArrowLeft, Zap } from "lucide-react";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/coupons", label: "Coupons", icon: Tag },
  { to: "/admin/flash-sales", label: "Flash Sales", icon: Zap },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-60 bg-foreground text-primary-foreground shrink-0">
        <div className="p-6">
          <h2 className="font-display text-lg font-bold mb-1">ATTIRE</h2>
          <p className="text-primary-foreground/50 text-xs">Admin Panel</p>
        </div>
        <nav className="px-3 pb-6 flex md:flex-col gap-1 overflow-x-auto">
          {links.map((l) => {
            const active = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-sm transition-colors whitespace-nowrap ${
                  active
                    ? "bg-primary-foreground/15 text-primary-foreground font-medium"
                    : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                <l.icon size={16} />
                {l.label}
              </Link>
            );
          })}
          <div className="mt-auto pt-4 hidden md:block">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-2 text-xs text-primary-foreground/40 hover:text-primary-foreground/70 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Store
            </Link>
          </div>
        </nav>
      </aside>
      <main className="flex-1 bg-secondary/30 p-4 md:p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
