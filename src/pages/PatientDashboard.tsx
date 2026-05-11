import { useMemo, useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/useI18n";
import { type DbAlert, type DbMedicalHistory, usePatientByUserId, useAlerts, useMedicalHistory, useHealthEntries } from "@/hooks/use-data";
import { useDailyLogs, useTodayLog, useTodayRecommendations } from "@/hooks/use-daily-logs";
import { useDayChange } from "@/hooks/use-day-change";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BottomNav } from "@/components/BottomNav";
import { AlertBanner } from "@/components/health/AlertBanner";
import { CalculatorCard } from "@/components/health/CalculatorCard";
import { ChartCard } from "@/components/health/ChartCard";
import { HealthForm } from "@/components/health/HealthForm";
import { VitalSignsHistory } from "@/components/health/VitalSignsHistory";
import { HealthScoreRing } from "@/components/health/HealthScoreRing";
import { QuickLogSheet } from "@/components/health/QuickLogSheet";
import { SmartAlertsCard } from "@/components/health/SmartAlertsCard";
import { AlertsTimeline } from "@/components/health/AlertsTimeline";
import { RecommendationsCard } from "@/components/health/RecommendationsCard";

import { computeHealthScore, generateSmartAlerts, generateRecommendations } from "@/lib/health-score";
import { AssessmentsHub } from "@/components/health/AssessmentsHub";
import { CalorieCalculator } from "@/components/health/CalorieCalculator";
import { InsightsTrends } from "@/components/health/InsightsTrends";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { HeartPulse, LogOut, LayoutDashboard, Calculator, BarChart, Activity, ArrowRight, X, PlusCircle, AlertCircle, ClipboardList, Stethoscope, Salad, LineChart as LineChartIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart as RechartsBarChart, Bar, ResponsiveContainer, Legend } from "recharts";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import {
  classifyBloodPressure,
  classifyHeartRate,
  getBmiCategory,
} from "@/lib/health";
import { getDateLocale, translateStatusLabel } from "@/lib/i18n-utils";

const riskColor: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

type PatientFeature = "summary" | "add-data" | "insights" | "calculators" | "assessments";

