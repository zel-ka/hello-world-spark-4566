import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/hooks/useI18n";
import { useHealthEntries, type DbHealthEntry } from "@/hooks/use-data";
import { interpretAll, levelTone } from "@/lib/vital-signs-engine";

interface VitalSignsHistoryProps {
  patientId: string;
  age?: number;
  heightCm?: number;
}

export function VitalSignsHistory({ patientId, age = 30, heightCm = 170 }: VitalSignsHistoryProps) {
  const { t } = useI18n();
  const { data: entries = [], isLoading } = useHealthEntries(patientId);

  if (isLoading) {
    return (
      <Card className="rounded-2xl border-primary/20"><CardContent className="py-10 text-center text-sm text-muted-foreground">…</CardContent></Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="rounded-2xl border-primary/20">
        <CardContent className="py-8 text-center text-sm text-muted-foreground">{t("vital.noHistory")}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-primary/20 frosted-glass">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("vital.history")}</CardTitle>
        <CardDescription>{entries.length}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {entries.slice(0, 12).map((e: DbHealthEntry) => {
          const interp = interpretAll(
            {
              systolic: e.systolic,
              diastolic: e.diastolic,
              heart_rate: e.heart_rate,
              temperature: 36.6,
              weight: Number(e.weight),
              blood_sugar: e.blood_sugar != null ? Number(e.blood_sugar) : null,
              recorded_date: e.recorded_date ?? e.created_at,
            },
            { age, heightCm },
          ).filter((m) => m.metric !== "temperature");
          const worst = interp.reduce((acc, m) => {
            const order = { normal: 0, low: 1, elevated: 1, high: 2 } as const;
            return order[m.level] > order[acc.level] ? m : acc;
          }, interp[0]);
          const tone = levelTone(worst.level);
          const toneClass =
            tone === "success"
              ? "border-success/30"
              : tone === "warning"
                ? "border-warning/40"
                : "border-destructive/40";
          return (
            <div key={e.id} className={`rounded-xl border ${toneClass} bg-card/50 p-3`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-foreground">{e.recorded_date ?? new Date(e.created_at).toLocaleDateString()}</p>
                <Badge variant="outline" className="text-[10px] capitalize">{t(`vital.level.${worst.level}`)}</Badge>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                <span>BP: <span className="font-semibold text-foreground">{e.systolic}/{e.diastolic}</span></span>
                <span>HR: <span className="font-semibold text-foreground">{e.heart_rate}</span></span>
                <span>Kg: <span className="font-semibold text-foreground">{Number(e.weight).toFixed(1)}</span></span>
                {e.blood_sugar != null && <span>Sugar: <span className="font-semibold text-foreground">{Number(e.blood_sugar)}</span></span>}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
