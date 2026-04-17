import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
      setTimeout(() => setShowReconnected(false), 3000);
    };
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline-banner"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-destructive text-destructive-foreground"
        >
          <div className="container flex items-center justify-center gap-2 py-2 text-[11px] tracking-[0.15em] uppercase font-medium">
            <WifiOff size={14} strokeWidth={2} />
            <span>You are offline — Some features may be unavailable</span>
          </div>
        </motion.div>
      )}
      {isOnline && showReconnected && (
        <motion.div
          key="online-banner"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[100] bg-accent text-accent-foreground"
        >
          <div className="container flex items-center justify-center gap-2 py-2 text-[11px] tracking-[0.15em] uppercase font-medium">
            <Wifi size={14} strokeWidth={2} />
            <span>Back online</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;
