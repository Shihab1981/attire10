import { useEffect, useState } from "react";
import { Download, Smartphone, Monitor, Apple, Share, Plus, CheckCircle2, Wifi, Bell, Zap, MoreVertical, Home } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Visual illustrations for install steps
const AndroidMenuIllustration = () => (
  <div className="bg-secondary/40 rounded-md p-4 mt-3 border border-border/40">
    <div className="bg-background rounded-md shadow-sm overflow-hidden max-w-[220px] mx-auto">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
          <div className="h-2 w-20 bg-muted-foreground/20 rounded-sm" />
        </div>
        <div className="relative">
          <MoreVertical size={14} className="text-foreground" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent animate-ping opacity-75" />
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent" />
        </div>
      </div>
      <div className="p-2 text-[9px] text-muted-foreground text-center">Tap menu (⋮) top-right</div>
    </div>
  </div>
);

const AndroidInstallOptionIllustration = () => (
  <div className="bg-secondary/40 rounded-md p-4 mt-3 border border-border/40">
    <div className="bg-background rounded-md shadow-sm overflow-hidden max-w-[220px] mx-auto">
      <div className="py-1">
        <div className="px-3 py-1.5 text-[9px] text-muted-foreground">New tab</div>
        <div className="px-3 py-1.5 text-[9px] text-muted-foreground">Bookmarks</div>
        <div className="px-3 py-1.5 text-[9px] bg-accent/10 text-accent font-medium flex items-center gap-1.5 border-l-2 border-accent">
          <Download size={10} /> Install app
        </div>
        <div className="px-3 py-1.5 text-[9px] text-muted-foreground">Settings</div>
      </div>
    </div>
    <p className="text-[9px] text-muted-foreground text-center mt-2">Select "Install app"</p>
  </div>
);

const AndroidConfirmIllustration = () => (
  <div className="bg-secondary/40 rounded-md p-4 mt-3 border border-border/40">
    <div className="bg-background rounded-md shadow-sm p-3 max-w-[220px] mx-auto">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-md bg-accent/20 flex items-center justify-center">
          <span className="text-[8px] font-bold text-accent">A</span>
        </div>
        <div className="flex-1">
          <div className="h-2 w-16 bg-foreground/80 rounded-sm mb-1" />
          <div className="h-1.5 w-10 bg-muted-foreground/30 rounded-sm" />
        </div>
      </div>
      <div className="flex justify-end gap-1.5">
        <div className="px-2 py-1 text-[8px] text-muted-foreground">Cancel</div>
        <div className="px-2 py-1 text-[8px] bg-accent text-accent-foreground rounded-sm font-medium">Install</div>
      </div>
    </div>
    <p className="text-[9px] text-muted-foreground text-center mt-2">Tap "Install" to confirm</p>
  </div>
);

const IosShareIllustration = () => (
  <div className="bg-secondary/40 rounded-md p-4 mt-3 border border-border/40">
    <div className="bg-background rounded-md shadow-sm overflow-hidden max-w-[220px] mx-auto">
      <div className="px-3 py-2 text-[9px] text-center text-muted-foreground border-b border-border/40">
        attire10.lovable.app
      </div>
      <div className="flex items-center justify-around py-2 border-t border-border/40">
        <div className="text-muted-foreground/40 text-[10px]">‹</div>
        <div className="text-muted-foreground/40 text-[10px]">›</div>
        <div className="relative">
          <Share size={14} className="text-accent" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
        </div>
        <div className="text-muted-foreground/40 text-[10px]">▢</div>
        <div className="text-muted-foreground/40 text-[10px]">≡</div>
      </div>
    </div>
    <p className="text-[9px] text-muted-foreground text-center mt-2">Tap Share icon at bottom of Safari</p>
  </div>
);

const IosAddToHomeIllustration = () => (
  <div className="bg-secondary/40 rounded-md p-4 mt-3 border border-border/40">
    <div className="bg-background rounded-md shadow-sm overflow-hidden max-w-[220px] mx-auto">
      <div className="py-1">
        <div className="px-3 py-1.5 text-[9px] text-muted-foreground flex items-center justify-between">
          Copy <span>⎘</span>
        </div>
        <div className="px-3 py-1.5 text-[9px] text-muted-foreground flex items-center justify-between">
          Add to Reading List <span>⊕</span>
        </div>
        <div className="px-3 py-1.5 text-[9px] bg-accent/10 text-accent font-medium flex items-center justify-between border-l-2 border-accent">
          Add to Home Screen <Plus size={10} />
        </div>
        <div className="px-3 py-1.5 text-[9px] text-muted-foreground flex items-center justify-between">
          Markup <span>✎</span>
        </div>
      </div>
    </div>
    <p className="text-[9px] text-muted-foreground text-center mt-2">Scroll & tap "Add to Home Screen"</p>
  </div>
);

const IosConfirmIllustration = () => (
  <div className="bg-secondary/40 rounded-md p-4 mt-3 border border-border/40">
    <div className="bg-background rounded-md shadow-sm p-2 max-w-[220px] mx-auto">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[9px] text-muted-foreground">Cancel</div>
        <div className="text-[9px] font-semibold">Add to Home Screen</div>
        <div className="text-[9px] text-accent font-bold relative">
          Add
          <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-accent animate-ping" />
        </div>
      </div>
      <div className="flex items-center gap-2 p-2 bg-secondary/40 rounded-sm">
        <div className="w-7 h-7 rounded-md bg-accent/20 flex items-center justify-center">
          <Home size={10} className="text-accent" />
        </div>
        <div className="flex-1">
          <div className="h-1.5 w-12 bg-foreground/70 rounded-sm mb-1" />
          <div className="h-1 w-16 bg-muted-foreground/30 rounded-sm" />
        </div>
      </div>
    </div>
    <p className="text-[9px] text-muted-foreground text-center mt-2">Tap "Add" in top-right</p>
  </div>
);

