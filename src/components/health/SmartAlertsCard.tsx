import { useI18n } from "@/hooks/useI18n";
import type { SmartAlert } from "@/lib/health-score";
import { Moon, Droplet, Brain, Activity, Heart, Calendar, Scale } from "lucide-react";

const ICONS = {
  moon: Moon,
  droplet: Droplet,
  brain: Brain,
  activity: Activity,
  heart: Heart,
  calendar: Calendar,
  scale: Scale,
};

const PRIORITY_STYLES = {
  high: { border: "border-l-destructive", bg: "bg-destructive/5", icon: "bg-destructive/15 text-destructive", chip: "bg-destructive/10 text-destructive" },
  medium: { border: "border-l-warning", bg: "bg-warning/5", icon: "bg-warning/15 text-warning", chip: "bg-warning/10 text-warning" },
  low: { border: "border-l-muted-foreground", bg: "bg-muted/20", icon: "bg-muted/40 text-muted-foreground", chip: "bg-muted/30 text-muted-foreground" },
};

interface Props {
  alerts: SmartAlert[];
}

export function SmartAlertsCard({ alerts }: Props) {
  const { t } = useI18n();
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
        {t("smartAlert.heading")}
      </h3>
      {alerts.map((a) => {
        const Icon = ICONS[a.icon];
        const style = PRIORITY_STYLES[a.priority];
        return (
          <div
            key={a.id}
            className={`relative rounded-2xl border-l-4 ${style.border} ${style.bg} backdrop-blur-md p-3 flex items-start gap-3 hover-lift transition-all`}
          >
            <div className={`h-9 w-9 rounded-xl ${style.icon} flex items-center justify-center shrink-0`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground truncate">{t(a.titleKey)}</p>
                <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${style.chip}`}>
                  {t(`smartAlert.priority.${a.priority}`)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{t(a.messageKey)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
