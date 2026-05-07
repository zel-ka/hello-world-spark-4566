// Assessment engine — questionnaires for risk screening and lifestyle.
// All assessments output: { score (0-100 normalized), raw_score, risk_level, recommendations }
// Logic kept rule-based and lightweight (MVP).

export type AssessmentType =
  | "nutrition"
  | "exercise"
  | "sleep"
  | "hydration"
  | "stress"
  | "phq9"
  | "gad7"
  | "findrisc"
  | "heart"
  | "cancer_lifestyle";

export type RiskLevel = "low" | "moderate" | "high";

export type QuestionKind = "choice" | "slider";

export interface ChoiceOption {
  labelKey: string; // i18n key
  value: number; // points contributed
}

export interface AssessmentQuestion {
  id: string;
  kind: QuestionKind;
  promptKey: string; // i18n key
  // For choice
  options?: ChoiceOption[];
  // For slider
  min?: number;
  max?: number;
  step?: number;
  default?: number;
  unitKey?: string;
  minLabelKey?: string;
  maxLabelKey?: string;
}

export interface AssessmentDefinition {
  type: AssessmentType;
  titleKey: string;
  subtitleKey: string;
  icon: "salad" | "dumbbell" | "moon" | "droplet" | "brain" | "heart" | "activity" | "shield";
  questions: AssessmentQuestion[];
  /** Returns { raw_score, score (0-100), risk_level, recommendationKeys } */
  scorer: (answers: Record<string, number>) => AssessmentResult;
}

export interface AssessmentResult {
  raw_score: number;
  score: number; // normalized 0-100 (higher = healthier / lower risk)
  risk_level: RiskLevel;
  recommendationKeys: string[];
}

// ---------- Helpers ----------
const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));
const sumAnswers = (answers: Record<string, number>) =>
  Object.values(answers).reduce((s, v) => s + (Number.isFinite(v) ? v : 0), 0);

// ============================================================
// 1. NUTRITION — Healthy Eating Index (simplified)
// ============================================================
const nutrition: AssessmentDefinition = {
  type: "nutrition",
  titleKey: "assess.nutrition.title",
  subtitleKey: "assess.nutrition.subtitle",
  icon: "salad",
  questions: [
    {
      id: "fruits_veg",
      kind: "choice",
      promptKey: "assess.nutrition.q1",
      options: [
        { labelKey: "assess.nutrition.q1.a0", value: 0 },
        { labelKey: "assess.nutrition.q1.a1", value: 5 },
        { labelKey: "assess.nutrition.q1.a2", value: 10 },
        { labelKey: "assess.nutrition.q1.a3", value: 15 },
      ],
    },
    {
      id: "whole_grains",
      kind: "choice",
      promptKey: "assess.nutrition.q2",
      options: [
        { labelKey: "assess.common.never", value: 0 },
        { labelKey: "assess.common.sometimes", value: 5 },
        { labelKey: "assess.common.often", value: 10 },
        { labelKey: "assess.common.daily", value: 15 },
      ],
    },
    {
      id: "protein",
      kind: "choice",
      promptKey: "assess.nutrition.q3",
      options: [
        { labelKey: "assess.common.never", value: 0 },
        { labelKey: "assess.common.sometimes", value: 5 },
        { labelKey: "assess.common.often", value: 10 },
        { labelKey: "assess.common.daily", value: 15 },
      ],
    },
    {
      id: "sugar_drinks",
      kind: "choice",
      promptKey: "assess.nutrition.q4",
      options: [
        { labelKey: "assess.common.never", value: 15 },
        { labelKey: "assess.common.sometimes", value: 10 },
        { labelKey: "assess.common.often", value: 5 },
        { labelKey: "assess.common.daily", value: 0 },
      ],
    },
    {
      id: "fast_food",
      kind: "choice",
      promptKey: "assess.nutrition.q5",
      options: [
        { labelKey: "assess.common.never", value: 15 },
        { labelKey: "assess.common.sometimes", value: 10 },
        { labelKey: "assess.common.often", value: 5 },
        { labelKey: "assess.common.daily", value: 0 },
      ],
    },
    {
      id: "salt",
      kind: "choice",
      promptKey: "assess.nutrition.q6",
      options: [
        { labelKey: "assess.nutrition.q6.a0", value: 15 },
        { labelKey: "assess.nutrition.q6.a1", value: 10 },
        { labelKey: "assess.nutrition.q6.a2", value: 5 },
        { labelKey: "assess.nutrition.q6.a3", value: 0 },
      ],
    },
    {
      id: "breakfast",
      kind: "choice",
      promptKey: "assess.nutrition.q7",
      options: [
        { labelKey: "assess.common.never", value: 0 },
        { labelKey: "assess.common.sometimes", value: 4 },
        { labelKey: "assess.common.often", value: 7 },
        { labelKey: "assess.common.daily", value: 10 },
      ],
    },
  ],
  scorer: (answers) => {
    const raw = sumAnswers(answers); // max ~100
    const score = clamp(raw);
    const risk: RiskLevel = score >= 70 ? "low" : score >= 45 ? "moderate" : "high";
    const recs: string[] = [];
    if ((answers.fruits_veg ?? 0) < 10) recs.push("rec.nutrition.fruitsVeg");
    if ((answers.sugar_drinks ?? 15) < 10) recs.push("rec.nutrition.lessSugar");
    if ((answers.fast_food ?? 15) < 10) recs.push("rec.nutrition.lessFastFood");
    if ((answers.salt ?? 15) < 10) recs.push("rec.nutrition.lessSalt");
    if ((answers.whole_grains ?? 0) < 10) recs.push("rec.nutrition.wholeGrains");
    if (recs.length === 0) recs.push("rec.nutrition.keepUp");
    return { raw_score: raw, score, risk_level: risk, recommendationKeys: recs.slice(0, 4) };
  },
};

