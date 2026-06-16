import { useEffect, useState } from "react";

// True when the app is launched as an installed PWA (Android/iOS/desktop).
export function useIsStandalone(): boolean {
  const [standalone, setStandalone] = useState<boolean>(() => detect());

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const onChange = () => setStandalone(detect());

    if (mq.addEventListener) {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }

    if (mq.addListener) {
      mq.addListener(onChange);
      return () => mq.removeListener(onChange);
    }

    return undefined;
  }, []);

  return standalone;
}

function detect(): boolean {
  if (typeof window === "undefined") return false;
  const mq = window.matchMedia?.("(display-mode: standalone)").matches;
  // iOS Safari
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  return Boolean(mq || iosStandalone);
}
