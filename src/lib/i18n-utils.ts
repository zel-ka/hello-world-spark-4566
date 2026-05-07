export type AppLanguage = "en" | "sw";

const dateLocaleMap: Record<AppLanguage, string> = {
  en: "en-US",
  sw: "sw-TZ",
};

const statusTranslationKeys: Record<string, string> = {
  high: "status.high",
  medium: "status.medium",
  low: "status.low",
  mild: "status.mild",
  moderate: "status.moderate",
  severe: "status.severe",
  active: "status.active",
  scheduled: "status.scheduled",
  completed: "status.completed",
  cancelled: "status.cancelled",
  normal: "status.normal",
  elevated: "status.elevated",
  hypertension: "status.hypertension",
  abnormal: "status.abnormal",
  underweight: "status.underweight",
  overweight: "status.overweight",
};

export function getDateLocale(lang: AppLanguage) {
  return dateLocaleMap[lang] ?? dateLocaleMap.en;
}

export function translateStatusLabel(
  value: string | null | undefined,
  t: (key: string) => string,
) {
  if (!value) return "";

  const translationKey = statusTranslationKeys[value.trim().toLowerCase()];
  return translationKey ? t(translationKey) : value;
}