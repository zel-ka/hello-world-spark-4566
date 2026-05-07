import { useState } from "react";
import { Search, ChevronRight, ChevronDown } from "lucide-react";
import { usePatients } from "@/hooks/use-data";
import { useI18n } from "@/hooks/useI18n";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { translateStatusLabel } from "@/lib/i18n-utils";

const riskColor: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

interface PatientsSectionProps {
  onSelectPatient: (id: string) => void;
}

export function PatientsSection({ onSelectPatient }: PatientsSectionProps) {
  const { t } = useI18n();
  const { data: patients = [], isLoading } = usePatients();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "highRisk" | "chronic">("all");
  const [expandView, setExpandView] = useState(false);
  const INITIAL_DISPLAY = 3; // Show 3 patients initially on mobile

  const filters = [
    { id: "all" as const, label: t('dashboard.all') },
    { id: "highRisk" as const, label: t('dashboard.highRisk') },
    { id: "chronic" as const, label: t('dashboard.chronic') },
  ];

  const filtered = patients.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (activeFilter === "highRisk") return p.risk_level === "high";
    if (activeFilter === "chronic")
      return ["Diabetes", "Hypertension", "Heart", "Kidney"].some((c) =>
        p.condition.includes(c)
      );
    return true;
  });

  // Decide which patients to show
  const displayedPatients = expandView ? filtered : filtered.slice(0, INITIAL_DISPLAY);
  const hasMore = filtered.length > INITIAL_DISPLAY;

  return (
    <section className="px-5 py-4">
      <h2 className="text-lg font-bold text-foreground scroll-fade-in">{t('dashboard.patientsTitle')}</h2>

      {/* Search bar with modern styling */}
      <div className="relative mt-3 scroll-fade-in" style={{ animationDelay: "100ms" }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('dashboard.searchPatients')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 rounded-xl bg-white/50 backdrop-blur-sm border-white/30 text-sm frosted-glass focus-ring transition-all shadow-soft"
        />
      </div>

      {/* Filter buttons with smooth transitions */}
      <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar scroll-slide-left" style={{ animationDelay: "150ms" }}>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all press-zoom duration-300 ${
              activeFilter === f.id
                ? "bg-gradient-primary text-primary-foreground shadow-floating"
                : "bg-muted/50 text-muted-foreground hover:bg-muted/70 backdrop-blur-sm"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading skeleton cards - vertical layout */}
      {isLoading ? (
        <div className="space-y-2 mt-4">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="w-full h-20 rounded-2xl bg-muted animate-pulse skeleton" 
            />
          ))}
        </div>
      ) : (
        <>
          {/* Vertical list of patients - mobile friendly */}
          <div className="space-y-2 mt-4">
            {displayedPatients.map((p, i) => (
              <button
                key={p.id}
                onClick={() => onSelectPatient(p.id)}
                className="w-full rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-3.5 text-left press-zoom scroll-scale-in md:hover-lift md:hover-glow transition-all shadow-soft md:shadow-sm md:hover:border-primary/40"
                style={{ 
                  animationDelay: `${i * 60}ms`,
                  transitionDelay: `${i * 50}ms`
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-10 w-10 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-glow">
                      {p.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{p.condition}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                </div>
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] font-medium transition-all ${riskColor[p.risk_level] || ""}`}
                  >
                    {translateStatusLabel(p.risk_level, t)}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground/70">{t('records.bp')}: {p.bp || "—"}</span>
                  <span className="text-[10px] text-muted-foreground/70">{t('records.sugar')}: {p.sugar ?? "—"}</span>
                </div>
              </button>
            ))}
          </div>

          {/* View More / View Less button */}
          {hasMore && (
            <button
              onClick={() => setExpandView(!expandView)}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-primary/10 text-primary font-medium text-sm flex items-center justify-center gap-2 press-zoom hover-lift transition-all border border-primary/30 backdrop-blur-sm"
            >
              <span>{expandView ? t('dashboard.viewLess') : `${t('dashboard.viewMore')} (${filtered.length - INITIAL_DISPLAY})`}</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${expandView ? "rotate-180" : ""}`} />
            </button>
          )}
        </>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="mt-8 text-center scroll-fade-in">
          <div className="h-12 w-12 rounded-full bg-muted/50 mx-auto mb-3 flex items-center justify-center">
            <Search className="h-5 w-5 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground">{t('dashboard.noPatients')}</p>
        </div>
      )}
    </section>
  );
}
