import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { DailyLog } from "@/lib/health-score";

export type DbDailyLog = DailyLog & {
  id: string;
  user_id: string;
  notes: string | null;
};

export function useDailyLogs(userId: string | undefined, days = 14) {
  return useQuery({
    queryKey: ["daily_logs", userId, days],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId!)
        .order("log_date", { ascending: false })
        .limit(days);
      if (error) throw error;
      return (data ?? []) as DbDailyLog[];
    },
  });
}

export function useTodayLog(userId: string | undefined) {
  const today = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ["daily_logs", userId, "today", today],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId!)
        .eq("log_date", today)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as DbDailyLog | null;
    },
  });
}

export interface UpsertLogInput {
  user_id: string;
  log_date?: string;
  sleep_hours?: number | null;
  water_glasses?: number | null;
  exercise_minutes?: number | null;
  stress_level?: number | null;
  meals_logged?: number | null;
  mood?: string | null;
  notes?: string | null;
}

export function useUpsertDailyLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpsertLogInput) => {
      const log_date = input.log_date ?? new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("daily_logs")
        .upsert(
          { ...input, log_date },
          { onConflict: "user_id,log_date" },
        )
        .select("*")
        .single();
      if (error) throw error;
      return data as DbDailyLog;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["daily_logs", vars.user_id], exact: false });
    },
  });
}

export function useRecordRecommendation() {
  return useMutation({
    mutationFn: async (input: { user_id: string; tip_id: string; category: string }) => {
      await supabase.from("recommendations_shown").insert({
        user_id: input.user_id,
        tip_id: input.tip_id,
        category: input.category,
      });
    },
  });
}

export function useTodayRecommendations(userId: string | undefined) {
  const today = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ["recommendations_shown", userId, today],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("recommendations_shown")
        .select("tip_id")
        .eq("user_id", userId!)
        .eq("shown_date", today);
      if (error) throw error;
      return (data ?? []).map((r) => r.tip_id);
    },
  });
}