// ============================================================
// 2. EXERCISE — WHO guidelines (150 min/week moderate)
// ============================================================
const exercise: AssessmentDefinition = {
  type: "exercise",
  titleKey: "assess.exercise.title",
  subtitleKey: "assess.exercise.subtitle",
  icon: "dumbbell",
  questions: [
    {
      id: "moderate_min",
      kind: "slider",
      promptKey: "assess.exercise.q1",
      min: 0,
      max: 300,
      step: 15,
      default: 60,
      unitKey: "assess.unit.minWeek",
    },
    {
      id: "vigorous_min",
      kind: "slider",
      promptKey: "assess.exercise.q2",
      min: 0,
      max: 200,
      step: 10,
      default: 0,
      unitKey: "assess.unit.minWeek",
    },
    {
      id: "strength_days",
      kind: "choice",
      promptKey: "assess.exercise.q3",
      options: [
        { labelKey: "assess.exercise.q3.a0", value: 0 },
        { labelKey: "assess.exercise.q3.a1", value: 1 },
        { labelKey: "assess.exercise.q3.a2", value: 2 },
        { labelKey: "assess.exercise.q3.a3", value: 3 },
      ],
    },
    {
      id: "sitting",
      kind: "choice",
      promptKey: "assess.exercise.q4",
      options: [
        { labelKey: "assess.exercise.q4.a0", value: 0 },
        { labelKey: "assess.exercise.q4.a1", value: 1 },
        { labelKey: "assess.exercise.q4.a2", value: 2 },
        { labelKey: "assess.exercise.q4.a3", value: 3 },
      ],
    },
  ],
  scorer: (a) => {
    const moderate = a.moderate_min ?? 0;
    const vigorous = a.vigorous_min ?? 0;
    // WHO: 150 moderate OR 75 vigorous OR equivalent. Treat 1 vig = 2 mod.
    const equivalent = moderate + vigorous * 2;
    const aerobicScore = clamp((equivalent / 150) * 70); // up to 70 pts
    const strengthScore = Math.min(20, (a.strength_days ?? 0) * 7); // up to 21
    const sittingPenalty = (a.sitting ?? 0) * 3; // up to 9 deduction
    const score = clamp(aerobicScore + strengthScore - sittingPenalty + 10);
    const risk: RiskLevel = score >= 70 ? "low" : score >= 40 ? "moderate" : "high";
    const recs: string[] = [];
    if (equivalent < 150) recs.push("rec.exercise.aerobic");
    if ((a.strength_days ?? 0) < 2) recs.push("rec.exercise.strength");
    if ((a.sitting ?? 0) >= 2) recs.push("rec.exercise.lessSitting");
    if (recs.length === 0) recs.push("rec.exercise.keepUp");
    return { raw_score: equivalent, score, risk_level: risk, recommendationKeys: recs };
  },
};

