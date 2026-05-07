import { Moon, Bell, Shield, Info } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";
import { LanguageToggle } from "@/components/LanguageToggle";

export function SettingsSection() {
  const { t } = useI18n();

  return (
    <section className="px-5 py-4">
      <h2 className="text-lg font-bold text-foreground scroll-fade-in">{t('settings.title')}</h2>

      <div className="space-y-3 mt-4">
        {[
          { icon: Bell, label: t('settings.notifications'), desc: t('settings.notificationsDesc') },
          { icon: Moon, label: t('settings.appearance'), desc: t('settings.appearanceDesc') },
          { icon: Shield, label: t('settings.privacy'), desc: t('settings.privacyDesc') },
          { icon: Info, label: t('settings.about'), desc: t('settings.aboutDesc') },
        ].map((item, i) => (
          <button
            key={item.label}
            className="w-full flex items-center gap-3.5 rounded-2xl frosted-glass border border-primary/25 md:border-primary/20 backdrop-blur-md p-4 text-left press-zoom scroll-fade-in hover-lift transition-all shadow-soft md:shadow-sm md:hover:border-primary/40"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-primary/20 flex items-center justify-center shrink-0 border border-primary/20 backdrop-blur-sm">
              <item.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">{item.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</p>
            </div>
          </button>
        ))}
        
        {/* Language Toggle Section */}
        <div className="mt-6 pt-4 border-t border-primary/20">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{t('common.language')}</p>
          <div className="flex justify-center">
            <LanguageToggle />
          </div>
        </div>
      </div>
    </section>
  );
}
