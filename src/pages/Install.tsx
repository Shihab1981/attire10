import { useEffect, useState } from "react";
import { Download, Smartphone, Monitor, Apple, Share, Plus, CheckCircle2, Wifi, Bell, Zap } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "android" | "ios" | "desktop";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<Platform>("android");

  useEffect(() => {
    // Detect installed
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-ignore
      window.navigator.standalone === true;
    setIsInstalled(standalone);

    // Detect platform
    const ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) setPlatform("ios");
    else if (/android/.test(ua)) setPlatform("android");
    else setPlatform("desktop");

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
    if (!deferredPrompt) {
      toast.info("Please follow the manual instructions below for your device");
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") toast.success("Installing ATTIRE...");
    setDeferredPrompt(null);
  };

  const benefits = [
    { icon: Zap, title: "Faster Loading", desc: "Open instantly from your home screen" },
    { icon: Wifi, title: "Works Offline", desc: "Browse cached pages without internet" },
    { icon: Bell, title: "Stay Updated", desc: "Get the latest deals and arrivals" },
    { icon: Smartphone, title: "App-like Experience", desc: "Full screen, no browser bars" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="container py-12 md:py-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-accent/10 mb-6">
            <Download size={36} strokeWidth={1.5} className="text-accent" />
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-accent font-medium mb-3">
            Progressive Web App
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-extrabold tracking-[0.05em] uppercase mb-4">
            Install ATTIRE
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base leading-relaxed mb-8">
            Get the full ATTIRE experience on your device. Faster, smoother, and works even when you're offline.
          </p>

          {isInstalled ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-accent/10 text-accent rounded-sm text-[11px] tracking-[0.2em] uppercase font-medium">
              <CheckCircle2 size={16} strokeWidth={2} />
              App Already Installed
            </div>
          ) : (
            <button
              onClick={handleInstall}
              disabled={!deferredPrompt}
              className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background hover:bg-accent transition-colors text-[11px] font-medium tracking-[0.25em] uppercase rounded-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download size={16} strokeWidth={2} />
              {deferredPrompt ? "Install Now" : "Install Manually Below"}
            </button>
          )}

          {!deferredPrompt && !isInstalled && (
            <p className="text-xs text-muted-foreground mt-4">
              Auto-install not available in this browser. Follow your device's instructions below.
            </p>
          )}
        </section>

        {/* Benefits */}
        <section className="container pb-12 md:pb-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="border border-border/50 p-5 md:p-6 rounded-sm hover:border-accent/40 transition-colors"
              >
                <b.icon size={20} strokeWidth={1.5} className="text-accent mb-3" />
                <h3 className="font-display font-bold text-sm uppercase tracking-wider mb-1">
                  {b.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Platform Tabs */}
        <section className="container pb-16 md:pb-24">
          <div className="border border-border/50 rounded-sm overflow-hidden">
            {/* Tabs */}
            <div className="grid grid-cols-3 border-b border-border/50">
              {[
                { id: "android" as Platform, label: "Android", icon: Smartphone },
                { id: "ios" as Platform, label: "iOS", icon: Apple },
                { id: "desktop" as Platform, label: "Desktop", icon: Monitor },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setPlatform(tab.id)}
                  className={`flex items-center justify-center gap-2 py-4 px-3 text-[10px] md:text-[11px] tracking-[0.2em] uppercase font-medium transition-all ${
                    platform === tab.id
                      ? "bg-foreground text-background"
                      : "hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon size={14} strokeWidth={1.5} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Steps */}
            <div className="p-6 md:p-10">
              {platform === "android" && (
                <Steps
                  title="Install on Android"
                  subtitle="Chrome, Edge, or Samsung Internet"
                  steps={[
                    { text: "Tap the 'Install Now' button above, or open the browser menu (⋮)" },
                    { text: "Select 'Install app' or 'Add to Home screen'" },
                    { text: "Tap 'Install' to confirm — ATTIRE will appear on your home screen" },
                  ]}
                />
              )}
              {platform === "ios" && (
                <Steps
                  title="Install on iPhone / iPad"
                  subtitle="Safari Browser Required"
                  steps={[
                    {
                      text: "Tap the Share icon at the bottom of Safari",
                      icon: <Share size={16} className="text-accent" />,
                    },
                    {
                      text: "Scroll down and tap 'Add to Home Screen'",
                      icon: <Plus size={16} className="text-accent" />,
                    },
                    { text: "Tap 'Add' in the top-right corner to confirm" },
                  ]}
                />
              )}
              {platform === "desktop" && (
                <Steps
                  title="Install on Desktop"
                  subtitle="Chrome, Edge, or Brave"
                  steps={[
                    { text: "Click the 'Install Now' button above, or look for the install icon (⊕) in the address bar" },
                    { text: "Click 'Install' in the popup dialog" },
                    { text: "ATTIRE will open in its own window — pin it to your taskbar or dock" },
                  ]}
                />
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const Steps = ({
  title,
  subtitle,
  steps,
}: {
  title: string;
  subtitle: string;
  steps: { text: string; icon?: React.ReactNode }[];
}) => (
  <div>
    <h2 className="font-display text-xl md:text-2xl font-bold uppercase tracking-wider mb-1">
      {title}
    </h2>
    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-8">{subtitle}</p>
    <ol className="space-y-5">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-4 items-start">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-display font-bold text-sm">
            {i + 1}
          </span>
          <div className="flex-1 pt-1 flex items-center gap-2 flex-wrap">
            <span className="text-sm leading-relaxed">{step.text}</span>
            {step.icon}
          </div>
        </li>
      ))}
    </ol>
  </div>
);

export default Install;
