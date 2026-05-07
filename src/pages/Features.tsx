import { Link } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import FeaturesShowcaseSection from "@/components/sections/FeaturesShowcaseSection";
import { LanguageToggle } from "@/components/LanguageToggle";
import LoginDropdown from "@/components/LoginDropdown";
import { useI18n } from "@/hooks/useI18n";

export default function Features() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <nav className="fixed top-0 left-0 right-0 z-40 glassmorphic-nav border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border border-blue-400/30 shadow-glow">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-900">{t('common.appName')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <LoginDropdown />
          </div>
        </div>
      </nav>

      <div className="pt-16">
        <FeaturesShowcaseSection />
      </div>

      <div className="px-4 sm:px-6 py-10 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:text-blue-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
      </div>
    </div>
  );
}
