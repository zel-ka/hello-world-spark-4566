import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Tracks the current local date (YYYY-MM-DD).
 * When the day rolls over (midnight), it:
 *  - updates state so consumers re-render
 *  - invalidates daily_logs + recommendations_shown queries so today's data refreshes
 *  - also re-checks when the tab becomes visible again (catches devices that slept through midnight)
 */
export function useDayChange() {
  const qc = useQueryClient();
  const [today, setToday] = useState<string>(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    const refreshIfDayChanged = () => {
      const now = new Date().toISOString().slice(0, 10);
      setToday((prev) => {
        if (prev !== now) {
          qc.invalidateQueries({ queryKey: ["daily_logs"] });
          qc.invalidateQueries({ queryKey: ["recommendations_shown"] });
          return now;
        }
        return prev;
      });
    };

    // Schedule a timer for the next midnight, then every minute as a safety net
    const msUntilMidnight = () => {
      const n = new Date();
      const next = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1, 0, 0, 1);
      return next.getTime() - n.getTime();
    };

    let interval: ReturnType<typeof setInterval> | null = null;
    const midnightTimeout = setTimeout(() => {
      refreshIfDayChanged();
      interval = setInterval(refreshIfDayChanged, 60_000);
    }, msUntilMidnight());

    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshIfDayChanged();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", refreshIfDayChanged);

    return () => {
      clearTimeout(midnightTimeout);
      if (interval) clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", refreshIfDayChanged);
    };
  }, [qc]);

  return today;
}