// ============================================================
// 3. SLEEP — Pittsburgh-inspired (simplified PSQI)
// ============================================================
const sleep: AssessmentDefinition = {
  type: "sleep",
  titleKey: "assess.sleep.title",
  subtitleKey: "assess.sleep.subtitle",
  icon: "moon",
  questions: [
    {
      id: "duration",
      kind: "slider",
      promptKey: "assess.sleep.q1",
      min: 3,
      max: 12,
      step: 0.5,
      default: 7,
      unitKey: "assess.unit.hours",
    },
    {
      id: "latency",
      kind: "choice",
      promptKey: "assess.sleep.q2",
      options: [
        { labelKey: "assess.sleep.q2.a0", value: 0 },
        { labelKey: "assess.sleep.q2.a1", value: 1 },
        { labelKey: "assess.sleep.q2.a2", value: 2 },
        { labelKey: "assess.sleep.q2.a3", value: 3 },
      ],
    },
    {
      id: "wake",
      kind: "choice",
      promptKey: "assess.sleep.q3",
      options: [
        { labelKey: "assess.common.never", value: 0 },
        { labelKey: "assess.common.sometimes", value: 1 },
        { labelKey: "assess.common.often", value: 2 },
        { labelKey: "assess.common.daily", value: 3 },
      ],
    },
    {
      id: "quality",
      kind: "choice",
      promptKey: "assess.sleep.q4",
      options: [
        { labelKey: "assess.sleep.q4.a0", value: 0 },
        { labelKey: "assess.sleep.q4.a1", value: 1 },
        { labelKey: "assess.sleep.q4.a2", value: 2 },
        { labelKey: "assess.sleep.q4.a3", value: 3 },
      ],
    },
    {
      id: "daytime",
      kind: "choice",
      promptKey: "assess.sleep.q5",
      options: [
        { labelKey: "assess.common.never", value: 0 },
        { labelKey: "assess.common.sometimes", value: 1 },
        { labelKey: "assess.common.often", value: 2 },
        { labelKey: "assess.common.daily", value: 3 },
      ],
    },
  ],
  scorer: (a) => {
    const duration = a.duration ?? 7;
    let durationPts = 0;
    if (duration < 5) durationPts = 3;
    else if (duration < 6) durationPts = 2;
    else if (duration < 7 || duration > 9) durationPts = 1;
    const raw =
      durationPts +
      (a.latency ?? 0) +
      (a.wake ?? 0) +
      (a.quality ?? 0) +
      (a.daytime ?? 0); // 0-15
    // Higher raw = worse. Invert.
    const score = clamp(100 - (raw / 15) * 100);
    const risk: RiskLevel = score >= 70 ? "low" : score >= 40 ? "moderate" : "high";
    const recs: string[] = [];
    if (duration < 7) recs.push("rec.sleep.duration");
    if ((a.latency ?? 0) >= 2) recs.push("rec.sleep.latency");
    if ((a.wake ?? 0) >= 2) recs.push("rec.sleep.wake");
    if ((a.quality ?? 0) >= 2) recs.push("rec.sleep.quality");
    if (recs.length === 0) recs.push("rec.sleep.keepUp");
    return { raw_score: raw, score, risk_level: risk, recommendationKeys: recs };
  },
};

