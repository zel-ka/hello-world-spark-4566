import { usePatients, usePatientVitals } from "@/hooks/use-data";
import { useI18n } from "@/hooks/useI18n";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from "recharts";

export function TrendsSection() {
  const { t } = useI18n();
  const { data: patients = [] } = usePatients();
  const firstHighRisk = patients.find((p) => p.risk_level === "high");
  const { data: vitals = [] } = usePatientVitals(firstHighRisk?.id);

  if (vitals.length === 0) return null;

  return (
    <section className="px-5 py-4">
      <h2 className="text-lg font-bold text-foreground scroll-fade-in">{t('trends.title')}</h2>
      {firstHighRisk && (
        <p className="text-xs text-muted-foreground mt-2 scroll-fade-in" style={{ animationDelay: "100ms" }}>
          {t('trends.showingFor')} <span className="font-semibold text-foreground">{firstHighRisk.name}</span>
        </p>
      )}

      <div className="space-y-4 mt-4">
        {/* Blood Pressure Chart */}
        <div className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-4 scroll-scale-in shadow-soft md:shadow-sm md:hover-lift md:hover:border-primary/40 transition-all">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t('trends.bloodPressure')}</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={vitals}>
              <XAxis dataKey="recorded_date" tick={{ fontSize: 9 }} stroke="hsl(215 14% 80%)" />
              <YAxis tick={{ fontSize: 9 }} stroke="hsl(215 14% 80%)" domain={[100, 180]} />
              <Tooltip 
                contentStyle={{ 
                  fontSize: 11, 
                  borderRadius: 12, 
                  border: "none", 
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)", 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)"
                }} 
              />
              <Line type="monotone" dataKey="systolic" stroke="hsl(0 72% 55%)" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(0 72% 55%)" }} />
              <Line type="monotone" dataKey="diastolic" stroke="hsl(213 94% 54%)" strokeWidth={2} dot={{ r: 2.5, fill: "hsl(213 94% 54%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sugar Level Chart */}
        <div className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-4 scroll-scale-in shadow-soft md:shadow-sm md:hover-lift md:hover:border-primary/40 transition-all" style={{ animationDelay: "100ms" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t('trends.sugarLevel')}</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={vitals}>
              <XAxis dataKey="recorded_date" tick={{ fontSize: 9 }} stroke="hsl(215 14% 80%)" />
              <YAxis tick={{ fontSize: 9 }} stroke="hsl(215 14% 80%)" domain={[60, 280]} />
              <Tooltip 
                contentStyle={{ 
                  fontSize: 11, 
                  borderRadius: 12, 
                  border: "none", 
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)", 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)"
                }} 
              />
              <Line type="monotone" dataKey="sugar" stroke="hsl(30 95% 55%)" strokeWidth={2.5} dot={{ r: 3, fill: "hsl(30 95% 55%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Medication Adherence Chart */}
        <div className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-4 scroll-scale-in shadow-soft md:shadow-sm md:hover-lift md:hover:border-primary/40 transition-all" style={{ animationDelay: "200ms" }}>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">{t('trends.medicationAdherence')}</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={vitals}>
              <XAxis dataKey="recorded_date" tick={{ fontSize: 9 }} stroke="hsl(215 14% 80%)" />
              <YAxis tick={{ fontSize: 9 }} stroke="hsl(215 14% 80%)" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  fontSize: 11, 
                  borderRadius: 12, 
                  border: "none", 
                  boxShadow: "0 8px 32px rgba(0,0,0,0.15)", 
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)"
                }} 
              />
              <Bar dataKey="adherence" fill="hsl(213 94% 54%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
