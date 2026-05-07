import { AlertTriangle, AlertCircle, Info, Check, ChevronRight, Sparkles } from "lucide-react";
import { useAlerts, useResolveAlert } from "@/hooks/use-data";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@/components/ui/button";

const typeConfig: Record<string, { icon: typeof AlertTriangle; bg: string; dot: string; glow: string }> = {
  critical: { icon: AlertTriangle, bg: "bg-destructive/8 border-destructive/20 hover:bg-destructive/12", dot: "bg-destructive", glow: "shadow-destructive" },
  warning: { icon: AlertCircle, bg: "bg-warning/8 border-warning/20 hover:bg-warning/12", dot: "bg-warning", glow: "shadow-glow-warm" },
  info: { icon: Info, bg: "bg-info/8 border-info/20 hover:bg-info/12", dot: "bg-info", glow: "shadow-glow" },
};

interface AlertsSectionProps {
  onViewPatient: (id: string) => void;
  limit?: number;
}

export function AlertsSection({ onViewPatient, limit }: AlertsSectionProps) {
  const { t } = useI18n();
  const { data: allAlerts = [] } = useAlerts();
  const resolveAlert = useResolveAlert();

  const active = allAlerts.filter((a) => !a.resolved);
  const shown = limit ? active.slice(0, limit) : active;

  if (active.length === 0) {
    return (
      <section className="px-5 py-4">
        <h2 className="text-lg font-bold text-foreground scroll-fade-in">{t('alerts.title')}</h2>
        <div className="mt-4 rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-8 text-center scroll-scale-in shadow-soft md:shadow-sm md:hover:border-primary/40 transition-all">
          <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-success/15 flex items-center justify-center border border-success/20">
            <Check className="h-5 w-5 text-success" />
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <p className="text-sm font-semibold text-foreground">{t('alerts.allGood')}</p>
            <Sparkles className="h-4 w-4 text-success pulse-glow" />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{t('alerts.noAlerts')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 py-4">
      <div className="flex items-center justify-between scroll-fade-in">
        <h2 className="text-lg font-bold text-foreground">{t('alerts.title')}</h2>
        <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">{active.length} {t('alerts.active')}</span>
      </div>

      <div className="space-y-2.5 mt-4">
        {shown.map((a, i) => {
          const config = typeConfig[a.type] || typeConfig.info;
          return (
            <div
              key={a.id}
              className={`rounded-2xl border p-3.5 scroll-slide-left press-zoom hover-lift transition-all frosted-glass backdrop-blur-sm ${config.bg} ${config.glow}`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${config.dot} animate-pulse`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-snug text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.message}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs px-2.5 rounded-lg hover:bg-white/30 transition-colors"
                      onClick={() => onViewPatient(a.patient_id)}
                    >
                      {t('alerts.view')} <ChevronRight className="h-3 w-3 ml-0.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs px-2.5 rounded-lg hover:bg-white/30 transition-colors"
                      onClick={() => resolveAlert.mutate(a.id)}
                    >
                      <Check className="h-3 w-3 mr-1" /> {t('alerts.resolve')}
                    </Button>
                    <span className="text-[10px] text-muted-foreground/60 ml-auto">{a.time}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
