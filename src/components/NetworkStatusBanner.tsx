import { useEffect, useState } from "react";
import { useI18n } from "@/hooks/useI18n";

export function NetworkStatusBanner() {
  const { t } = useI18n();
  const [offline, setOffline] = useState<boolean>(
    typeof navigator !== "undefined" ? !navigator.onLine : false,
  );

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-[9999]">
      <div className="w-full bg-rose-600 text-white text-sm font-medium text-center px-4 py-3 shadow-xl">
        {t("network.offlineBanner")}
      </div>
    </div>
  );
}
