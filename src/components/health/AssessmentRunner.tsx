import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useI18n } from "@/hooks/useI18n";
import { useSaveAssessment } from "@/hooks/use-assessments";
import { useAuth } from "@/hooks/use-auth";
import { ASSESSMENTS, type AssessmentType, riskColor } from "@/lib/assessments";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  type: AssessmentType;
  onClose: () => void;
}

export function AssessmentRunner({ type, onClose }: Props) {
  const { t } = useI18n();
  const { user } = useAuth();
  const def = ASSESSMENTS[type];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    def.questions.forEach((q) => {
      if (q.kind === "slider") init[q.id] = q.default ?? q.min ?? 0;
    });
    return init;
  });
  const [submitting, setSubmitting] = useState(false);
  const [resultPhase, setResultPhase] = useState(false);
  const save = useSaveAssessment();

  const total = def.questions.length;
  const isLast = step === total - 1;
  const current = def.questions[step];
  const progress = Math.round(((step + (resultPhase ? 1 : 0)) / total) * 100);

  const result = useMemo(() => {
    if (!resultPhase) return null;
    return def.scorer(answers);
  }, [resultPhase, answers, def]);

  const setAnswer = (val: number) => {
    setAnswers((prev) => ({ ...prev, [current.id]: val }));
  };

  const canAdvance = current.kind === "slider" || answers[current.id] !== undefined;

  const handleNext = async () => {
    if (!isLast) {
      setStep((s) => s + 1);
      return;
    }
    // Compute and save
    if (!user?.id) {
      toast.error(t("assess.runner.loginRequired"));
      return;
    }
    setSubmitting(true);
    try {
      const r = def.scorer(answers);
      await save.mutateAsync({
        user_id: user.id,
        type,
        score: Math.round(r.score),
        raw_score: Math.round(r.raw_score),
        risk_level: r.risk_level,
        answers,
        recommendations: r.recommendationKeys,
      });
      setResultPhase(true);
    } catch (e) {
      console.error(e);
      toast.error(t("assess.runner.saveFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      onClose();
      return;
    }
    setStep((s) => s - 1);
  };

  if (resultPhase && result) {
    const riskLabel =
      result.risk_level === "low"
        ? t("assess.risk.low")
        : result.risk_level === "moderate"
          ? t("assess.risk.moderate")
          : t("assess.risk.high");
    return (
      <div className="space-y-6 py-4 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success animate-scale-in">
            <Check className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{t(def.titleKey)}</h2>
          <p className="text-sm text-muted-foreground">{t("assess.runner.resultSubtitle")}</p>
        </div>

        <div className="rounded-3xl border border-primary/20 frosted-glass p-6 text-center shadow-soft">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {t("assess.runner.score")}
          </p>
          <p className="text-5xl font-bold text-primary mt-2">{result.score}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("assess.runner.outOf100")}</p>
          <div className={`inline-flex mt-4 px-3 py-1 rounded-full text-xs font-semibold border ${riskColor(result.risk_level)}`}>
            {t("assess.runner.risk")}: {riskLabel}
          </div>
        </div>

        <div className="rounded-2xl border border-border/40 gradient-blue-soft p-4 space-y-3">
          <h3 className="text-sm font-bold text-foreground">{t("assess.runner.recommendations")}</h3>
          <ul className="space-y-2">
            {result.recommendationKeys.map((k, i) => (
              <li key={k} className="flex gap-3 items-start">
                <span className="h-5 w-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-foreground leading-snug">{t(k)}</p>
              </li>
            ))}
          </ul>
        </div>

        <Button onClick={onClose} className="w-full h-12 rounded-2xl" size="lg">
          {t("assess.runner.done")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4 animate-fade-in">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {t("assess.runner.question")} {step + 1} / {total}
          </span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <div className="space-y-5 min-h-[280px]">
        <h2 className="text-lg font-bold text-foreground leading-snug">
          {t(current.promptKey)}
        </h2>

        {current.kind === "choice" && current.options && (
          <div className="space-y-2">
            {current.options.map((opt, i) => {
              const selected = answers[current.id] === opt.value;
              return (
                <button
                  key={`${opt.labelKey}-${i}`}
                  type="button"
                  onClick={() => setAnswer(opt.value)}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-all press-zoom ${
                    selected
                      ? "border-primary bg-primary/10 shadow-soft"
                      : "border-border/40 gradient-blue-soft hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        selected ? "border-primary bg-primary" : "border-border"
                      }`}
                    >
                      {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {t(opt.labelKey)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {current.kind === "slider" && (
          <div className="space-y-6 pt-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">
                {answers[current.id] ?? current.default ?? current.min}
                <span className="text-base font-normal text-muted-foreground ml-2">
                  {current.unitKey ? t(current.unitKey) : ""}
                </span>
              </p>
            </div>
            <Slider
              value={[answers[current.id] ?? current.default ?? current.min ?? 0]}
              min={current.min ?? 0}
              max={current.max ?? 100}
              step={current.step ?? 1}
              onValueChange={(v) => setAnswer(v[0])}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{current.min ?? 0}</span>
              <span>{current.max ?? 100}</span>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex gap-3 pt-2">
        <Button
          variant="outline"
          onClick={handleBack}
          className="flex-1 h-12 rounded-2xl"
          disabled={submitting}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {step === 0 ? t("common.cancel") : t("assess.runner.back")}
        </Button>
        <Button
          onClick={handleNext}
          className="flex-1 h-12 rounded-2xl"
          disabled={!canAdvance || submitting}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {isLast ? t("assess.runner.finish") : t("assess.runner.next")}
              <ArrowRight className="h-4 w-4 ml-1" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
