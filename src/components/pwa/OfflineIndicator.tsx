import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [offline, setOffline] = useState<boolean>(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (!offline) return null;
  return (
    <div className="fixed top-[max(env(safe-area-inset-top),0.5rem)] left-1/2 -translate-x-1/2 z-[10000]">
      <div className="flex items-center gap-2 rounded-full bg-slate-900/90 text-white text-xs px-3 py-1.5 shadow-lg backdrop-blur">
        <WifiOff className="h-3.5 w-3.5" />
        Hauko mtandaoni — vipengele vingine havipatikani
      </div>
    </div>
  );
}
