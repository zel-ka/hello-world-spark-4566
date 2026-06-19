import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Records one login_event per browser session so admins can chart user activity.
 * Uses sessionStorage to avoid duplicate inserts on every render or hot reload.
 */
export function useLoginTracker(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;
    const key = `login_event_logged:${userId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* ignore storage errors */
    }
    supabase.from("login_events").insert({ user_id: userId }).then(({ error }) => {
      if (error) console.warn("login_event insert failed", error.message);
    });
  }, [userId]);
}
