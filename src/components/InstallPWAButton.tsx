import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const InstallPWAButton = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const location = useLocation();
  const isOnInstallPage = location.pathname === "/install";

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-ignore - iOS specific
      window.navigator.standalone === true;
    setIsInstalled(standalone);

    const installedHandler = () => setIsInstalled(true);
    window.addEventListener("appinstalled", installedHandler);
    return () => window.removeEventListener("appinstalled", installedHandler);
  }, []);

  if (isInstalled) return null;

  return (
    <Link
      to="/install"
      className={`relative flex items-center gap-1.5 px-2 py-2 sm:px-3 text-[10px] font-medium tracking-[0.15em] uppercase border text-accent hover:bg-accent hover:text-accent-foreground rounded-sm transition-all ${
        isOnInstallPage
          ? "border-accent bg-accent/10 shadow-[0_0_0_3px_hsl(var(--accent)/0.15),0_0_20px_hsl(var(--accent)/0.45)] animate-pulse-glow"
          : "border-accent/40"
      }`}
      aria-label="Install ATTIRE app"
    >
      {isOnInstallPage && (
        <span className="absolute inset-0 rounded-sm ring-2 ring-accent/50 animate-ping pointer-events-none" />
      )}
      <Download size={14} strokeWidth={1.5} />
      <span className="hidden sm:inline">Install App</span>
      <span className="sm:hidden">Install</span>
    </Link>
  );
};

export default InstallPWAButton;
