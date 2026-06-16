import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerPWA } from "./pwa/registerSW";

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker after the app mounts (guarded; no-op in preview/dev).
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    void registerPWA();
  });
}
