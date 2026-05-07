import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import { useUpsertDailyLog, type DbDailyLog } from "@/hooks/use-daily-logs";
import { toast } from "sonner";
import { Moon, Droplet, Activity, Brain, Utensils, Loader2 } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  existing: DbDailyLog | null;
}

export function QuickLogSheet({ open, onOpenChange, userId, existing }: Props) {
  const { t } = useI18n();
  const upsert = useUpsertDailyLog();

  const [sleep, setSleep] = useState<number>(7);
  const [water, setWater] = useState<number>(0);
  const [exercise, setExercise] = useState<number>(0);
  const [stress, setStress] = useState<number>(5);
  const [meals, setMeals] = useState<number>(0);

  useEffect(() => {
    if (existing) {
      setSleep(existing.sleep_hours ?? 7);
      setWater(existing.water_glasses ?? 0);
      setExercise(existing.exercise_minutes ?? 0);
      setStress(existing.stress_level ?? 5);
      setMeals(existing.meals_logged ?? 0);
    }
  }, [existing, open]);

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({
        user_id: userId,
        sleep_hours: sleep,
        water_glasses: water,
        exercise_minutes: exercise,
        stress_level: stress,
        meals_logged: meals,
      });
      toast.success(t("quickLog.saved"));
      onOpenChange(false);
    } catch (e) {
      toast.error(t("quickLog.error"));
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="w-full rounded-t-3xl max-h-[90vh] overflow-y-auto premium-card">
        <SheetHeader className="text-left">
          <SheetTitle className="text-xl">{t("quickLog.title")}</SheetTitle>
          <p className="text-xs text-muted-foreground">{t("quickLog.subtitle")}</p>
        </SheetHeader>

        <div className="space-y-5 mt-4">
          {/* Sleep */}
          <Field icon={<Moon className="h-4 w-4" />} label={t("quickLog.sleep")} value={`${sleep}h`}>
            <input
              type="range"
              min={0}
              max={12}
              step={0.5}
              value={sleep}
              onChange={(e) => setSleep(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </Field>

          {/* Water */}
          <Field icon={<Droplet className="h-4 w-4" />} label={t("quickLog.water")} value={`${water} / 8`}>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: 8 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setWater(i + 1 === water ? i : i + 1)}
                  className={`h-9 w-9 rounded-lg border-2 transition-all press-zoom ${
                    i < water
                      ? "bg-info/20 border-info text-info"
                      : "border-muted bg-muted/20 text-muted-foreground"
                  }`}
                  aria-label={`${i + 1} ${t("quickLog.glasses")}`}
                >
                  <Droplet className="h-4 w-4 mx-auto" />
                </button>
              ))}
            </div>
          </Field>

          {/* Exercise */}
          <Field icon={<Activity className="h-4 w-4" />} label={t("quickLog.exercise")} value={`${exercise} min`}>
            <input
              type="range"
              min={0}
              max={120}
              step={5}
              value={exercise}
              onChange={(e) => setExercise(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </Field>

          {/* Meals */}
          <Field icon={<Utensils className="h-4 w-4" />} label={t("quickLog.meals")} value={`${meals} / 3`}>
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMeals(n === meals ? n - 1 : n)}
                  className={`flex-1 h-10 rounded-lg border-2 font-semibold text-sm transition-all press-zoom ${
                    n <= meals
                      ? "bg-success/20 border-success text-success"
                      : "border-muted bg-muted/20 text-muted-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </Field>

          {/* Stress */}
          <Field icon={<Brain className="h-4 w-4" />} label={t("quickLog.stress")} value={`${stress} / 10`}>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={stress}
              onChange={(e) => setStress(Number(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>{t("quickLog.calm")}</span>
              <span>{t("quickLog.tense")}</span>
            </div>
          </Field>

          <Button
            onClick={handleSave}
            disabled={upsert.isPending}
            className="w-full h-12 rounded-xl text-base font-semibold"
          >
            {upsert.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            {t("quickLog.save")}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  icon,
  label,
  value,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl glass-secondary border border-primary/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </span>
          {label}
        </div>
        <span className="text-sm font-bold text-primary">{value}</span>
      </div>
      {children}
    </div>
  );
}