export default function PatientDashboard() {
  const { profile, user, signOut } = useAuth();
  const { t, lang } = useI18n();
  const userId = user?.id ?? "";
  const { data: patient, isLoading: patientLoading } = usePatientByUserId(userId);
  const patientId = patient?.id ?? "";
  const { data: history = [] } = useMedicalHistory(patientId);
  const { data: alertsData = [] } = useAlerts();
  const { data: healthEntries = [] } = useHealthEntries(patientId);
  const [activeFeature, setActiveFeature] = useState<PatientFeature>("summary");
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(32);
  const [manualSystolic, setManualSystolic] = useState(120);
  const [manualDiastolic, setManualDiastolic] = useState(78);
  const [manualHeartRate, setManualHeartRate] = useState(74);
  const [showOverlay, setShowOverlay] = useState(false);
  const [showQuickLog, setShowQuickLog] = useState(false);
  const observe = useScrollAnimation();
  const mainRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Daily logs + recommendations tracking
  const { data: dailyLogs = [] } = useDailyLogs(userId);
  const { data: todayLog, isLoading: todayLoading } = useTodayLog(userId);
  const { data: shownTipIds = [] } = useTodayRecommendations(userId);

  // Track date changes — when midnight passes, queries auto-refresh and today resets
  const today = useDayChange();

  // Auto-open the daily log sheet once per new day if it hasn't been filled yet
  useEffect(() => {
    if (!userId || todayLoading) return;
    if (todayLog) return; // already logged today
    const flagKey = `daily-log-prompted-${userId}-${today}`;
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(flagKey)) return;
    // Defer slightly so the dashboard finishes its initial paint
    const t = setTimeout(() => {
      setShowQuickLog(true);
      window.sessionStorage.setItem(flagKey, "1");
    }, 600);
    return () => clearTimeout(t);
  }, [userId, today, todayLog, todayLoading]);

  // Observe scroll animations
  useEffect(() => {
    observe(mainRef.current);
  }, [observe]);

  useEffect(() => {
    if (showOverlay) {
      const timer = setTimeout(() => observe(overlayRef.current), 50);
      return () => clearTimeout(timer);
    }
  }, [showOverlay, observe]);

  const latestEntry = useMemo(() => {
    if (!healthEntries.length) return null;
    return healthEntries[0];
  }, [healthEntries]);

  useEffect(() => {
    if (!latestEntry) return;
    setManualSystolic(latestEntry.systolic);
    setManualDiastolic(latestEntry.diastolic);
    setManualHeartRate(latestEntry.heart_rate);
  }, [latestEntry]);

  const patientAlertsAll = alertsData.filter((a: DbAlert) => a.patient_id === patientId);

  const insightData = useMemo(() => {
    if (!healthEntries.length) return [];
    // healthEntries comes back ordered DESC by created_at; reverse to chronological for charts
    return [...healthEntries]
      .slice(0, 14)
      .reverse()
      .map((entry) => ({
        label: new Date(entry.recorded_date ?? entry.created_at).toLocaleDateString(getDateLocale(lang), {
          day: "numeric",
          month: "short",
        }),
        systolic: entry.systolic,
        diastolic: entry.diastolic,
        heartRate: entry.heart_rate,
        weight: Number(entry.weight),
      }));
  }, [healthEntries, lang]);

  const bmiValue = useMemo(() => {
    const weight = latestEntry?.weight ?? 72;
    const meters = height / 100;
    return Number((weight / (meters * meters)).toFixed(1));
  }, [height, latestEntry]);

  const bmiCategory = useMemo(() => getBmiCategory(bmiValue), [bmiValue]);
  const bpStatus = useMemo(() => classifyBloodPressure(manualSystolic, manualDiastolic), [manualSystolic, manualDiastolic]);
  const heartRateStatus = useMemo(() => classifyHeartRate(age, manualHeartRate), [age, manualHeartRate]);

  const overlayTitles: Record<string, string> = {
    "add-data": t('overlay.addData'),
    "insights": t('overlay.insights'),
    "calculators": t('overlay.calculators'),
    "assessments": t('overlay.assessments'),
  };

  const hasAbnormalVitals = latestEntry
    ? classifyBloodPressure(latestEntry.systolic, latestEntry.diastolic) !== "Normal" || classifyHeartRate(age, latestEntry.heart_rate) !== "Normal"
    : false;

  const patientNavItems = [
    { id: "summary", icon: LayoutDashboard, label: t('patient.home') },
    { id: "add-data", icon: Calculator, label: t('patient.addData') },
    { id: "insights", icon: BarChart, label: t('patient.insights') },
    { id: "calculators", icon: Activity, label: t('patient.tools') },
  ];

  const handlePanelToggle = (panel: PatientFeature) => {
    setActiveFeature(panel);
    setShowOverlay(true);
  };


  if (patientLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }


  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Main scrollable dashboard - always rendered */}
      <div ref={mainRef} className="flex-1 overflow-y-auto no-scrollbar pb-24 safe-area-bottom">
        
        {/* Header with glassmorphism and animations */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[rgba(59,130,246,0.35)] via-[rgba(59,130,246,0.22)] to-[rgba(59,130,246,0.10)] backdrop-blur-md border-b border-primary/30 px-5 pt-8 pb-3">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.55),_transparent_55%),radial-gradient(circle_at_top_right,_rgba(96,165,250,0.45),_transparent_55%),radial-gradient(circle_at_bottom_center,_rgba(59,130,246,0.30),_transparent_60%)] opacity-100" />
          <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-primary/15 blur-3xl animate-float-slow" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/TathminiAfyaLogo.png"
                  alt="Tathmini Afya Logo"
                  className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0"
                />
                <div>
                  <h1 className="text-lg font-bold text-foreground">{t('common.appName')}</h1>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={signOut} className="hover-lift">
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main content with animations */}
        <div className="px-5 pt-5 pb-5 animate-fade-in space-y-5">
          {hasAbnormalVitals && latestEntry && (
            <AlertBanner
              variant="danger"
              title={t('patient.abnormalVitals')}
              description={`${t('records.bp')}: ${latestEntry.systolic}/${latestEntry.diastolic}, ${t('patient.heartRate')}: ${latestEntry.heart_rate} bpm`}
            />
          )}

          {/* === SMART HEALTH INTELLIGENCE === */}
          {(() => {
            const vitalsSnap = latestEntry
              ? { systolic: latestEntry.systolic, diastolic: latestEntry.diastolic, heart_rate: latestEntry.heart_rate }
              : null;
            const scoreResult = computeHealthScore(todayLog ?? null, vitalsSnap);
            const weightHistory = healthEntries.slice(0, 7).map((h) => Number(h.weight));
            const smartAlerts = generateSmartAlerts(dailyLogs, vitalsSnap, weightHistory);
            const tips = generateRecommendations(scoreResult.subScores, shownTipIds, 3);

            return (
              <>
                {/* Required daily log banner — shown until today's log is filled */}
                {!todayLog && (
                  <div className="scroll-fade-in rounded-2xl border-2 border-warning/50 bg-gradient-to-br from-warning/15 via-warning/5 to-transparent p-4 shadow-soft">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-warning/20 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">
                          {t('quickLog.requiredTitle')}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t('quickLog.requiredDesc')}
                        </p>
                        <Button
                          onClick={() => setShowQuickLog(true)}
                          size="sm"
                          className="mt-3 h-9 rounded-xl text-xs font-semibold press-zoom"
                        >
                          <PlusCircle className="h-4 w-4 mr-1.5" />
                          {t('quickLog.fillNow')}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Health Score Ring - HERO */}
                <div className="scroll-fade-in">
                  <HealthScoreRing result={scoreResult} />
                </div>

                {/* Quick Log CTA — shown only after today's log exists, as an update path */}
                {todayLog && (
                  <Button
                    onClick={() => setShowQuickLog(true)}
                    variant="outline"
                    className="w-full h-12 rounded-2xl text-sm font-semibold shadow-soft press-zoom"
                    size="lg"
                  >
                    <PlusCircle className="h-5 w-5 mr-2" />
                    {t('quickLog.updateButton')}
                  </Button>
                )}

                {/* Smart Alerts */}
                {smartAlerts.length > 0 && (
                  <div className="scroll-fade-in">
                    <SmartAlertsCard alerts={smartAlerts} />
                  </div>
                )}

                {/* Today's Recommendations */}
                <div className="scroll-fade-in">
                  <RecommendationsCard tips={tips} userId={userId} />
                </div>

                {/* Alerts & Reminders Timeline — only when there are alerts */}
                {patientAlertsAll.length > 0 && (
                  <div className="scroll-fade-in">
                    <AlertsTimeline alerts={patientAlertsAll} />
                  </div>
                )}
              </>
            );
          })()}

          {/* Action Buttons - simplified for performance */}
          <div className="grid gap-4 sm:grid-cols-2">
            <button type="button" onClick={() => handlePanelToggle("add-data")} className="group scroll-fade-in relative rounded-3xl border border-primary/25 bg-card p-4 text-left shadow-soft transition-colors hover:border-primary/40 press-zoom">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{t('patient.addDataTitle')}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t('patient.addDataDesc')}</p>
                </div>
              </div>
            </button>
            <button type="button" onClick={() => handlePanelToggle("assessments")} className="group scroll-fade-in relative rounded-3xl border border-primary/25 bg-card p-4 text-left shadow-soft transition-colors hover:border-primary/40 press-zoom" style={{ animationDelay: "50ms" }}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center shrink-0">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-success transition-colors">{t('patient.assessmentsTitle')}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t('patient.assessmentsDesc')}</p>
                </div>
              </div>
            </button>
            <button type="button" onClick={() => handlePanelToggle("insights")} className="group scroll-fade-in relative rounded-3xl border border-primary/25 bg-card p-4 text-left shadow-soft transition-colors hover:border-primary/40 press-zoom" style={{ animationDelay: "100ms" }}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0">
                  <LineChartIcon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{t('patient.insightsTitle')}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t('patient.insightsDesc')}</p>
                </div>
              </div>
            </button>
            <button type="button" onClick={() => handlePanelToggle("calculators")} className="group scroll-fade-in relative rounded-3xl border border-primary/25 bg-card p-4 text-left shadow-soft transition-colors hover:border-primary/40 press-zoom" style={{ animationDelay: "150ms" }}>
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center shrink-0">
                  <Salad className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{t('patient.toolsTitle')}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t('patient.toolsDesc')}</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Overlay section - Modern glassmorphism design matching Index dashboard */}
      {showOverlay && (
        <div className="fixed inset-0 z-40 flex flex-col animate-fade-in">
          {/* Backdrop with glassmorphism */}
          <div
            className="absolute inset-0 backdrop-blur-lg bg-foreground/40 transition-opacity duration-300 animate-fade-in"
            onClick={() => setShowOverlay(false)}
          />

          {/* Overlay panel with modern styling */}
          <div className="relative mt-12 flex-1 bg-gradient-soft rounded-t-3xl overflow-hidden animate-slide-in-bottom flex flex-col shadow-elevated border-t border-white/20">
            {/* Header with glassmorphism */}
            <div className="sticky top-0 z-10 frosted-glass border-b border-white/20 backdrop-blur-md">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30 mx-auto mt-3 transition-colors" />
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-lg font-bold text-foreground">
                  {overlayTitles[activeFeature] || ""}
                </h2>
                <button
                  onClick={() => setShowOverlay(false)}
                  className="h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center press-zoom hover-lift transition-all backdrop-blur-sm border border-white/20"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Overlay content */}
            <div ref={overlayRef} className="flex-1 overflow-y-auto no-scrollbar pb-safe px-5">
              {activeFeature === "add-data" && (
                <div className="py-4 space-y-5">
                  <HealthForm
                    patientId={patientId}
                    userId={userId}
                    age={age}
                    heightCm={height}
                    onSaved={() => { /* keep overlay open so user sees updated history & trends */ }}
                  />
                  <VitalSignsHistory patientId={patientId} age={age} heightCm={height} />
                </div>
              )}

              {activeFeature === "assessments" && (
                <div className="py-2">
                  <AssessmentsHub />
                </div>
              )}

              {activeFeature === "insights" && (
                <div className="space-y-5 py-4 animate-fade-in">
                  <InsightsTrends />
                  {insightData.length === 0 ? (
                    <div className="text-center py-12 px-4 text-muted-foreground text-sm rounded-2xl border border-dashed border-border/60 bg-card/30">
                      <BarChart className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="font-medium text-foreground mb-1">{t('patient.noInsightData')}</p>
                      <p className="text-xs">{t('patient.noInsightHint') !== 'patient.noInsightHint' ? t('patient.noInsightHint') : ''}</p>
                      <Button
                        size="sm"
                        className="mt-4 rounded-xl"
                        onClick={() => { setActiveFeature("add-data"); }}
                      >
                        <PlusCircle className="h-4 w-4 mr-1.5" />
                        {t('patient.addData')}
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-5 lg:grid-cols-2">
                      <ChartCard title={t('patient.bpChart')} description={t('patient.bpChartDesc')}>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={insightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" />
                              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                              <Legend wrapperStyle={{ fontSize: 11 }} />
                              <Line type="monotone" dataKey="systolic" name="Systolic" stroke="hsl(var(--primary))" strokeWidth={2} dot />
                              <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="hsl(var(--warning))" strokeWidth={2} dot />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </ChartCard>
                      <ChartCard title={t('patient.weightChart')} description={t('patient.weightChartDesc')}>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsBarChart data={insightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" />
                              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                              <Bar dataKey="weight" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
                            </RechartsBarChart>
                          </ResponsiveContainer>
                        </div>
                      </ChartCard>
                      <ChartCard title={t('patient.heartRateTitle')} description={t('patient.heartRateDesc')}>
                        <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={insightData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--border))" />
                              <XAxis dataKey="label" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                              <Line type="monotone" dataKey="heartRate" name="BPM" stroke="hsl(var(--destructive))" strokeWidth={2} dot />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </ChartCard>
                    </div>
                  )}
                </div>
              )}

              {activeFeature === "calculators" && (
                <div className="space-y-5 py-4 animate-fade-in">
                  <CalorieCalculator
                    initialWeight={latestEntry?.weight ?? 70}
                    initialHeight={height}
                    initialAge={age}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav active={activeFeature} onNavigate={(f) => {
        if (f !== "summary") handlePanelToggle(f as PatientFeature);
        else setShowOverlay(false);
      }} items={patientNavItems} />

      {/* Quick Log Sheet */}
      <QuickLogSheet
        open={showQuickLog}
        onOpenChange={setShowQuickLog}
        userId={userId}
        existing={todayLog ?? null}
      />
    </div>
  );
}
