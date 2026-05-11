import { useMemo, useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { HealthScoreRing } from "@/components/health/HealthScoreRing";
import { SmartAlertsCard } from "@/components/health/SmartAlertsCard";
import { RecommendationsCard } from "@/components/health/RecommendationsCard";
import { GuestLockDialog } from "@/components/GuestLockDialog";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  computeHealthScore,
  generateSmartAlerts,
  generateRecommendations,
  type DailyLog,
} from "@/lib/health-score";
import {
  HeartPulse,
  LayoutDashboard,
  Calculator,
  BarChart,
  Activity,
  PlusCircle,
  ClipboardList,
  Loader2,
  Moon,
  Droplet,
  Brain,
  Utensils,
  Stethoscope,
  LineChart as LineChartIcon,
  Salad,
} from "lucide-react";

type GuestFeature = "summary" | "add-data" | "insights" | "calculators" | "assessments";

export default function GuestDashboard() {
  const { t } = useI18n();

  // Local-only daily log (NOT persisted to DB)
  const [todayLog, setTodayLog] = useState<DailyLog | null>(null);
  const [showQuickLog, setShowQuickLog] = useState(true);
  const [showLock, setShowLock] = useState(false);

  const [sleep, setSleep] = useState(7);
  const [water, setWater] = useState(0);
  const [exercise, setExercise] = useState(0);
  const [stress, setStress] = useState(5);
  const [meals, setMeals] = useState(0);
  const [saving, setSaving] = useState(false);

  const mainRef = useRef<HTMLDivElement>(null);

  const handleSaveLog = () => {
    setSaving(true);
    // Simulate brief save UX without hitting DB
    setTimeout(() => {
      setTodayLog({
        log_date: new Date().toISOString().slice(0, 10),
        sleep_hours: sleep,
        water_glasses: water,
        exercise_minutes: exercise,
        stress_level: stress,
        meals_logged: meals,
      });
      setSaving(false);
      setShowQuickLog(false);
    }, 350);
  };

  const scoreResult = useMemo(
    () => computeHealthScore(todayLog ?? null, null),
    [todayLog],
  );
  const smartAlerts = useMemo(
    () => generateSmartAlerts(todayLog ? [todayLog] : [], null, []),
    [todayLog],
  );
  const tips = useMemo(
    () => generateRecommendations(scoreResult.subScores, [], 3),
    [scoreResult.subScores],
  );

  const navItems = [
    { id: "summary", icon: LayoutDashboard, label: t("patient.home") },
    { id: "add-data", icon: Calculator, label: t("patient.addData") },
    { id: "insights", icon: BarChart, label: t("patient.insights") },
    { id: "calculators", icon: Activity, label: t("patient.tools") },
  ];

  const lock = (f: GuestFeature) => {
    if (f === "summary") return;
    setShowLock(true);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div ref={mainRef} className="flex-1 overflow-y-auto no-scrollbar pb-24 safe-area-bottom">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-b from-card/80 to-card/40 backdrop-blur-md border-b border-white/20 px-5 pt-8 pb-3">
          <div className="pointer-events-none absolute inset-0 bg-fixed bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_20%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_25%)] opacity-90" />
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/TathminiAfyaLogo.png"
                  alt="Tathmini Afya Logo"
                  className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{t("guest.greeting")}</p>
                  <h1 className="text-base font-bold text-foreground truncate">{t("guest.name")}</h1>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <LanguageToggle />
                <Button size="sm" className="h-9 rounded-xl text-xs" onClick={() => setShowLock(true)}>{t("guest.signUpCta")}</Button>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/15 text-warning text-[11px] font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
              {t("guest.badge")}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-5 pt-5 pb-5 space-y-5 animate-fade-in">
          <div className="rounded-2xl border border-warning/30 bg-warning/5 p-3 text-xs text-foreground leading-relaxed">
            {t("guest.notice")}
          </div>

          {!todayLog && (
            <div className="rounded-2xl border-2 border-warning/50 bg-gradient-to-br from-warning/15 via-warning/5 to-transparent p-4 shadow-soft">
              <p className="text-sm font-bold text-foreground">{t("quickLog.requiredTitle")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("quickLog.requiredDesc")}</p>
              <Button
                onClick={() => setShowQuickLog(true)}
                size="sm"
                className="mt-3 h-9 rounded-xl text-xs font-semibold press-zoom"
              >
                <PlusCircle className="h-4 w-4 mr-1.5" />
                {t("quickLog.fillNow")}
              </Button>
            </div>
          )}

          <HealthScoreRing result={scoreResult} />

          {todayLog && (
            <Button
              onClick={() => setShowQuickLog(true)}
              variant="outline"
              className="w-full h-12 rounded-2xl text-sm font-semibold shadow-soft press-zoom"
              size="lg"
            >
              <PlusCircle className="h-5 w-5 mr-2" />
              {t("quickLog.updateButton")}
            </Button>
          )}

          {smartAlerts.length > 0 && <SmartAlertsCard alerts={smartAlerts} />}

          {/* Recommendations card without recording (no userId persistence) */}
          {tips.length > 0 && <RecommendationsCard tips={tips} userId="" />}

          {/* Locked feature buttons (mirror PatientDashboard) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <LockedTile
              icon={
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Stethoscope className="h-5 w-5" />
                </div>
              }
              title={t("patient.addDataTitle")}
              desc={t("patient.addDataDesc")}
              onClick={() => lock("add-data")}
            />
            <LockedTile
              icon={
                <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
                  <ClipboardList className="h-5 w-5" />
                </div>
              }
              title={t("patient.assessmentsTitle")}
              desc={t("patient.assessmentsDesc")}
              onClick={() => lock("assessments")}
            />
            <LockedTile
              icon={
                <div className="h-10 w-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
                  <LineChartIcon className="h-5 w-5" />
                </div>
              }
              title={t("patient.insightsTitle")}
              desc={t("patient.insightsDesc")}
              onClick={() => lock("insights")}
            />
            <LockedTile
              icon={
                <div className="h-10 w-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
                  <Salad className="h-5 w-5" />
                </div>
              }
              title={t("patient.toolsTitle")}
              desc={t("patient.toolsDesc")}
              onClick={() => lock("calculators")}
            />
          </div>

          <div className="pt-2">
            <Link to="/">
              <Button variant="ghost" className="w-full h-10 rounded-xl text-xs text-muted-foreground">
                {t("guest.backHome")}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick log sheet (local state only) */}
      <Sheet open={showQuickLog} onOpenChange={setShowQuickLog}>
        <SheetContent side="bottom" className="rounded-t-3xl max-h-[90vh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle className="text-xl">{t("quickLog.title")}</SheetTitle>
            <p className="text-xs text-muted-foreground">{t("quickLog.subtitle")}</p>
          </SheetHeader>
          <div className="space-y-5 mt-4">
            <Field icon={<Moon className="h-4 w-4" />} label={t("quickLog.sleep")} value={`${sleep}h`}>
              <input type="range" min={0} max={12} step={0.5} value={sleep}
                onChange={(e) => setSleep(Number(e.target.value))} className="w-full accent-primary" />
            </Field>
            <Field icon={<Droplet className="h-4 w-4" />} label={t("quickLog.water")} value={`${water} / 8`}>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: 8 }, (_, i) => (
                  <button key={i} type="button"
                    onClick={() => setWater(i + 1 === water ? i : i + 1)}
                    className={`h-9 w-9 rounded-lg border-2 transition-all press-zoom ${
                      i < water ? "bg-info/20 border-info text-info" : "border-muted bg-muted/20 text-muted-foreground"
                    }`}>
                    <Droplet className="h-4 w-4 mx-auto" />
                  </button>
                ))}
              </div>
            </Field>
            <Field icon={<Activity className="h-4 w-4" />} label={t("quickLog.exercise")} value={`${exercise} min`}>
              <input type="range" min={0} max={120} step={5} value={exercise}
                onChange={(e) => setExercise(Number(e.target.value))} className="w-full accent-primary" />
            </Field>
            <Field icon={<Utensils className="h-4 w-4" />} label={t("quickLog.meals")} value={`${meals} / 3`}>
              <div className="flex gap-2">
                {[1, 2, 3].map((n) => (
                  <button key={n} type="button"
                    onClick={() => setMeals(n === meals ? n - 1 : n)}
                    className={`flex-1 h-10 rounded-lg border-2 font-semibold text-sm transition-all press-zoom ${
                      n <= meals ? "bg-success/20 border-success text-success" : "border-muted bg-muted/20 text-muted-foreground"
                    }`}>
                    {n}
                  </button>
                ))}
              </div>
            </Field>
            <Field icon={<Brain className="h-4 w-4" />} label={t("quickLog.stress")} value={`${stress} / 10`}>
              <input type="range" min={1} max={10} step={1} value={stress}
                onChange={(e) => setStress(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>{t("quickLog.calm")}</span>
                <span>{t("quickLog.tense")}</span>
              </div>
            </Field>
            <Button onClick={handleSaveLog} disabled={saving} className="w-full h-12 rounded-xl text-base font-semibold">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("quickLog.save")}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <BottomNav active="summary" onNavigate={(f) => lock(f as GuestFeature)} items={navItems} />

      <GuestLockDialog open={showLock} onOpenChange={setShowLock} />
    </div>
  );
}

function LockedTile({
  title,
  desc,
  onClick,
  icon,
}: {
  title: string;
  desc: string;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative rounded-3xl frosted-glass border border-primary/25 bg-gradient-to-br from-card/80 via-card/70 to-card/60 backdrop-blur-md p-4 text-left transition-all duration-500 ease-out shadow-soft press-zoom overflow-hidden"
    >
      <div className="relative z-10 flex items-start gap-2">
        {icon}
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
        </div>
      </div>
    </button>
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
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4">
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
