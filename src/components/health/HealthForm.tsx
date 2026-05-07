import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAddHealthEntry } from "@/hooks/use-data";
import { useI18n } from "@/hooks/useI18n";
import { interpretAll, levelTone, type InterpretedMetric } from "@/lib/vital-signs-engine";
import { Activity, HeartPulse, Thermometer, Scale, Droplet, CalendarDays, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export interface HealthFormValues {
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  weight: number;
  bloodSugar: number;
  recordedDate: string;
}

interface HealthFormProps {
  patientId: string;
  userId: string;
  age?: number;
  heightCm?: number;
  onSaved: () => void;
}

const metricIcons: Record<InterpretedMetric["metric"], typeof Activity> = {
  bp: Activity,
  heartRate: HeartPulse,
  temperature: Thermometer,
  bmi: Scale,
  bloodSugar: Droplet,
};

function LevelIcon({ tone }: { tone: ReturnType<typeof levelTone> }) {
  if (tone === "success") return <CheckCircle2 className="h-4 w-4 text-success" />;
  if (tone === "warning") return <AlertTriangle className="h-4 w-4 text-warning" />;
  return <AlertCircle className="h-4 w-4 text-destructive" />;
}

export function HealthForm({ patientId, userId, age = 30, heightCm = 170, onSaved }: HealthFormProps) {
  const { t } = useI18n();
  const todayIso = new Date().toISOString().slice(0, 10);
  const form = useForm<HealthFormValues>({
    defaultValues: {
      systolic: 118,
      diastolic: 76,
      heartRate: 72,
      temperature: 36.7,
      weight: 72,
      bloodSugar: 0,
      recordedDate: todayIso,
    },
    mode: "onChange",
  });

  const addEntry = useAddHealthEntry();
  const v = form.watch();

  // Interpretation engine — runs every keystroke (temperature excluded)
  const interpretations = useMemo(() => {
    return interpretAll(
      {
        systolic: Number(v.systolic) || 0,
        diastolic: Number(v.diastolic) || 0,
        heart_rate: Number(v.heartRate) || 0,
        temperature: 36.6,
        weight: Number(v.weight) || 0,
        blood_sugar: Number(v.bloodSugar) > 0 ? Number(v.bloodSugar) : null,
        recorded_date: v.recordedDate,
      },
      { age, heightCm },
    ).filter((m) => m.metric !== "temperature");
  }, [v.systolic, v.diastolic, v.heartRate, v.weight, v.bloodSugar, v.recordedDate, age, heightCm]);

  const onSubmit = async (values: HealthFormValues) => {
    try {
      await addEntry.mutateAsync({
        patient_id: patientId,
        user_id: userId,
        systolic: Number(values.systolic),
        diastolic: Number(values.diastolic),
        heart_rate: Number(values.heartRate),
        temperature: Number(values.temperature),
        weight: Number(values.weight),
        blood_sugar: Number(values.bloodSugar) > 0 ? Number(values.bloodSugar) : null,
        recorded_date: values.recordedDate,
      });
      toast.success(t("health.dataSaved"));
      onSaved();
    } catch {
      toast.error(t("health.saveFailed"));
    }
  };

  return (
    <div className="group scroll-scale-in">
      <Card className="rounded-2xl frosted-glass border border-primary/25 bg-gradient-to-br from-card/95 via-card/90 to-card/85 shadow-soft backdrop-blur-md overflow-hidden">
        <CardHeader className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-foreground">{t("health.title")}</CardTitle>
              <CardDescription>{t("health.description")}</CardDescription>
            </div>
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">{t("health.structured")}</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {/* Date picker */}
              <FormField
                control={form.control}
                name="recordedDate"
                rules={{ required: true }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {t("vital.history") /* reuse: tarehe */}
                    </FormLabel>
                    <FormControl>
                      <Input type="date" max={todayIso} {...field} className="h-11 rounded-xl bg-muted/30" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 grid-cols-2">
                <FormField control={form.control} name="systolic" rules={{ required: true, min: 70, max: 250 }} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">{t("health.systolic")}</FormLabel>
                    <FormControl><Input type="number" {...field} min={70} max={250} className="h-11 rounded-xl bg-muted/30" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="diastolic" rules={{ required: true, min: 40, max: 150 }} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">{t("health.diastolic")}</FormLabel>
                    <FormControl><Input type="number" {...field} min={40} max={150} className="h-11 rounded-xl bg-muted/30" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid gap-4 grid-cols-1">
                <FormField control={form.control} name="heartRate" rules={{ required: true, min: 30, max: 220 }} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">{t("health.heartRate")}</FormLabel>
                    <FormControl><Input type="number" {...field} min={30} max={220} className="h-11 rounded-xl bg-muted/30" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <FormField control={form.control} name="weight" rules={{ required: true, min: 20, max: 300 }} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">{t("health.weight")}</FormLabel>
                    <FormControl><Input type="number" step={0.1} {...field} min={20} max={300} className="h-11 rounded-xl bg-muted/30" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="bloodSugar" rules={{ min: 0, max: 600 }} render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground font-semibold">{t("vital.bloodSugar")}</FormLabel>
                    <FormControl><Input type="number" {...field} min={0} max={600} className="h-11 rounded-xl bg-muted/30" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* === Interpretation engine === */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("vital.feedbackTitle")}
                </p>
                <div className="space-y-2">
                  {interpretations.map((m) => {
                    const Icon = metricIcons[m.metric];
                    const tone = levelTone(m.level);
                    const toneClass =
                      tone === "success"
                        ? "border-success/30 bg-success/5"
                        : tone === "warning"
                          ? "border-warning/40 bg-warning/5"
                          : "border-destructive/40 bg-destructive/5";
                    return (
                      <div key={m.metric} className={`rounded-xl border ${toneClass} p-3 flex items-start gap-3`}>
                        <Icon className="h-4 w-4 text-foreground/70 mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <p className="text-sm font-semibold text-foreground">
                              {t(`vital.metric.${m.metric}`)} · <span className="font-normal text-muted-foreground">{m.value}</span>
                            </p>
                            <span className="inline-flex items-center gap-1 text-xs font-semibold">
                              <LevelIcon tone={tone} />
                              {t(m.statusKey)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t(m.adviceKey)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button type="submit" disabled={addEntry.isPending} className="w-full h-11 rounded-xl">
                {addEntry.isPending ? t("health.saving") : t("vital.saveAndAnalyze")}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
