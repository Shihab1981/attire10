import { WifiOff, RefreshCw } from "lucide-react";

const Offline = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/60 mb-8">
          <WifiOff size={36} strokeWidth={1.5} className="text-accent" />
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-extrabold tracking-[0.1em] uppercase mb-4">
          You're Offline
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          It looks like you've lost your internet connection. Check your network and try again.
          Some previously viewed pages may still be available.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background hover:bg-accent transition-colors text-[11px] font-medium tracking-[0.2em] uppercase rounded-sm"
        >
          <RefreshCw size={14} strokeWidth={2} />
          Try Again
        </button>
        <div className="mt-12 pt-8 border-t border-border/40">
          <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground/70 font-medium">
            ATTIRE
          </p>
        </div>
      </div>
    </div>
  );
};

export default Offline;
