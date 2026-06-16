// Guarded service-worker registration. Never registers in Lovable preview/dev.
import { toast } from "sonner";

const SW_URL = "/sw.js";

function shouldSkip(): boolean {
  if (!import.meta.env.PROD) return true;
  if (typeof window === "undefined") return true;
  try {
    if (window.self !== window.top) return true; // iframe (Lovable preview)
  } catch {
    return true;
  }
  const host = window.location.hostname;
  if (
    host.startsWith("id-preview--") ||
    host.startsWith("preview--") ||
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev")
  ) {
    return true;
  }
  if (new URLSearchParams(window.location.search).get("sw") === "off") return true;
  return false;
}

async function unregisterMatching() {
  if (!("serviceWorker" in navigator)) return;
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => r.active?.scriptURL.endsWith(SW_URL) || r.installing?.scriptURL.endsWith(SW_URL) || r.waiting?.scriptURL.endsWith(SW_URL))
        .map((r) => r.unregister()),
    );
  } catch {
    /* noop */
  }
}

export async function registerPWA() {
  if (shouldSkip()) {
    await unregisterMatching();
    return;
  }
  if (!("serviceWorker" in navigator)) return;

  try {
    const { Workbox } = await import("workbox-window");
    const wb = new Workbox(SW_URL, { scope: "/" });

    wb.addEventListener("waiting", () => {
      toast("Toleo jipya linapatikana", {
        description: "Bonyeza ili kuonyesha sasisho jipya.",
        action: {
          label: "Onyesha upya",
          onClick: () => {
            wb.addEventListener("controlling", () => window.location.reload());
            wb.messageSkipWaiting();
          },
        },
        duration: 10000,
      });
    });

    await wb.register();
  } catch (err) {
    console.warn("[pwa] registration failed", err);
  }
}