// ============================================================
// 4. HYDRATION — intake + urine color scale
// ============================================================
const hydration: AssessmentDefinition = {
  type: "hydration",
  titleKey: "assess.hydration.title",
  subtitleKey: "assess.hydration.subtitle",
  icon: "droplet",
  questions: [
    {
      id: "glasses",
      kind: "slider",
      promptKey: "assess.hydration.q1",
      min: 0,
      max: 16,
      step: 1,
      default: 6,
      unitKey: "assess.unit.glasses",
    },
    {
      id: "urine_color",
      kind: "choice",
      promptKey: "assess.hydration.q2",
      options: [
        { labelKey: "assess.hydration.q2.a0", value: 100 }, // pale = great
        { labelKey: "assess.hydration.q2.a1", value: 80 },
        { labelKey: "assess.hydration.q2.a2", value: 50 },
        { labelKey: "assess.hydration.q2.a3", value: 20 }, // dark = bad
      ],
    },
    {
      id: "thirst",
      kind: "choice",
      promptKey: "assess.hydration.q3",
      options: [
        { labelKey: "assess.common.never", value: 100 },
        { labelKey: "assess.common.sometimes", value: 70 },
        { labelKey: "assess.common.often", value: 40 },
        { labelKey: "assess.common.daily", value: 10 },
      ],
    },
  ],
  scorer: (a) => {
    const glasses = a.glasses ?? 0;
    const intakeScore = clamp((glasses / 8) * 100);
    const urineScore = a.urine_color ?? 50;
    const thirstScore = a.thirst ?? 50;
    const score = Math.round(intakeScore * 0.5 + urineScore * 0.3 + thirstScore * 0.2);
    const risk: RiskLevel = score >= 70 ? "low" : score >= 45 ? "moderate" : "high";
    const recs: string[] = [];
    if (glasses < 8) recs.push("rec.hydration.moreWater");
    if ((a.urine_color ?? 100) <= 50) recs.push("rec.hydration.urineDark");
    if ((a.thirst ?? 100) <= 40) recs.push("rec.hydration.thirstFreq");
    if (recs.length === 0) recs.push("rec.hydration.keepUp");
    return { raw_score: glasses, score, risk_level: risk, recommendationKeys: recs };
  },
};

// ============================================================
// 5. STRESS — perceived stress (simplified PSS)
// ============================================================
const stress: AssessmentDefinition = {
  type: "stress",
  titleKey: "assess.stress.title",
  subtitleKey: "assess.stress.subtitle",
  icon: "brain",
  questions: [
    { id: "overwhelmed", kind: "choice", promptKey: "assess.stress.q1", options: scaleOptions("rev") },
    { id: "control", kind: "choice", promptKey: "assess.stress.q2", options: scaleOptions("fwd") },
    { id: "irritable", kind: "choice", promptKey: "assess.stress.q3", options: scaleOptions("rev") },
    { id: "rest_quality", kind: "choice", promptKey: "assess.stress.q4", options: scaleOptions("fwd") },
    { id: "coping", kind: "choice", promptKey: "assess.stress.q5", options: scaleOptions("fwd") },
  ],
  scorer: (a) => {
    const raw = sumAnswers(a); // 0-20
    const score = clamp((raw / 20) * 100);
    const risk: RiskLevel = score >= 70 ? "low" : score >= 40 ? "moderate" : "high";
    const recs: string[] = [];
    if (score < 70) recs.push("rec.stress.breath");
    if (score < 60) recs.push("rec.stress.walk");
    if (score < 50) recs.push("rec.stress.talk");
    if (score < 40) recs.push("rec.stress.professional");
    if (recs.length === 0) recs.push("rec.stress.keepUp");
    return { raw_score: raw, score, risk_level: risk, recommendationKeys: recs };
  },
};

function scaleOptions(direction: "fwd" | "rev"): ChoiceOption[] {
  // fwd: never=4, daily=0; rev: never=0, daily=4
  return [
    { labelKey: "assess.common.never", value: direction === "fwd" ? 4 : 0 },
    { labelKey: "assess.common.sometimes", value: direction === "fwd" ? 3 : 1 },
    { labelKey: "assess.common.often", value: direction === "fwd" ? 1 : 3 },
    { labelKey: "assess.common.daily", value: direction === "fwd" ? 0 : 4 },
  ];
}

// ============================================================
// 6. PHQ-9 — depression screening
// ============================================================
const phq9Options: ChoiceOption[] = [
  { labelKey: "assess.phq9.opt0", value: 0 },
  { labelKey: "assess.phq9.opt1", value: 1 },
  { labelKey: "assess.phq9.opt2", value: 2 },
  { labelKey: "assess.phq9.opt3", value: 3 },
];

