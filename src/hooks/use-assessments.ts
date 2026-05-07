import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { AssessmentType, RiskLevel } from "@/lib/assessments";

export interface DbAssessment {
  id: string;
  user_id: string;
  type: AssessmentType;
  score: number;
  raw_score: number | null;
  risk_level: RiskLevel;
  answers: Record<string, number>;
  recommendations: string[];
  created_at: string;
  updated_at: string;
}

/** All assessments for a user, most recent first. */
export function useAssessments(userId: string | undefined, limit = 50) {
  return useQuery({
    queryKey: ["assessments", userId, limit],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assessments")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as DbAssessment[];
    },
  });
}

/** Latest result per assessment type as a map. */
export function useLatestAssessments(userId: string | undefined) {
  const { data, ...rest } = useAssessments(userId, 200);
  const latest: Partial<Record<AssessmentType, DbAssessment>> = {};
  if (data) {
    for (const a of data) {
      if (!latest[a.type]) latest[a.type] = a;
    }
  }
  return { ...rest, data: latest };
}

export interface SaveAssessmentInput {
  user_id: string;
  type: AssessmentType;
  score: number;
  raw_score: number;
  risk_level: RiskLevel;
  answers: Record<string, number>;
  recommendations: string[];
}

export function useSaveAssessment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: SaveAssessmentInput) => {
      const { data, error } = await supabase
        .from("assessments")
        .insert(input)
        .select("*")
        .single();
      if (error) throw error;
      return data as unknown as DbAssessment;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["assessments", vars.user_id] });
    },
  });
}
