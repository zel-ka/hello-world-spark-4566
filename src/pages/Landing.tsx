import { useState, useRef, useEffect } from "react";
import { Heart, Users, BarChart3, Bell, Activity, Stethoscope, Dumbbell, Moon, Wind, Brain, Sparkles, Shield, ClipboardList, Salad, Droplet, HeartPulse, FileText, Award, AlertTriangle, TrendingUp, Zap, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/hooks/useI18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import LoginDropdown from "@/components/LoginDropdown";
import { ExpandableFeatureCard } from "@/components/landing/ExpandableFeatureCard";

interface PhonePosition {
  rotateX: number;
  rotateY: number;
}

export default function Landing() {
  const { t, lang } = useI18n();
  const [phonePos, setPhonePos] = useState<PhonePosition>({ rotateX: 0, rotateY: 0 });
  const phoneContainerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [expandedFeature, setExpandedFeature] = useState<number | null>(null);
  const navLoginRef = useRef<HTMLDivElement>(null);
  const heroBgRef = useRef<HTMLDivElement>(null);
  const heroMidRef = useRef<HTMLDivElement>(null);
  const heroFgRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (!phoneContainerRef.current) return;
      const rect = phoneContainerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateY = ((e.clientX - centerX) / rect.width) * 15;
      const rotateX = -((e.clientY - centerY) / rect.height) * 15;
      setPhonePos({ rotateX, rotateY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".scroll-reveal"));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -10% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let ticking = false;
    const layers = [
      { node: heroBgRef.current, speed: 0.08 },
      { node: heroMidRef.current, speed: 0.16 },
      { node: heroFgRef.current, speed: 0.26 },
    ].filter((item): item is { node: HTMLDivElement; speed: number } => Boolean(item.node));

    const updateParallax = () => {
      const scrollY = window.scrollY;
      layers.forEach(({ node, speed }) => {
        node.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
      });
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateParallax();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 overflow-hidden selection:bg-blue-100 selection:text-slate-900">
      {/* Custom Cursor */}
      <div className="fixed w-6 h-6 pointer-events-none z-[9999] mix-blend-multiply" style={{ left: `${mousePos.x - 12}px`, top: `${mousePos.y - 12}px` }}>
        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full opacity-80" />
        <div className="absolute w-6 h-6 border-2 border-blue-400 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border border-blue-400/30">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-base sm:text-lg font-bold text-slate-900">{t('common.appName')}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <div ref={navLoginRef}>
              <LoginDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* Subtle Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/60 to-slate-100" />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden min-h-screen flex items-center justify-center z-10">
        <div ref={heroBgRef} className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 will-change-transform" style={{ backgroundImage: "url('/1 (2).png')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-blue-50/70 to-transparent" />
        
        <div className="w-full max-w-5xl mx-auto relative z-20">
          <div className="space-y-8 sm:space-y-12 text-center">
            {/* Badge */}
            <div className="inline-flex justify-center">
              <span className="text-xs sm:text-sm font-semibold text-blue-700 bg-blue-100 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full border border-blue-200 hover:bg-blue-200/80 transition-colors">
                {t('landing.heroBadge')}
              </span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6 sm:space-y-8">
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-tight text-slate-900 tracking-tight">
                {t('landing.heading1')}
                <span className="block bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                  {t('landing.heading2')}
                </span>
              </h1>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center pt-6 sm:pt-8">
              <Link to="/try" className="w-full sm:w-auto">
                <Button
                  type="button"
                  className="w-full px-8 h-12 sm:h-14 lg:h-16 rounded-2xl text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5 transition-all text-white"
                >
                  {t('landing.cta1Text')}
                </Button>
              </Link>
              <div className="w-full sm:w-auto">
                <LoginDropdown variant="cta" className="w-full" />
              </div>
            </div>

            {/* Feature Cards Marquee */}
            <div className="pt-12 sm:pt-16 lg:pt-20 space-y-6 sm:space-y-8">
              {/* First Marquee Row - Left to Right */}
              <div className="overflow-hidden">
                <div className="flex gap-4 sm:gap-6 animate-marquee-left">
                  {[
                    { title: t('landing.vitalSignsCard'), icon: HeartPulse },
                    { title: t('landing.riskEvaluationCard'), icon: TrendingUp },
                    { title: t('landing.lifestyleOptCard'), icon: Zap },
                    { title: t('landing.insightsReportsCard'), icon: BarChart3 },
                    // Duplicate for seamless loop
                    { title: t('landing.vitalSignsCard'), icon: HeartPulse },
                    { title: t('landing.riskEvaluationCard'), icon: TrendingUp },
                    { title: t('landing.lifestyleOptCard'), icon: Zap },
                    { title: t('landing.insightsReportsCard'), icon: BarChart3 },
                  ].map((card, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 w-48 sm:w-72 px-5 py-4 sm:py-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:-translate-y-0.5 transition-all group"
                    >
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center flex-shrink-0">
                          <card.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <p className="text-xs sm:text-base font-bold text-slate-900 line-clamp-2">{card.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Second Marquee Row - Right to Left */}
              <div className="overflow-hidden">
                <div className="flex gap-4 sm:gap-6 animate-marquee-right">
                  {[
                    { title: t('landing.insightsReportsCard'), icon: BarChart3 },
                    { title: t('landing.lifestyleOptCard'), icon: Zap },
                    { title: t('landing.riskEvaluationCard'), icon: TrendingUp },
                    { title: t('landing.vitalSignsCard'), icon: HeartPulse },
                    // Duplicate for seamless loop
                    { title: t('landing.insightsReportsCard'), icon: BarChart3 },
                    { title: t('landing.lifestyleOptCard'), icon: Zap },
                    { title: t('landing.riskEvaluationCard'), icon: TrendingUp },
                    { title: t('landing.vitalSignsCard'), icon: HeartPulse },
                  ].map((card, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 w-48 sm:w-72 px-5 py-4 sm:py-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:-translate-y-0.5 transition-all group"
                    >
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center flex-shrink-0">
                          <card.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        <p className="text-xs sm:text-base font-bold text-slate-900 line-clamp-2">{card.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 z-10 scroll-reveal delay-100">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-12 sm:space-y-16">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-4 sm:mb-6">
                {t('landing.feature1Title')} <span className="bg-gradient-to-r from-blue-600 to-slate-600 bg-clip-text text-transparent">{t('common.appName')}</span>
              </h2>
              <p className="text-sm sm:text-lg text-slate-600">{t('landing.description')}</p>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-50 to-white border border-slate-200">
              <div className="relative rounded-[2rem] border border-slate-100 bg-white p-3 sm:p-6 lg:p-8">
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {[
                    {
                      title: t('landing.features'),
                      path: "/features",
                    },
                    {
                      title: t('landing.about'),
                      path: "/about",
                    },
                    {
                      title: t('landing.contact'),
                      path: "/contact",
                    },
                  ].map((feature, i) => (
                    <Link key={i} to={feature.path} className="group block">
                      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden p-2 sm:p-4 text-center active:scale-[0.98]">
                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight line-clamp-2">{feature.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discover Recommended Health Tools — Shop CTA */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 z-10 scroll-reveal delay-100">
        <div className="max-w-5xl mx-auto">
          <Link to="/shop" className="group block space-y-4">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-50 via-sky-50 to-cyan-50 p-6 transition-all duration-500 hover:-translate-y-0.5">
              <div className="relative rounded-[1.75rem] border border-slate-100 bg-white p-6">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">{t('landing.tools.heading')}</h2>
                <p className="mt-3 text-sm sm:text-base text-slate-700">{t('landing.tools.intro')}</p>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-50 via-sky-50 to-cyan-50 p-6 transition-all duration-500 hover:-translate-y-0.5">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 items-center">
                <div className="space-y-4">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t('landing.tools.subheading')}</h3>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {[
                      { icon: Dumbbell, label: t('landing.tools.exerciseTitle') },
                      { icon: HeartPulse, label: t('landing.tools.healthTitle') },
                      { icon: Moon, label: t('landing.tools.sleepTitle') },
                      { icon: Brain, label: t('landing.tools.stressTitle') },
                      { icon: Wind, label: t('landing.tools.airTitle') },
                      { icon: ClipboardList, label: t('landing.tools.productivityTitle') },
                    ].map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-slate-200 text-slate-900 text-xs sm:text-sm font-semibold">
                        <c.icon className="h-3.5 w-3.5 text-slate-700" />{c.label}
                      </span>
                    ))}
                  </div>
                  <div className="pt-3">
                    <span className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-slate-900 text-white font-bold transition-all">
                      {t('landing.tools.subheading')} →
                    </span>
                  </div>
                </div>

                <div className="relative hidden lg:flex h-64 w-64 items-center justify-center rounded-[2rem] border border-slate-200 bg-white">
                  <ShoppingBag className="h-16 w-16 text-sky-700" />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Modern Technology Section with full-width background */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 z-10 overflow-hidden">
        {/* Full-width background image with smooth zoom effect */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <img
            src="/2 (2).png"
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="w-full h-full object-cover"
            style={{ animation: 'zoom-in-out 8s ease-in-out infinite' }}
          />
          {/* Light themed gradient overlay - keeps image visible while ensuring text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/70 via-blue-50/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/40" />
        </div>
        <div className="max-w-6xl mx-auto relative scroll-reveal delay-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center">
            <div className="relative h-56 sm:h-96 rounded-3xl overflow-hidden border border-slate-200 animate-fade-in-up order-2 lg:order-1">
              <img
                src="/2 (2).png"
                alt="Health Features"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent" />
            </div>
            <div className="space-y-4 sm:space-y-6 scroll-reveal delay-200 order-1 lg:order-2">
              <h3 className="text-2xl sm:text-4xl font-black text-slate-900">
                {t('landing.modernTech')}
                <span className="block text-blue-600">{t('landing.forBetterResults')}</span>
              </h3>
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{t('landing.modernTechDesc')}</p>
              <div className="space-y-3 sm:space-y-4 pt-2">
                {[t('landing.realtimeAnalytics'), t('landing.predictiveAlerts'), t('landing.cloudStorage')].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm sm:text-base text-slate-700 neumorphic-list scroll-reveal"
                    style={{ transitionDelay: `${220 + i * 80}ms` }}
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-slate-600 rounded-full" />
                    {item}
                  </div>
                ))}
              </div>
              <button className="mt-4 sm:mt-6 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold transition-all hover:from-blue-700 hover:to-blue-800 hover:-translate-y-0.5">
                {t('landing.learnMore')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 sm:py-24 px-4 sm:px-6 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="group relative rounded-3xl overflow-hidden scroll-reveal delay-100 transition-all duration-500 hover:-translate-y-0.5 bg-gradient-to-br from-white via-blue-50/60 to-white border border-slate-200">
            <div className="relative p-8 sm:p-12 lg:p-16 text-center space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-3 sm:mb-4">{t('landing.startToday')}</h2>
                <p className="text-sm sm:text-lg text-slate-700 max-w-2xl mx-auto">{t('landing.ctaDesc')}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4">
                <LoginDropdown variant="cta" />
                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-flex h-12 sm:h-14 items-center justify-center rounded-xl bg-white px-6 sm:px-8 text-slate-900 font-semibold border border-slate-200 transition-all hover:-translate-y-0.5 hover:border-blue-300"
                >
                  {t('landing.qualitySummary')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="relative py-10 sm:py-14 px-4 sm:px-6 z-10 scroll-reveal delay-100">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 sm:p-8">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <h4 className="text-base sm:text-lg font-black text-amber-900">{t('landing.disclaimer.heading')}</h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{t('landing.disclaimer.p1')}</p>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{t('landing.disclaimer.p2')}</p>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{t('landing.disclaimer.p3')}</p>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{t('landing.disclaimer.p4')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-12 sm:mt-20">
        <div className="w-full border-t border-slate-200 bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/40">
          {/* Expert highlight strip */}
          <div className="px-5 sm:px-8 py-5 sm:py-6 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200/70">
            <div className="max-w-6xl mx-auto flex items-center gap-4">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-slate-900/5 flex items-center justify-center shrink-0 ring-1 ring-slate-200">
                <Stethoscope className="h-6 w-6 sm:h-7 sm:w-7 text-slate-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-bold tracking-wider uppercase flex items-center gap-1.5 text-slate-500"><Award className="w-3 h-3" />{t('landing.expert.heading')}</p>
                <p className="text-sm sm:text-base font-black truncate text-slate-900">{t('landing.expert.name')}</p>
                <p className="text-xs text-slate-600 truncate">{t('landing.expert.credentials')} • {t('landing.expert.role')}</p>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <Heart className="h-4 w-4 text-white" />
              </div>
              <span className="text-base font-black text-slate-900">{t('common.appName')}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              <div>
                <p className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">{t('landing.product')}</p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li><Link to="/features" className="hover:text-blue-600 transition">{t('landing.features')}</Link></li>
                  <li><Link to="/shop" className="hover:text-blue-600 transition">{lang === 'sw' ? 'Duka' : 'Shop'}</Link></li>
                  <li><a href="#" className="hover:text-blue-600 transition">{t('landing.pricing')}</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition">{t('landing.security')}</a></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">{t('landing.company')}</p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li><Link to="/about" className="hover:text-blue-600 transition">{t('landing.about')}</Link></li>
                  <li><a href="#" className="hover:text-blue-600 transition">{t('landing.blog')}</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition">{t('landing.careers')}</a></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">{t('landing.legal')}</p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li><a href="#" className="hover:text-blue-600 transition">{t('landing.privacyPolicy')}</a></li>
                  <li><a href="#" className="hover:text-blue-600 transition">{t('landing.terms')}</a></li>
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider">{t('landing.contact')}</p>
                <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                  <li><a href="#" className="hover:text-blue-600 transition">{t('landing.support')}</a></li>
                  <li><Link to="/contact" className="hover:text-blue-600 transition">{t('landing.contact')}</Link></li>
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200/70 text-xs text-slate-600">
              <p>{t('landing.copyright')}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}