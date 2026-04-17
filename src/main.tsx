import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

// Guard: never register SW inside Lovable preview iframe or preview hosts
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com") ||
  window.location.hostname.includes("lovable.app");

if (isPreviewHost || isInIframe) {
  // Clean up any existing service workers in preview/iframe contexts
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((r) => r.unregister());
    });
  }
} else {
  // Register only in true production deployments (custom domain)
  registerSW({
    onNeedRefresh() {
      if (confirm("New version available! Reload to update?")) {
        window.location.reload();
      }
    },
    onOfflineReady() {
      console.log("App ready to work offline");
    },
  });
}

createRoot(document.getElementById("root")!).render(<App />);
