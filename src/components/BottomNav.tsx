import type { ComponentType } from "react";
import { LayoutDashboard, Users, FileText, Bell, Settings } from "lucide-react";
import { useAlerts } from "@/hooks/use-data";
import { useI18n } from "@/hooks/useI18n";

interface BottomNavItem {
  id: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
}

interface BottomNavProps {
  active: string;
  onNavigate: (section: string) => void;
  items?: BottomNavItem[];
}

export function BottomNav({ active, onNavigate, items }: BottomNavProps) {
  const { t } = useI18n();
  
  const defaultItems: BottomNavItem[] = [
    { id: "dashboard", icon: LayoutDashboard, label: t('nav.home') },
    { id: "patients", icon: Users, label: t('nav.patients') },
    { id: "records", icon: FileText, label: t('nav.records') },
    { id: "alerts", icon: Bell, label: t('nav.alerts') },
    { id: "settings", icon: Settings, label: t('nav.settings') },
  ];

  const navItems = items ?? defaultItems;
  const { data: alerts = [] } = useAlerts();
  const alertCount = alerts.filter((a) => !a.resolved).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 frosted-glass border-t border-white/30 backdrop-blur-3xl safe-area-bottom shadow-elevated rounded-t-3xl">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2 pt-1">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-300 press-zoom relative group ${
                isActive
                  ? "text-primary scale-110"
                  : "text-muted-foreground hover:text-muted-foreground/80"
              }`}
            >
              <div className="relative">
                {isActive && (
                  <div className="absolute inset-0 rounded-lg bg-primary/15 blur-md" />
                )}
                <item.icon
                  className={`h-5 w-5 transition-all duration-300 relative z-10 ${
                    isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"
                  }`}
                />
                {item.id === "alerts" && alertCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 h-5 min-w-5 px-1.5 rounded-full bg-gradient-primary text-white text-[9px] font-bold flex items-center justify-center shadow-glow animate-pulse border border-white/30">
                    {alertCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-all duration-300 ${isActive ? "text-primary font-semibold" : ""}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1.5 w-6 h-1 rounded-full bg-gradient-primary shadow-glow animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