const DesktopAddressBarIllustration = () => (
  <div className="bg-secondary/40 rounded-md p-4 mt-3 border border-border/40">
    <div className="bg-background rounded-md shadow-sm overflow-hidden max-w-[280px] mx-auto">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/40">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: '#ff5f57' }} />
          <div className="w-2 h-2 rounded-full" style={{ background: '#febc2e' }} />
          <div className="w-2 h-2 rounded-full" style={{ background: '#28c840' }} />
        </div>
        <div className="flex-1 flex items-center gap-2 px-2 py-1 bg-secondary/60 rounded-sm">
          <div className="h-1.5 flex-1 bg-muted-foreground/20 rounded-sm" />
          <div className="relative">
            <div className="w-3 h-3 rounded-sm border border-accent flex items-center justify-center">
              <Plus size={8} className="text-accent" strokeWidth={3} />
            </div>
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent animate-ping" />
          </div>
        </div>
      </div>
    </div>
    <p className="text-[9px] text-muted-foreground text-center mt-2">Click install icon (⊕) in address bar</p>
  </div>
);

const DesktopInstallDialogIllustration = () => (
  <div className="bg-secondary/40 rounded-md p-4 mt-3 border border-border/40">
    <div className="bg-background rounded-md shadow-sm p-3 max-w-[240px] mx-auto border border-border/40">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-md bg-accent/20 flex items-center justify-center">
          <span className="text-[8px] font-bold text-accent">A</span>
        </div>
        <div>
          <div className="text-[9px] font-semibold">Install ATTIRE?</div>
          <div className="text-[8px] text-muted-foreground">attire10.lovable.app</div>
        </div>
      </div>
      <div className="flex justify-end gap-1.5">
        <div className="px-2 py-1 text-[8px] text-muted-foreground">Cancel</div>
        <div className="px-2 py-1 text-[8px] bg-accent text-accent-foreground rounded-sm font-medium">Install</div>
      </div>
    </div>
    <p className="text-[9px] text-muted-foreground text-center mt-2">Click "Install" in the popup</p>
  </div>
);

const DesktopPinIllustration = () => (
  <div className="bg-secondary/40 rounded-md p-4 mt-3 border border-border/40">
    <div className="bg-background rounded-md shadow-sm p-3 max-w-[240px] mx-auto">
      <div className="flex items-center justify-center gap-2 py-3">
        <div className="w-8 h-8 rounded-md bg-accent/20 flex items-center justify-center">
          <span className="text-[10px] font-bold text-accent">A</span>
        </div>
        <div className="text-[10px] font-display font-bold">ATTIRE</div>
      </div>
      <div className="border-t border-border/40 pt-2 flex justify-center gap-2">
        <div className="w-5 h-5 rounded-sm bg-secondary/60" />
        <div className="w-5 h-5 rounded-sm bg-secondary/60" />
        <div className="w-5 h-5 rounded-sm bg-accent/30 border border-accent" />
      </div>
    </div>
    <p className="text-[9px] text-muted-foreground text-center mt-2">Pin to taskbar or dock</p>
  </div>
);

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
                    {
                      text: "Tap the 'Install Now' button above, or open the browser menu (⋮)",
                      illustration: <AndroidMenuIllustration />,
                    },
                    {
                      text: "Select 'Install app' or 'Add to Home screen'",
                      illustration: <AndroidInstallOptionIllustration />,
                    },
                    {
                      text: "Tap 'Install' to confirm — ATTIRE will appear on your home screen",
                      illustration: <AndroidConfirmIllustration />,
                    },
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
                      illustration: <IosShareIllustration />,
                    },
                    {
                      text: "Scroll down and tap 'Add to Home Screen'",
                      icon: <Plus size={16} className="text-accent" />,
                      illustration: <IosAddToHomeIllustration />,
                    },
                    {
                      text: "Tap 'Add' in the top-right corner to confirm",
                      illustration: <IosConfirmIllustration />,
                    },
                  ]}
                />
              )}
              {platform === "desktop" && (
                <Steps
                  title="Install on Desktop"
                  subtitle="Chrome, Edge, or Brave"
                  steps={[
                    {
                      text: "Click the 'Install Now' button above, or look for the install icon (⊕) in the address bar",
                      illustration: <DesktopAddressBarIllustration />,
                    },
                    {
                      text: "Click 'Install' in the popup dialog",
                      illustration: <DesktopInstallDialogIllustration />,
                    },
                    {
                      text: "ATTIRE will open in its own window — pin it to your taskbar or dock",
                      illustration: <DesktopPinIllustration />,
                    },
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
  steps: { text: string; icon?: React.ReactNode; illustration?: React.ReactNode }[];
}) => (
  <div>
    <h2 className="font-display text-xl md:text-2xl font-bold uppercase tracking-wider mb-1">
      {title}
    </h2>
    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-8">{subtitle}</p>
    <ol className="space-y-8">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-4 items-start">
          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-display font-bold text-sm">
            {i + 1}
          </span>
          <div className="flex-1 pt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm leading-relaxed">{step.text}</span>
              {step.icon}
            </div>
            {step.illustration}
          </div>
        </li>
      ))}
    </ol>
  </div>
);

export default Install;
