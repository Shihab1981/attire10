import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Download, X } from "lucide-react";

const DISMISS_KEY = "attire_install_banner_dismissed";
const PAGE_COUNT_KEY = "attire_page_view_count";
const MIN_PAGES = 2;

const InstallBanner = () => {
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  // Track page views
  useEffect(() => {
    const count = parseInt(sessionStorage.getItem(PAGE_COUNT_KEY) || "0", 10) + 1;
    sessionStorage.setItem(PAGE_COUNT_KEY, count.toString());
  }, [location.pathname]);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-ignore
      window.navigator.standalone === true;
    if (standalone) {
      setIsInstalled(true);
      return;
    }

    // Don't show on /install page itself
    if (location.pathname === "/install") return;

    // Check dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      // Re-show after 7 days
      if (Date.now() - dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    }

    // Check page view count
    const count = parseInt(sessionStorage.getItem(PAGE_COUNT_KEY) || "0", 10);
    if (count < MIN_PAGES) return;

    // Show after a small delay
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setVisible(false);
  };

  if (isInstalled || !visible) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pointer-events-none animate-in slide-in-from-bottom duration-300">
      <div className="bg-foreground text-background rounded-md shadow-2xl border border-border/20 pointer-events-auto flex items-center gap-3 p-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-md bg-accent/20 flex items-center justify-center">
          <Download size={18} className="text-accent" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-xs uppercase tracking-wider leading-tight">
            Install ATTIRE
          </p>
          <p className="text-[10px] text-background/70 leading-tight mt-0.5">
            Faster access from your home screen
          </p>
        </div>
        <Link
          to="/install"
          onClick={() => setVisible(false)}
          className="flex-shrink-0 px-3 py-2 bg-accent text-accent-foreground text-[10px] font-medium tracking-[0.15em] uppercase rounded-sm hover:bg-accent/90 transition-colors"
        >
          Install
        </Link>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss install banner"
          className="flex-shrink-0 p-1 text-background/60 hover:text-background transition-colors"
        >
          <X size={16} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default InstallBanner;
