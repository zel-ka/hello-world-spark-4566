// Health Score system — combines self-logs + vitals into a 0-100 score.
// All weights sum to 1.0. Missing metrics redistribute weight proportionally.

export interface DailyLog {
  id?: string;
  log_date: string;
  sleep_hours: number | null;
  water_glasses: number | null;
  exercise_minutes: number | null;
  stress_level: number | null;
  meals_logged: number | null;
  mood?: string | null;
}

export interface VitalsSnapshot {
  systolic: number;
  diastolic: number;
  heart_rate: number;
}

export type ScoreCategory = "sleep" | "nutrition" | "exercise" | "hydration" | "stress" | "vitals";

const WEIGHTS: Record<ScoreCategory, number> = {
  sleep: 0.20,
  nutrition: 0.20,
  exercise: 0.20,
  hydration: 0.15,
  stress: 0.15,
  vitals: 0.10,
};

export interface SubScore {
  category: ScoreCategory;
  value: number | null; // 0-100, null if missing
  weight: number;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

export function scoreSleep(hours: number | null): number | null {
  if (hours == null) return null;
  if (hours >= 7 && hours <= 9) return 100;
  if (hours >= 6 && hours < 7) return 80;
  if (hours > 9 && hours <= 10) return 80;
  if (hours >= 5 && hours < 6) return 60;
  if (hours >= 4 && hours < 5) return 40;
  return clamp(hours * 10);
}

export function scoreNutrition(meals: number | null): number | null {
  if (meals == null) return null;
  return clamp((meals / 3) * 100);
}

export function scoreExercise(minutes: number | null): number | null {
  if (minutes == null) return null;
  return clamp((minutes / 30) * 100);
}

export function scoreHydration(glasses: number | null): number | null {
  if (glasses == null) return null;
  return clamp((glasses / 8) * 100);
}

export function scoreStress(level: number | null): number | null {
  if (level == null) return null;
  // 1 (no stress) = 100, 10 (max stress) = 10
  return clamp((11 - level) * 10);
}

export function scoreVitals(vitals: VitalsSnapshot | null): number | null {
  if (!vitals) return null;
  const { systolic, diastolic, heart_rate } = vitals;
  let score = 100;
  if (systolic >= 140 || diastolic >= 90) score -= 50;
  else if (systolic >= 130 || diastolic >= 80) score -= 25;
  if (heart_rate < 50 || heart_rate > 110) score -= 30;
  else if (heart_rate < 60 || heart_rate > 100) score -= 15;
  return clamp(score);
}

export function computeSubScores(log: DailyLog | null, vitals: VitalsSnapshot | null): SubScore[] {
  return [
    { category: "sleep", value: scoreSleep(log?.sleep_hours ?? null), weight: WEIGHTS.sleep },
    { category: "nutrition", value: scoreNutrition(log?.meals_logged ?? null), weight: WEIGHTS.nutrition },
    { category: "exercise", value: scoreExercise(log?.exercise_minutes ?? null), weight: WEIGHTS.exercise },
    { category: "hydration", value: scoreHydration(log?.water_glasses ?? null), weight: WEIGHTS.hydration },
    { category: "stress", value: scoreStress(log?.stress_level ?? null), weight: WEIGHTS.stress },
    { category: "vitals", value: scoreVitals(vitals), weight: WEIGHTS.vitals },
  ];
}

export interface HealthScoreResult {
  score: number; // 0-100, rounded
  completeness: number; // 0-100, % of metrics with data
  subScores: SubScore[];
  band: "excellent" | "good" | "needs-attention" | "take-action" | "no-data";
}

export function computeHealthScore(log: DailyLog | null, vitals: VitalsSnapshot | null): HealthScoreResult {
  const subs = computeSubScores(log, vitals);
  const present = subs.filter((s) => s.value !== null);
  const completeness = Math.round((present.length / subs.length) * 100);

  if (present.length === 0) {
    return { score: 0, completeness: 0, subScores: subs, band: "no-data" };
  }

  // Redistribute weights across present metrics
  const totalPresentWeight = present.reduce((sum, s) => sum + s.weight, 0);
  const weighted = present.reduce((sum, s) => sum + (s.value! * s.weight) / totalPresentWeight, 0);
  const score = Math.round(weighted);

  let band: HealthScoreResult["band"];
  if (score >= 80) band = "excellent";
  else if (score >= 60) band = "good";
  else if (score >= 40) band = "needs-attention";
  else band = "take-action";

  return { score, completeness, subScores: subs, band };
}

// =========== ALERTS ===========

export type AlertPriority = "low" | "medium" | "high";

export interface SmartAlert {
  id: string;
  priority: AlertPriority;
  titleKey: string;
  messageKey: string;
  icon: "moon" | "droplet" | "brain" | "activity" | "heart" | "calendar" | "scale";
}

export function generateSmartAlerts(
  recentLogs: DailyLog[], // most recent first
  latestVitals: VitalsSnapshot | null,
  weightHistory: number[] = [], // most recent first
): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const today = recentLogs[0];
  const last3 = recentLogs.slice(0, 3);
  const last2 = recentLogs.slice(0, 2);

  // Low sleep — 2+ days <6h
  if (last2.length >= 2 && last2.every((l) => (l.sleep_hours ?? 99) < 6)) {
    alerts.push({
      id: "low-sleep",
      priority: "high",
      titleKey: "smartAlert.lowSleepTitle",
      messageKey: "smartAlert.lowSleepMsg",
      icon: "moon",
    });
  }

  // Dehydration — today <4 glasses & it's after 6 PM
  const hour = new Date().getHours();
  if (today && (today.water_glasses ?? 0) < 4 && hour >= 18) {
    alerts.push({
      id: "dehydration",
      priority: "medium",
      titleKey: "smartAlert.dehydrationTitle",
      messageKey: "smartAlert.dehydrationMsg",
      icon: "droplet",
    });
  }

