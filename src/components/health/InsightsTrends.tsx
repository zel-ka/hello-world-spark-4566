import { useMemo } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useAuth } from "@/hooks/use-auth";
import { useDailyLogs } from "@/hooks/use-daily-logs";
import { useAssessments } from "@/hooks/use-assessments";
import { computeHealthScore } from "@/lib/health-score";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Legend } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Props {
  /** Recent vitals snapshot (latest entry) per day if available. Optional. */
  weightHistory?: Array<{ date: string; weight: number }>;
}

export function InsightsTrends({ weightHistory = [] }: Props) {
  const { t } = useI18n();
  const { user } = useAuth();
  const userId = user?.id;
  const { data: dailyLogs = [] } = useDailyLogs(userId, 30);
  const { data: assessments = [] } = useAssessments(userId, 100);

  // Build last-14-days health score series from logs
  const scoreSeries = useMemo(() => {
    const byDate = new Map(dailyLogs.map((l) => [l.log_date, l]));
    const out: Array<{ date: string; label: string; score: number | null }> = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const log = byDate.get(iso);
      const result = log ? computeHealthScore(log, null) : null;
      out.push({
        date: iso,
        label: d.toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        score: result && result.completeness > 0 ? result.score : null,
      });
    }
    return out;
  }, [dailyLogs]);

  // Avg trend direction (last 7 vs prior 7)
  const trend = useMemo(() => {
    const valid = scoreSeries.filter((p) => p.score !== null) as { score: number }[];
    if (valid.length < 4) return { dir: "flat" as const, delta: 0 };
    const half = Math.floor(valid.length / 2);
    const a = valid.slice(0, half).reduce((s, p) => s + p.score, 0) / half;
    const b = valid.slice(half).reduce((s, p) => s + p.score, 0) / (valid.length - half);
    const delta = Math.round(b - a);
    return {
      dir: Math.abs(delta) < 3 ? ("flat" as const) : delta > 0 ? ("up" as const) : ("down" as const),
      delta,
    };
  }, [scoreSeries]);

  // Risk evolution from assessments — group by type, latest 5 each
  const riskByType = useMemo(() => {
    const groups: Record<string, Array<{ score: number; date: string; risk: string }>> = {};
    for (const a of assessments) {
      groups[a.type] = groups[a.type] ?? [];
      groups[a.type].push({
        score: a.score,
        date: new Date(a.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        risk: a.risk_level,
      });
    }
    // Sort each ascending by time and limit to last 6
    return Object.entries(groups).map(([type, items]) => ({
      type,
      items: items.slice(0, 6).reverse(),
    }));
  }, [assessments]);

  // Behavior vs outcome correlation: avg sleep vs score (last 14d)
  const behaviorData = useMemo(() => {
    return dailyLogs.slice(0, 14).map((l) => {
      const r = computeHealthScore(l, null);
      return {
        label: new Date(l.log_date).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
        sleep: l.sleep_hours ?? 0,
        water: l.water_glasses ?? 0,
        exercise: l.exercise_minutes ?? 0,
        score: r.score,
      };
    }).reverse();
  }, [dailyLogs]);

  const TrendIcon = trend.dir === "up" ? TrendingUp : trend.dir === "down" ? TrendingDown : Minus;
  const trendColor = trend.dir === "up" ? "text-success" : trend.dir === "down" ? "text-destructive" : "text-muted-foreground";

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Health Score Trend */}
      <div className="rounded-2xl frosted-glass border border-border/40 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              {t("insights.scoreTrendTitle")}
            </p>
            <p className="text-sm text-foreground font-bold mt-0.5">{t("insights.last14days")}</p>
          </div>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-bold">
              {trend.delta > 0 ? "+" : ""}
              {trend.delta}
            </span>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={scoreSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" />
              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2.5}
                dot={{ r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Behavior vs outcome */}
      {behaviorData.length >= 3 && (
        <div className="rounded-2xl frosted-glass border border-border/40 p-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            {t("insights.behaviorTitle")}
          </p>
          <p className="text-xs text-muted-foreground mb-3">{t("insights.behaviorDesc")}</p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={behaviorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="sleep" name={t("stats.sleep")} fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="exercise" name={t("stats.exercise")} fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="water" name={t("stats.hydration")} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Risk evolution */}
      {riskByType.length > 0 && (
        <div className="rounded-2xl frosted-glass border border-border/40 p-4 space-y-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {t("insights.riskEvolutionTitle")}
          </p>
          <div className="grid gap-2">
            {riskByType.map(({ type, items }) => (
              <div key={type} className="flex items-center gap-3">
                <span className="text-xs font-semibold text-foreground w-24 shrink-0 truncate">
                  {t(`assess.${type}.title`)}
                </span>
                <div className="flex-1 flex items-end gap-1 h-10">
                  {items.map((it, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-sm ${
                        it.risk === "low"
                          ? "bg-success/70"
                          : it.risk === "moderate"
                            ? "bg-warning/70"
                            : "bg-destructive/70"
                      }`}
                      style={{ height: `${Math.max(10, it.score)}%` }}
                      title={`${it.date}: ${it.score}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-mono font-bold text-foreground w-8 text-right">
                  {items[items.length - 1]?.score ?? "—"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {scoreSeries.every((p) => p.score === null) && riskByType.length === 0 && (
        <div className="text-center py-12 px-4 text-muted-foreground text-sm rounded-2xl border border-dashed border-border/60 bg-card/30">
          <p className="font-medium text-foreground mb-1">{t("insights.empty")}</p>
          <p className="text-xs">{t("insights.emptyHint")}</p>
        </div>
      )}
    </div>
  );
}
