import { useNavigate } from "react-router-dom";
import { useI18n } from "@/hooks/useI18n";
import AuthForm from "@/components/AuthForm";
import { LanguageToggle } from "@/components/LanguageToggle";

export default function PwaAuthPage() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-[#d3ebe8] via-white to-white flex flex-col">
      <header className="flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),1rem)] pb-3">
        <div className="flex items-center gap-2">
          <img src="/TathminiAfyaLogo.png" alt="" className="h-9 w-9 rounded-xl object-contain bg-white/80 p-1 shadow-sm" />
          <span className="font-semibold text-slate-900">Tathmini Afya</span>
        </div>
        <LanguageToggle />
      </header>

      <main className="flex-1 flex items-center justify-center px-5 pb-[max(env(safe-area-inset-bottom),1.25rem)]">
        <div className="w-full max-w-sm">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {t("auth.welcome") || "Karibu"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {t("auth.subtitle") || "Ingia au jisajili ili kuendelea"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur shadow-xl p-5">
            <AuthForm
              t={t}
              onSuccess={() => navigate("/patient", { replace: true })}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
