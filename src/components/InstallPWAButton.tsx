import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const InstallPWAButton = () => {
  const [isInstalled, setIsInstalled] = useState(false);

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
      className="flex items-center gap-1.5 px-2 py-2 sm:px-3 text-[10px] font-medium tracking-[0.15em] uppercase border border-accent/40 text-accent hover:bg-accent hover:text-accent-foreground rounded-sm transition-all"
      aria-label="Install ATTIRE app"
    >
      <Download size={14} strokeWidth={1.5} />
      <span className="hidden sm:inline">Install App</span>
      <span className="sm:hidden">Install</span>
    </Link>
  );
};

export default InstallPWAButton;
