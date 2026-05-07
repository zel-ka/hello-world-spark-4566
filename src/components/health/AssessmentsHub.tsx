import { useMemo, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/hooks/use-auth";
import { useLatestAssessments, type DbAssessment } from "@/hooks/use-assessments";
import {
  ASSESSMENTS,
  riskColor,
  type AssessmentType,
  type RiskLevel,
} from "@/lib/assessments";
import { AssessmentRunner } from "./AssessmentRunner";
import {
  Salad,
  Dumbbell,
  Moon,
  Droplet,
  Brain,
  Heart,
  Shield,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  PlayCircle,
  RefreshCw,
} from "lucide-react";

const ICONS = {
  salad: Salad,
  dumbbell: Dumbbell,
  moon: Moon,
  droplet: Droplet,
  brain: Brain,
  heart: Heart,
  activity: Dumbbell,
  shield: Shield,
};

// Section A: lifestyle. Section B: disease risk.
const SECTION_A: AssessmentType[] = ["exercise", "nutrition", "sleep", "hydration"];
const SECTION_B: AssessmentType[] = ["findrisc", "heart", "cancer_lifestyle", "phq9", "gad7"];

type LevelCategory = "poor" | "moderate" | "good";

function categorize(score: number): LevelCategory {
  if (score >= 70) return "good";
  if (score >= 45) return "moderate";
  return "poor";
}

interface Props {
  initialType?: AssessmentType;
}

export function AssessmentsHub({ initialType }: Props) {
  const { t } = useI18n();
  const { user } = useAuth();
  const { data: latest = {} } = useLatestAssessments(user?.id);
  const [activeType, setActiveType] = useState<AssessmentType | null>(initialType ?? null);

  if (activeType) {
    return <AssessmentRunner type={activeType} onClose={() => setActiveType(null)} />;
  }

  // ---- Section A: aggregate lifestyle score (avg of completed) ----
  const sectionAResults = SECTION_A.map((tpe) => latest[tpe]).filter(Boolean) as DbAssessment[];
  const sectionAScore = sectionAResults.length
    ? Math.round(sectionAResults.reduce((s, r) => s + r.score, 0) / sectionAResults.length)
    : null;
  const sectionACategory = sectionAScore !== null ? categorize(sectionAScore) : null;
  const sectionAWeak = sectionAResults
    .filter((r) => r.score < 70)
    .sort((a, b) => a.score - b.score);

  // ---- Section B: highest risk wins ----
  const sectionBResults = SECTION_B.map((tpe) => latest[tpe]).filter(Boolean) as DbAssessment[];
  const sectionBHighest: RiskLevel | null = sectionBResults.length
    ? sectionBResults.some((r) => r.risk_level === "high")
      ? "high"
      : sectionBResults.some((r) => r.risk_level === "moderate")
        ? "moderate"
        : "low"
    : null;
  const sectionBHighRisks = sectionBResults.filter((r) => r.risk_level === "high");

  return (
    <div className="space-y-5 py-4 animate-fade-in">
      {/* Heading */}
      <div className="rounded-2xl frosted-glass border border-primary/20 p-4 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">{t("assess.hub.heading")}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{t("assess.hub.subtitle")}</p>
          </div>
        </div>
      </div>

      {/* SECTION A — lifestyle */}
      <SectionCard
        title={t("assess.hub.sectionA")}
        desc={t("assess.hub.sectionADesc")}
        scoreLabel={t("assess.hub.overall")}
        score={sectionAScore}
        categoryLabel={
          sectionACategory ? t(`assess.level.${sectionACategory}`) : null
        }
        categoryTone={
          sectionACategory === "good"
            ? "success"
            : sectionACategory === "moderate"
              ? "warning"
              : sectionACategory === "poor"
                ? "destructive"
                : "muted"
        }
        explanation={
          sectionACategory === "good"
            ? t("assess.hub.explainGood")
            : sectionACategory === "moderate"
              ? t("assess.hub.explainModerate")
              : sectionACategory === "poor"
                ? t("assess.hub.explainPoor")
                : null
        }
      >
        {/* Weak-area action steps */}
        {sectionAWeak.length > 0 && (
          <div className="rounded-xl border border-border/40 gradient-blue-soft p-3 space-y-2">
            <p className="text-xs font-bold text-foreground">
              {t("assess.hub.actionSteps")}
            </p>
            <ul className="space-y-1.5">
              {sectionAWeak.flatMap((r) =>
                (r.recommendations ?? []).slice(0, 2).map((k, i) => (
                  <li key={`${r.type}-${i}`} className="flex gap-2 text-xs text-foreground">
                    <span className="text-primary">•</span>
                    <span>{t(k)}</span>
                  </li>
                )),
              )}
            </ul>
          </div>
        )}

        <div className="grid gap-2">
          {SECTION_A.map((tpe) => (
            <AssessmentRow
              key={tpe}
              type={tpe}
              latest={latest[tpe]}
              onOpen={() => setActiveType(tpe)}
            />
          ))}
        </div>
      </SectionCard>

      {/* SECTION B — disease risk */}
      <SectionCard
        title={t("assess.hub.sectionB")}
        desc={t("assess.hub.sectionBDesc")}
        scoreLabel={t("assess.runner.risk")}
        score={null}
        categoryLabel={
          sectionBHighest
            ? sectionBHighest === "low"
              ? t("assess.risk.low")
              : sectionBHighest === "moderate"
                ? t("assess.risk.moderate")
                : t("assess.risk.high")
            : null
        }
        categoryTone={
          sectionBHighest === "low"
            ? "success"
            : sectionBHighest === "moderate"
              ? "warning"
              : sectionBHighest === "high"
                ? "destructive"
                : "muted"
        }
        explanation={
          sectionBHighest === "low"
            ? t("assess.hub.riskExplainLow")
            : sectionBHighest === "moderate"
              ? t("assess.hub.riskExplainModerate")
              : sectionBHighest === "high"
                ? t("assess.hub.riskExplainHigh")
                : null
        }
      >
        {/* High-risk alerts */}
        {sectionBHighRisks.length > 0 && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-3 space-y-2">
            <div className="flex items-center gap-2 text-destructive text-xs font-bold">
              <AlertTriangle className="h-4 w-4" />
              {t("assess.hub.alertHigh")}
            </div>
            <ul className="space-y-1">
              {sectionBHighRisks.map((r) => (
                <li key={r.id} className="text-xs text-foreground">
                  • {t(ASSESSMENTS[r.type].titleKey)} —{" "}
                  {(r.recommendations ?? []).slice(0, 1).map((k) => t(k)).join("")}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid gap-2">
          {SECTION_B.map((tpe) => (
            <AssessmentRow
              key={tpe}
              type={tpe}
              latest={latest[tpe]}
              onOpen={() => setActiveType(tpe)}
              showRisk
            />
          ))}
        </div>
      </SectionCard>

      <p className="text-[10px] text-muted-foreground text-center px-4 pt-2">
        {t("assess.hub.disclaimer")}
      </p>
    </div>
  );
}

// ---------- Helpers ----------

function SectionCard({
  title,
  desc,
  scoreLabel,
  score,
  categoryLabel,
  categoryTone,
  explanation,
  children,
}: {
  title: string;
  desc: string;
  scoreLabel: string;
  score: number | null;
  categoryLabel: string | null;
  categoryTone: "success" | "warning" | "destructive" | "muted";
  explanation: string | null;
  children: React.ReactNode;
}) {
  const toneClass =
    categoryTone === "success"
      ? "text-success bg-success/15 border-success/30"
      : categoryTone === "warning"
        ? "text-warning bg-warning/15 border-warning/30"
        : categoryTone === "destructive"
          ? "text-destructive bg-destructive/15 border-destructive/30"
          : "text-muted-foreground bg-muted/40 border-border/40";

  return (
    <div className="rounded-2xl frosted-glass border border-border/40 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-bold text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
        </div>
        {categoryLabel && (
          <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${toneClass}`}>
            {categoryLabel}
          </span>
        )}
      </div>

      {(score !== null || explanation) && (
        <div className="rounded-xl gradient-blue-soft border border-border/30 p-3">
          {score !== null && (
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">{score}</span>
              <span className="text-xs text-muted-foreground">/ 100 · {scoreLabel}</span>
            </div>
          )}
          {explanation && (
            <p className="text-xs text-foreground/80 mt-1.5 leading-snug">{explanation}</p>
          )}
        </div>
      )}

      {children}
    </div>
  );
}

function AssessmentRow({
  type,
  latest,
  onOpen,
  showRisk,
}: {
  type: AssessmentType;
  latest?: DbAssessment;
  onOpen: () => void;
  showRisk?: boolean;
}) {
  const { t } = useI18n();
  const def = ASSESSMENTS[type];
  const Icon = ICONS[def.icon];
  const riskLabel = latest
    ? latest.risk_level === "low"
      ? t("assess.risk.low")
      : latest.risk_level === "moderate"
        ? t("assess.risk.moderate")
        : t("assess.risk.high")
    : null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="text-left rounded-xl border border-border/40 gradient-blue-soft p-3 hover:border-primary/40 transition-all press-zoom group"
    >
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-foreground truncate">
              {t(def.titleKey)}
            </p>
            {latest ? (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0 ${riskColor(latest.risk_level)}`}>
                {showRisk ? riskLabel : `${latest.score}/100`}
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-border/40 text-muted-foreground shrink-0">
                {t("assess.hub.notTaken")}
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
            {latest
              ? (latest.recommendations ?? []).slice(0, 1).map((k) => t(k)).join("") ||
                t(def.subtitleKey)
              : t(def.subtitleKey)}
          </p>
        </div>
        <div className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
          {latest ? (
            <RefreshCw className="h-4 w-4" />
          ) : (
            <PlayCircle className="h-4 w-4" />
          )}
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </div>
    </button>
  );
}
