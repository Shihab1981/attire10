import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    // Detect standalone (already installed)
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-ignore - iOS specific
      window.navigator.standalone === true;
    setIsInstalled(standalone);

    // Detect iOS Safari (no beforeinstallprompt support)
    const ua = window.navigator.userAgent.toLowerCase();
    const iOS = /iphone|ipad|ipod/.test(ua) && !/crios|fxios/.test(ua);
    setIsIOS(iOS);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      toast.success("ATTIRE installed successfully!");
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSHint(true);
      toast.info("Tap the Share icon in Safari, then 'Add to Home Screen'", {
        duration: 6000,
      });
      return;
    }

    if (!deferredPrompt) {
      toast.info("App already installed or not available in this browser");
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      toast.success("Installing ATTIRE...");
    }
    setDeferredPrompt(null);
  };

  // Hide if already installed, or no prompt available and not iOS
  if (isInstalled) return null;
  if (!deferredPrompt && !isIOS) return null;

  return (
    <button
      onClick={handleInstall}
      className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-[10px] font-medium tracking-[0.15em] uppercase border border-accent/40 text-accent hover:bg-accent hover:text-accent-foreground rounded-sm transition-all"
      aria-label="Install ATTIRE app"
    >
      <Download size={14} strokeWidth={1.5} />
      <span>Install App</span>
    </button>
  );
};

export default InstallPWAButton;