  // High stress pattern — 3+ days with stress >=7
  if (last3.length >= 3 && last3.every((l) => (l.stress_level ?? 0) >= 7)) {
    alerts.push({
      id: "high-stress",
      priority: "high",
      titleKey: "smartAlert.highStressTitle",
      messageKey: "smartAlert.highStressMsg",
      icon: "brain",
    });
  }

  // Sedentary — 3+ days with 0 exercise
  if (last3.length >= 3 && last3.every((l) => (l.exercise_minutes ?? 0) === 0)) {
    alerts.push({
      id: "sedentary",
      priority: "medium",
      titleKey: "smartAlert.sedentaryTitle",
      messageKey: "smartAlert.sedentaryMsg",
      icon: "activity",
    });
  }

  // BP elevated
  if (latestVitals && (latestVitals.systolic >= 130 || latestVitals.diastolic >= 80)) {
    alerts.push({
      id: "bp-elevated",
      priority: "high",
      titleKey: "smartAlert.bpElevatedTitle",
      messageKey: "smartAlert.bpElevatedMsg",
      icon: "heart",
    });
  }

  // Missed log — no entries for 2+ days
  if (recentLogs.length === 0) {
    alerts.push({
      id: "missed-log",
      priority: "low",
      titleKey: "smartAlert.missedLogTitle",
      messageKey: "smartAlert.missedLogMsg",
      icon: "calendar",
    });
  }

  // Weight change — 2kg in 7 days
  if (weightHistory.length >= 2) {
    const delta = Math.abs(weightHistory[0] - weightHistory[weightHistory.length - 1]);
    if (delta >= 2) {
      alerts.push({
        id: "weight-change",
        priority: "medium",
        titleKey: "smartAlert.weightChangeTitle",
        messageKey: "smartAlert.weightChangeMsg",
        icon: "scale",
      });
    }
  }

  // Sort by priority and cap at 3
  const order: Record<AlertPriority, number> = { high: 0, medium: 1, low: 2 };
  return alerts.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 3);
}

// =========== RECOMMENDATIONS ===========

export interface Tip {
  id: string;
  category: ScoreCategory;
  textKey: string;
}

const TIP_POOL: Tip[] = [
  // Sleep
  { id: "sleep-1", category: "sleep", textKey: "tip.sleep1" },
  { id: "sleep-2", category: "sleep", textKey: "tip.sleep2" },
  { id: "sleep-3", category: "sleep", textKey: "tip.sleep3" },
  // Hydration
  { id: "hyd-1", category: "hydration", textKey: "tip.hyd1" },
  { id: "hyd-2", category: "hydration", textKey: "tip.hyd2" },
  { id: "hyd-3", category: "hydration", textKey: "tip.hyd3" },
  // Exercise
  { id: "exe-1", category: "exercise", textKey: "tip.exe1" },
  { id: "exe-2", category: "exercise", textKey: "tip.exe2" },
  { id: "exe-3", category: "exercise", textKey: "tip.exe3" },
  // Nutrition
  { id: "nut-1", category: "nutrition", textKey: "tip.nut1" },
  { id: "nut-2", category: "nutrition", textKey: "tip.nut2" },
  { id: "nut-3", category: "nutrition", textKey: "tip.nut3" },
  // Stress
  { id: "str-1", category: "stress", textKey: "tip.str1" },
  { id: "str-2", category: "stress", textKey: "tip.str2" },
  { id: "str-3", category: "stress", textKey: "tip.str3" },
  // Vitals
  { id: "vit-1", category: "vitals", textKey: "tip.vit1" },
  { id: "vit-2", category: "vitals", textKey: "tip.vit2" },
];

export function generateRecommendations(
  subScores: SubScore[],
  shownTodayIds: string[] = [],
  count = 3,
): Tip[] {
  // Sort categories by lowest score (with data) first
  const ranked = subScores
    .filter((s) => s.value !== null)
    .sort((a, b) => (a.value! - b.value!));

  // If no data, give general starter tips
  if (ranked.length === 0) {
    return TIP_POOL.filter((t) => ["hyd-1", "exe-1", "sleep-1"].includes(t.id)).slice(0, count);
  }

  const picked: Tip[] = [];
  const usedCategories = new Set<ScoreCategory>();

  for (const sub of ranked) {
    if (picked.length >= count) break;
    if (usedCategories.has(sub.category)) continue;
    const candidates = TIP_POOL.filter(
      (t) => t.category === sub.category && !shownTodayIds.includes(t.id),
    );
    const pool = candidates.length > 0 ? candidates : TIP_POOL.filter((t) => t.category === sub.category);
    if (pool.length > 0) {
      // Rotate using day-of-year
      const idx = new Date().getDate() % pool.length;
      picked.push(pool[idx]);
      usedCategories.add(sub.category);
    }
  }

  // Fill remaining from any unused tip
  if (picked.length < count) {
    const fallback = TIP_POOL.filter(
      (t) => !picked.find((p) => p.id === t.id) && !shownTodayIds.includes(t.id),
    );
    while (picked.length < count && fallback.length > 0) {
      picked.push(fallback.shift()!);
    }
  }

  return picked;
}

export function getCategoryLabel(category: ScoreCategory, t: (k: string) => string): string {
  const map: Record<ScoreCategory, string> = {
    sleep: t("score.sleep"),
    nutrition: t("score.nutrition"),
    exercise: t("score.exercise"),
    hydration: t("score.hydration"),
    stress: t("score.stress"),
    vitals: t("score.vitals"),
  };
  return map[category];
}
