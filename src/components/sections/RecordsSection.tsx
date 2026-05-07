import { useState } from "react";
import { usePatients, useAllVitals } from "@/hooks/use-data";
import { useI18n } from "@/hooks/useI18n";

const tabs = ["vitals", "medicines", "notes"] as const;

export function RecordsSection() {
  const { t } = useI18n();
  const [tab, setTab] = useState<typeof tabs[number]>("vitals");
  const { data: patients = [] } = usePatients();
  const { data: allVitals = [] } = useAllVitals();

  return (
    <section className="px-5 py-4">
      <h2 className="text-lg font-bold text-foreground scroll-fade-in">{t('records.title')}</h2>

      {/* Tab buttons with smooth transitions */}
      <div className="flex gap-2 mt-3 scroll-slide-left">
        {tabs.map((t_key) => (
          <button
            key={t_key}
            onClick={() => setTab(t_key)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all press-zoom duration-300 ${
              tab === t_key 
                ? "bg-gradient-primary text-primary-foreground shadow-floating" 
                : "bg-muted/50 text-muted-foreground hover:bg-muted/70 backdrop-blur-sm"
            }`}
          >
            {t(`records.${t_key}`)}
          </button>
        ))}
      </div>

      {/* Records list with animations */}
      <div className="mt-4 space-y-2.5">
        {tab === "vitals" && (
          <>
            {allVitals.slice(0, 8).map((v: any, i: number) => (
              <div
                key={v.id || i}
                className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-3.5 scroll-fade-in press-zoom hover-lift transition-all shadow-soft md:shadow-sm md:hover:border-primary/40"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">{v.patients?.name ?? "—"}</p>
                  <span className="text-[10px] text-muted-foreground/70 bg-muted/30 px-2.5 py-1 rounded-full">{v.recorded_date}</span>
                </div>
                <div className="flex gap-3 text-xs flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-muted-foreground">BP:</span>
                    <span className={`font-semibold ${v.systolic > 140 ? "text-destructive" : "text-foreground"}`}>
                      {v.systolic}/{v.diastolic}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="text-muted-foreground">Sugar:</span>
                    <span className={`font-semibold ${v.sugar > 200 ? "text-warning" : "text-foreground"}`}>
                      {v.sugar}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="text-muted-foreground">Adherence:</span>
                    <span className={`font-semibold ${v.adherence < 70 ? "text-destructive" : "text-foreground"}`}>
                      {v.adherence}%
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === "medicines" && patients.map((p, i) => (
          <div
            key={p.id}
            className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-3.5 scroll-fade-in press-zoom hover-lift transition-all shadow-soft md:shadow-sm md:hover:border-primary/40"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <p className="text-sm font-semibold text-foreground mb-2">{p.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {(p.medicines ?? []).map((m, j) => (
                <span 
                  key={j} 
                  className="text-[11px] bg-primary/10 text-primary rounded-full px-3 py-1 font-medium border border-primary/20 backdrop-blur-sm"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        ))}

        {tab === "notes" && patients.map((p, i) => (
          <div
            key={p.id}
            className="rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-3.5 scroll-fade-in press-zoom hover-lift transition-all shadow-soft md:shadow-sm md:hover:border-primary/40"
            style={{ animationDelay: `${i * 50}ms` }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-foreground">{p.name}</p>
              <span className="text-[10px] text-muted-foreground/70 bg-muted/30 px-2.5 py-1 rounded-full">{p.last_visit}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{p.notes || t('records.noNotes')}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
