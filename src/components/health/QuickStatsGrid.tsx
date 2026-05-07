import { useMemo } from "react";
import { useI18n } from "@/hooks/useI18n";
import type { DbDailyLog } from "@/hooks/use-daily-logs";
import type { DbHealthEntry } from "@/hooks/use-data";
import { Moon, Droplet, Activity, Scale, Flame } from "lucide-react";
import { getBmiCategory } from "@/lib/health";

interface Props {
  logs: DbDailyLog[]; // most recent first
  healthEntries: DbHealthEntry[]; // most recent first
  heightCm?: number;
}

export function QuickStatsGrid({ logs, healthEntries, heightCm = 170 }: Props) {
  const { t } = useI18n();

  const today = logs[0];
  const weekLogs = logs.slice(0, 7);

  const sleepAvg = useMemo(() => {
    const arr = weekLogs.map((l) => l.sleep_hours ?? 0).filter((v) => v > 0);
    return arr.length ? (arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1) : "—";
  }, [weekLogs]);

  const exerciseStreak = useMemo(() => {
    let streak = 0;
    for (const log of logs) {
      if ((log.exercise_minutes ?? 0) > 0) streak++;
      else break;
    }
    return streak;
  }, [logs]);

  const latestVital = healthEntries[0];
  const weight = latestVital?.weight ?? null;
  const prevWeight = healthEntries[6]?.weight ?? null;
  const weightDelta = weight && prevWeight ? Number((weight - prevWeight).toFixed(1)) : null;

  const bmi = weight ? Number((weight / Math.pow(heightCm / 100, 2)).toFixed(1)) : null;
  const bmiCat = bmi ? getBmiCategory(bmi) : null;

  const todaySleep = today?.sleep_hours ?? null;
  const todayWater = today?.water_glasses ?? 0;
  const todayExercise = today?.exercise_minutes ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Sleep */}
      <StatCard
        icon={<Moon className="h-4 w-4" />}
        color="text-info bg-info/15"
        label={t("stats.sleep")}
        value={todaySleep != null ? `${todaySleep}h` : "—"}
        sub={`${t("stats.avg7d")}: ${sleepAvg}h`}
      >
        <SleepBars logs={weekLogs.slice().reverse()} />
      </StatCard>

      {/* Hydration */}
      <StatCard
        icon={<Droplet className="h-4 w-4" />}
        color="text-info bg-info/15"
        label={t("stats.hydration")}
        value={`${todayWater}/8`}
        sub={`${Math.round((todayWater / 8) * 100)}% ${t("stats.ofGoal")}`}
      >
        <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-info rounded-full transition-all"
            style={{ width: `${Math.min(100, (todayWater / 8) * 100)}%` }}
          />
        </div>
      </StatCard>

      {/* Exercise */}
      <StatCard
        icon={<Activity className="h-4 w-4" />}
        color="text-success bg-success/15"
        label={t("stats.exercise")}
        value={`${todayExercise} min`}
        sub={
          exerciseStreak > 0
            ? `🔥 ${exerciseStreak} ${t("stats.dayStreak")}`
            : t("stats.startStreak")
        }
      >
        <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-success rounded-full transition-all"
            style={{ width: `${Math.min(100, (todayExercise / 30) * 100)}%` }}
          />
        </div>
      </StatCard>

      {/* Weight / BMI */}
      <StatCard
        icon={<Scale className="h-4 w-4" />}
        color="text-warning bg-warning/15"
        label={t("stats.weight")}
        value={weight != null ? `${weight} kg` : "—"}
        sub={
          bmi
            ? `${t("stats.bmi")} ${bmi} · ${bmiCat}`
            : t("stats.logVitals")
        }
      >
        {weightDelta != null && (
          <div className={`text-[10px] font-semibold mt-1 ${weightDelta > 0 ? "text-warning" : weightDelta < 0 ? "text-success" : "text-muted-foreground"}`}>
            {weightDelta > 0 ? "▲" : weightDelta < 0 ? "▼" : "•"} {Math.abs(weightDelta)} kg / 7d
          </div>
        )}
      </StatCard>
    </div>
  );
}

function StatCard({
  icon,
  color,
  label,
  value,
  sub,
  children,
}: {
  icon: React.ReactNode;
  color: string;
  label: string;
  value: string;
  sub: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl frosted-glass border border-primary/20 backdrop-blur-md p-3 shadow-soft hover-lift transition-all">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`h-7 w-7 rounded-lg flex items-center justify-center ${color}`}>{icon}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
      {children && <div className="mt-2">{children}</div>}
    </div>
  );
}

function SleepBars({ logs }: { logs: DbDailyLog[] }) {
  const max = 10;
  return (
    <div className="flex items-end justify-between gap-0.5 h-8">
      {Array.from({ length: 7 }, (_, i) => {
        const log = logs[i];
        const h = log?.sleep_hours ?? 0;
        const pct = (h / max) * 100;
        const good = h >= 7 && h <= 9;
        return (
          <div
            key={i}
            className={`flex-1 rounded-sm transition-all ${good ? "bg-success/70" : h > 0 ? "bg-warning/60" : "bg-muted/40"}`}
            style={{ height: `${Math.max(8, pct)}%` }}
          />
        );
      })}
    </div>
  );
}
