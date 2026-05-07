import { useMemo } from "react";
import { Bell, CheckCircle2, RefreshCw, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { getDateLocale } from "@/lib/i18n-utils";
import type { DbAlert } from "@/hooks/use-data";

type RawAlert = DbAlert & { created_at?: string; updated_at?: string };

type EventKind = "created" | "updated" | "resolved";

interface TimelineEvent {
  id: string;
  alertId: string;
  kind: EventKind;
  timestamp: number;
  title: string;
  message: string;
  type: string;
}

const TYPE_ICON: Record<string, typeof AlertTriangle> = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
};

const KIND_STYLE: Record<EventKind, { dot: string; ring: string; chip: string; icon: typeof Bell }> = {
  created: {
    dot: "bg-primary",
    ring: "ring-primary/30",
    chip: "bg-primary/10 text-primary",
    icon: Bell,
  },
  updated: {
    dot: "bg-warning",
    ring: "ring-warning/30",
    chip: "bg-warning/10 text-warning",
    icon: RefreshCw,
  },
  resolved: {
    dot: "bg-success",
    ring: "ring-success/30",
    chip: "bg-success/10 text-success",
    icon: CheckCircle2,
  },
};

interface Props {
  alerts: RawAlert[];
  limit?: number;
}

export function AlertsTimeline({ alerts, limit = 12 }: Props) {
  const { t, lang } = useI18n();
  const locale = getDateLocale(lang);

  const events = useMemo<TimelineEvent[]>(() => {
    const out: TimelineEvent[] = [];
    for (const a of alerts) {
      const createdMs = a.created_at ? new Date(a.created_at).getTime() : NaN;
      const updatedMs = a.updated_at ? new Date(a.updated_at).getTime() : NaN;

      if (!Number.isNaN(createdMs)) {
        out.push({
          id: `${a.id}-created`,
          alertId: a.id,
          kind: "created",
          timestamp: createdMs,
          title: a.title,
          message: a.message,
          type: a.type,
        });
      }

      // Only emit "updated" if it differs meaningfully from created (>30s) and the alert is not already resolved
      if (
        !Number.isNaN(updatedMs) &&
        !Number.isNaN(createdMs) &&
        updatedMs - createdMs > 30_000 &&
        !a.resolved
      ) {
        out.push({
          id: `${a.id}-updated`,
          alertId: a.id,
          kind: "updated",
          timestamp: updatedMs,
          title: a.title,
          message: a.message,
          type: a.type,
        });
      }

      if (a.resolved && !Number.isNaN(updatedMs)) {
        out.push({
          id: `${a.id}-resolved`,
          alertId: a.id,
          kind: "resolved",
          timestamp: updatedMs,
          title: a.title,
          message: a.message,
          type: a.type,
        });
      }
    }
    return out.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }, [alerts, limit]);

  if (events.length === 0) {
    return (
      <div className="rounded-2xl frosted-glass border border-primary/20 backdrop-blur-md p-6 text-center">
        <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">{t("timeline.empty")}</p>
      </div>
    );
  }

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const diffMs = Date.now() - ts;
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1) return t("timeline.justNow");
    if (diffMin < 60) return `${diffMin} ${t("timeline.minAgo")}`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr} ${t("timeline.hrAgo")}`;
    return date.toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {t("timeline.heading")}
        </h3>
        <span className="text-[10px] text-muted-foreground/70">
          {events.length} {t("timeline.events")}
        </span>
      </div>

      <div className="rounded-2xl frosted-glass border border-primary/20 backdrop-blur-md p-4">
        <ol className="relative">
          {/* Vertical line */}
          <span className="absolute left-[11px] top-1 bottom-1 w-px bg-gradient-to-b from-primary/30 via-border to-success/30" aria-hidden />

          {events.map((ev, i) => {
            const style = KIND_STYLE[ev.kind];
            const TypeIcon = TYPE_ICON[ev.type] ?? Info;
            return (
              <li
                key={ev.id}
                className="relative pl-8 pb-4 last:pb-0 scroll-fade-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Dot */}
                <span
                  className={`absolute left-0 top-1 h-[22px] w-[22px] rounded-full ${style.dot} ring-4 ${style.ring} flex items-center justify-center shadow-soft`}
                >
                  <style.icon className="h-3 w-3 text-white" />
                </span>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${style.chip}`}>
                        {t(`timeline.kind.${ev.kind}`)}
                      </span>
                      <TypeIcon className="h-3 w-3 text-muted-foreground/70" />
                      <p className="text-sm font-semibold text-foreground truncate">{ev.title}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-snug">{ev.message}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap shrink-0 mt-1">
                    {formatTime(ev.timestamp)}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