const phq9: AssessmentDefinition = {
  type: "phq9",
  titleKey: "assess.phq9.title",
  subtitleKey: "assess.phq9.subtitle",
  icon: "brain",
  questions: Array.from({ length: 9 }, (_, i) => ({
    id: `q${i + 1}`,
    kind: "choice" as QuestionKind,
    promptKey: `assess.phq9.q${i + 1}`,
    options: phq9Options,
  })),
  scorer: (a) => {
    const raw = sumAnswers(a); // 0-27
    // Higher raw = more depressive symptoms. Invert for normalized score.
    const score = clamp(100 - (raw / 27) * 100);
    let risk: RiskLevel = "low";
    if (raw >= 15) risk = "high"; // moderately severe + severe
    else if (raw >= 10) risk = "moderate";
    const recs: string[] = [];
    if (raw >= 5) recs.push("rec.phq9.selfCare");
    if (raw >= 10) recs.push("rec.phq9.support");
    if (raw >= 15) recs.push("rec.phq9.professional");
    if ((a.q9 ?? 0) > 0) recs.unshift("rec.phq9.urgent"); // suicidal ideation flag
    if (recs.length === 0) recs.push("rec.phq9.keepUp");
    return { raw_score: raw, score, risk_level: risk, recommendationKeys: recs };
  },
};

// ============================================================
// 7. GAD-7 — anxiety screening
// ============================================================
const gad7: AssessmentDefinition = {
  type: "gad7",
  titleKey: "assess.gad7.title",
  subtitleKey: "assess.gad7.subtitle",
  icon: "brain",
  questions: Array.from({ length: 7 }, (_, i) => ({
    id: `q${i + 1}`,
    kind: "choice" as QuestionKind,
    promptKey: `assess.gad7.q${i + 1}`,
    options: phq9Options, // same 0-3 scale
  })),
  scorer: (a) => {
    const raw = sumAnswers(a); // 0-21
    const score = clamp(100 - (raw / 21) * 100);
    let risk: RiskLevel = "low";
    if (raw >= 15) risk = "high";
    else if (raw >= 10) risk = "moderate";
    else if (raw >= 5) risk = "moderate";
    const recs: string[] = [];
    if (raw >= 5) recs.push("rec.gad7.breathing");
    if (raw >= 10) recs.push("rec.gad7.support");
    if (raw >= 15) recs.push("rec.gad7.professional");
    if (recs.length === 0) recs.push("rec.gad7.keepUp");
    return { raw_score: raw, score, risk_level: risk, recommendationKeys: recs };
  },
};

// ============================================================
// 8. FINDRISC — diabetes risk
// ============================================================
const findrisc: AssessmentDefinition = {
  type: "findrisc",
  titleKey: "assess.findrisc.title",
  subtitleKey: "assess.findrisc.subtitle",
  icon: "shield",
  questions: [
    {
      id: "age",
      kind: "choice",
      promptKey: "assess.findrisc.age",
      options: [
        { labelKey: "assess.findrisc.age.a0", value: 0 },
        { labelKey: "assess.findrisc.age.a1", value: 2 },
        { labelKey: "assess.findrisc.age.a2", value: 3 },
        { labelKey: "assess.findrisc.age.a3", value: 4 },
      ],
    },
    {
      id: "bmi",
      kind: "choice",
      promptKey: "assess.findrisc.bmi",
      options: [
        { labelKey: "assess.findrisc.bmi.a0", value: 0 },
        { labelKey: "assess.findrisc.bmi.a1", value: 1 },
        { labelKey: "assess.findrisc.bmi.a2", value: 3 },
      ],
    },
    {
      id: "waist",
      kind: "choice",
      promptKey: "assess.findrisc.waist",
      options: [
        { labelKey: "assess.findrisc.waist.a0", value: 0 },
        { labelKey: "assess.findrisc.waist.a1", value: 3 },
        { labelKey: "assess.findrisc.waist.a2", value: 4 },
      ],
    },
    {
      id: "exercise",
      kind: "choice",
      promptKey: "assess.findrisc.exercise",
      options: [
        { labelKey: "assess.findrisc.exercise.yes", value: 0 },
        { labelKey: "assess.findrisc.exercise.no", value: 2 },
      ],
    },
    {
      id: "veg",
      kind: "choice",
      promptKey: "assess.findrisc.veg",
      options: [
        { labelKey: "assess.findrisc.veg.daily", value: 0 },
        { labelKey: "assess.findrisc.veg.notdaily", value: 1 },
      ],
    },
    {
      id: "bp_meds",
      kind: "choice",
      promptKey: "assess.findrisc.bp",
      options: [
        { labelKey: "assess.common.no", value: 0 },
        { labelKey: "assess.common.yes", value: 2 },
      ],
    },
    {
      id: "high_glucose",
      kind: "choice",
      promptKey: "assess.findrisc.glucose",
      options: [
        { labelKey: "assess.common.no", value: 0 },
        { labelKey: "assess.common.yes", value: 5 },
      ],
    },
    {
      id: "family",
      kind: "choice",
      promptKey: "assess.findrisc.family",
      options: [
        { labelKey: "assess.findrisc.family.no", value: 0 },
        { labelKey: "assess.findrisc.family.distant", value: 3 },
        { labelKey: "assess.findrisc.family.close", value: 5 },
      ],
    },
  ],
  scorer: (a) => {
    const raw = sumAnswers(a); // 0-26
    const score = clamp(100 - (raw / 26) * 100);
    let risk: RiskLevel = "low";
    if (raw >= 15) risk = "high";
    else if (raw >= 7) risk = "moderate";
    const recs: string[] = [];
    if ((a.bmi ?? 0) >= 1) recs.push("rec.findrisc.weight");
    if ((a.exercise ?? 0) >= 2) recs.push("rec.findrisc.exercise");
    if ((a.veg ?? 0) >= 1) recs.push("rec.findrisc.veg");
    if (raw >= 12) recs.push("rec.findrisc.test");
    if (recs.length === 0) recs.push("rec.findrisc.keepUp");
    return { raw_score: raw, score, risk_level: risk, recommendationKeys: recs };
  },
};

