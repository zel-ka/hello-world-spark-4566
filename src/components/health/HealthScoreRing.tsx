import { useMemo } from "react";
import { useI18n } from "@/hooks/useI18n";
import type { HealthScoreResult } from "@/lib/health-score";
import { getCategoryLabel } from "@/lib/health-score";
import { Sparkles } from "lucide-react";

interface Props {
  result: HealthScoreResult;
}

const BAND_STYLE: Record<HealthScoreResult["band"], { text: string; ring: string; bg: string; labelKey: string }> = {
  excellent: { text: "text-success", ring: "stroke-success", bg: "from-success/20 to-success/5", labelKey: "score.bandExcellent" },
  good: { text: "text-primary", ring: "stroke-primary", bg: "from-primary/20 to-primary/5", labelKey: "score.bandGood" },
  "needs-attention": { text: "text-warning", ring: "stroke-warning", bg: "from-warning/20 to-warning/5", labelKey: "score.bandNeedsAttention" },
  "take-action": { text: "text-destructive", ring: "stroke-destructive", bg: "from-destructive/20 to-destructive/5", labelKey: "score.bandTakeAction" },
  "no-data": { text: "text-muted-foreground", ring: "stroke-muted-foreground", bg: "from-muted/40 to-muted/10", labelKey: "score.bandNoData" },
};

export function HealthScoreRing({ result }: Props) {
  const { t } = useI18n();
  const style = BAND_STYLE[result.band];
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = useMemo(() => circumference - (result.score / 100) * circumference, [result.score, circumference]);

  // Find the weakest sub-score for hint
  const weakest = result.subScores
    .filter((s) => s.value !== null)
    .sort((a, b) => (a.value! - b.value!))[0];

  return (
    <div className={`relative rounded-3xl frosted-glass border border-primary/20 backdrop-blur-md px-4 py-2.5 bg-gradient-to-br ${style.bg} shadow-soft overflow-hidden`}>
      <div className="!absolute -top-12 -right-12 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="relative flex items-start gap-4">
        {/* Ring */}
        <div className="relative shrink-0 leading-none h-[150px] w-[150px] sm:h-[158px] sm:w-[158px]">
          <svg viewBox="0 0 170 170" className="-rotate-90 block h-full w-full">
            <circle cx="85" cy="85" r={radius} className="stroke-muted/30" strokeWidth="10" fill="none" />
            <circle
              cx="85"
              cy="85"
              r={radius}
              className={`${style.ring} transition-all duration-1000 ease-out`}
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ filter: "drop-shadow(0 0 8px currentColor)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-4xl font-extrabold ${style.text}`}>
              {result.band === "no-data" ? "—" : result.score}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {t("score.outOf")}
            </span>
          </div>
        </div>

        {/* Right side info */}
        <div className="flex-1 min-w-0 pt-1.5">
          <div className="flex items-center gap-1.5">
            <Sparkles className={`h-4 w-4 ${style.text}`} />
            <p className={`text-sm font-bold ${style.text}`}>{t(style.labelKey)}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {result.band === "no-data"
              ? t("score.noDataHint")
              : weakest
                ? `${t("score.focusOn")}: ${getCategoryLabel(weakest.category, t)}`
                : t("score.keepItUp")}
          </p>

          {/* Completeness */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
              <span>{t("score.dataCompleteness")}</span>
              <span className="font-semibold">{result.completeness}%</span>
            </div>
            <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-700"
                style={{ width: `${result.completeness}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