// ============================================================
// 9. HEART DISEASE — lifestyle-only screening
// ============================================================
const heart: AssessmentDefinition = {
  type: "heart",
  titleKey: "assess.heart.title",
  subtitleKey: "assess.heart.subtitle",
  icon: "heart",
  questions: [
    {
      id: "smoking",
      kind: "choice",
      promptKey: "assess.heart.smoking",
      options: [
        { labelKey: "assess.heart.smoking.never", value: 0 },
        { labelKey: "assess.heart.smoking.former", value: 2 },
        { labelKey: "assess.heart.smoking.current", value: 5 },
      ],
    },
    {
      id: "bp_high",
      kind: "choice",
      promptKey: "assess.heart.bp",
      options: [
        { labelKey: "assess.common.no", value: 0 },
        { labelKey: "assess.common.yes", value: 4 },
      ],
    },
    {
      id: "cholesterol",
      kind: "choice",
      promptKey: "assess.heart.chol",
      options: [
        { labelKey: "assess.common.no", value: 0 },
        { labelKey: "assess.common.unknown", value: 1 },
        { labelKey: "assess.common.yes", value: 4 },
      ],
    },
    {
      id: "diabetes",
      kind: "choice",
      promptKey: "assess.heart.diabetes",
      options: [
        { labelKey: "assess.common.no", value: 0 },
        { labelKey: "assess.common.yes", value: 4 },
      ],
    },
    {
      id: "family_heart",
      kind: "choice",
      promptKey: "assess.heart.family",
      options: [
        { labelKey: "assess.common.no", value: 0 },
        { labelKey: "assess.common.yes", value: 3 },
      ],
    },
    {
      id: "activity",
      kind: "choice",
      promptKey: "assess.heart.activity",
      options: [
        { labelKey: "assess.heart.activity.active", value: 0 },
        { labelKey: "assess.heart.activity.moderate", value: 2 },
        { labelKey: "assess.heart.activity.sedentary", value: 4 },
      ],
    },
  ],
  scorer: (a) => {
    const raw = sumAnswers(a); // 0-24
    const score = clamp(100 - (raw / 24) * 100);
    let risk: RiskLevel = "low";
    if (raw >= 12) risk = "high";
    else if (raw >= 6) risk = "moderate";
    const recs: string[] = [];
    if ((a.smoking ?? 0) >= 2) recs.push("rec.heart.quitSmoking");
    if ((a.bp_high ?? 0) > 0) recs.push("rec.heart.bp");
    if ((a.cholesterol ?? 0) > 0) recs.push("rec.heart.chol");
    if ((a.activity ?? 0) >= 2) recs.push("rec.heart.activity");
    if (raw >= 10) recs.push("rec.heart.consult");
    if (recs.length === 0) recs.push("rec.heart.keepUp");
    return { raw_score: raw, score, risk_level: risk, recommendationKeys: recs };
  },
};

// ============================================================
// 10. CANCER LIFESTYLE — lifestyle indicators only (NOT diagnostic)
// ============================================================
const cancer: AssessmentDefinition = {
  type: "cancer_lifestyle",
  titleKey: "assess.cancer.title",
  subtitleKey: "assess.cancer.subtitle",
  icon: "shield",
  questions: [
    {
      id: "tobacco",
      kind: "choice",
      promptKey: "assess.cancer.tobacco",
      options: [
        { labelKey: "assess.heart.smoking.never", value: 0 },
        { labelKey: "assess.heart.smoking.former", value: 2 },
        { labelKey: "assess.heart.smoking.current", value: 5 },
      ],
    },
    {
      id: "alcohol",
      kind: "choice",
      promptKey: "assess.cancer.alcohol",
      options: [
        { labelKey: "assess.common.never", value: 0 },
        { labelKey: "assess.common.sometimes", value: 1 },
        { labelKey: "assess.common.often", value: 3 },
        { labelKey: "assess.common.daily", value: 5 },
      ],
    },
    {
      id: "processed_meat",
      kind: "choice",
      promptKey: "assess.cancer.processed",
      options: [
        { labelKey: "assess.common.never", value: 0 },
        { labelKey: "assess.common.sometimes", value: 1 },
        { labelKey: "assess.common.often", value: 3 },
        { labelKey: "assess.common.daily", value: 4 },
      ],
    },
    {
      id: "sun",
      kind: "choice",
      promptKey: "assess.cancer.sun",
      options: [
        { labelKey: "assess.cancer.sun.protected", value: 0 },
        { labelKey: "assess.cancer.sun.sometimes", value: 2 },
        { labelKey: "assess.cancer.sun.unprotected", value: 4 },
      ],
    },
    {
      id: "screening",
      kind: "choice",
      promptKey: "assess.cancer.screening",
      options: [
        { labelKey: "assess.common.yes", value: 0 },
        { labelKey: "assess.common.no", value: 3 },
      ],
    },
    {
      id: "family_cancer",
      kind: "choice",
      promptKey: "assess.cancer.family",
      options: [
        { labelKey: "assess.common.no", value: 0 },
        { labelKey: "assess.common.yes", value: 3 },
      ],
    },
  ],
  scorer: (a) => {
    const raw = sumAnswers(a); // 0-24
    const score = clamp(100 - (raw / 24) * 100);
    let risk: RiskLevel = "low";
    if (raw >= 12) risk = "high";
    else if (raw >= 6) risk = "moderate";
    const recs: string[] = [];
    if ((a.tobacco ?? 0) >= 2) recs.push("rec.cancer.tobacco");
    if ((a.alcohol ?? 0) >= 3) recs.push("rec.cancer.alcohol");
    if ((a.processed_meat ?? 0) >= 3) recs.push("rec.cancer.processed");
    if ((a.sun ?? 0) >= 2) recs.push("rec.cancer.sun");
    if ((a.screening ?? 0) >= 3) recs.push("rec.cancer.screening");
    if (recs.length === 0) recs.push("rec.cancer.keepUp");
    return { raw_score: raw, score, risk_level: risk, recommendationKeys: recs };
  },
};

// ============================================================
// REGISTRY
// ============================================================
export const ASSESSMENTS: Record<AssessmentType, AssessmentDefinition> = {
  nutrition,
  exercise,
  sleep,
  hydration,
  stress,
  phq9,
  gad7,
  findrisc,
  heart,
  cancer_lifestyle: cancer,
};

export const ASSESSMENT_ORDER: AssessmentType[] = [
  "nutrition",
  "exercise",
  "sleep",
  "hydration",
  "stress",
  "phq9",
  "gad7",
  "findrisc",
  "heart",
  "cancer_lifestyle",
];

export function getAssessment(type: AssessmentType): AssessmentDefinition {
  return ASSESSMENTS[type];
}

export function riskColor(risk: RiskLevel): string {
  switch (risk) {
    case "low":
      return "text-success bg-success/15 border-success/30";
    case "moderate":
      return "text-warning bg-warning/15 border-warning/30";
    case "high":
      return "text-destructive bg-destructive/15 border-destructive/30";
  }
}
