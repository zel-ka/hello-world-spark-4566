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
  const { t } = useI18n();
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
        <div className="w-3 h-3 bg-blue-500 rounded-full opacity-70 blur-sm" />
        <div className="absolute w-6 h-6 border-2 border-blue-400 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-50" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 glassmorphic-nav border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center border border-blue-400/30 shadow-glow neumorphic-button">
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

      {/* Animated Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -right-40 w-80 h-80 rounded-full bg-blue-400/15 blur-3xl animate-float opacity-60" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-slate-400/15 blur-3xl animate-float-slow opacity-60" style={{ animationDelay: "1.5s" }} />
        <div className="absolute top-1/3 left-1/4 w-72 h-72 rounded-full bg-blue-300/10 blur-3xl animate-float opacity-50" style={{ animationDelay: "3s" }} />
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20 animate-pulse" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s` }} />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-40 pb-12 sm:pb-20 px-4 sm:px-6 overflow-hidden min-h-screen flex items-center justify-center z-10">
        <div ref={heroBgRef} className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 will-change-transform" style={{ backgroundImage: "url('/1 (2).png')" }} />
        <div ref={heroMidRef} className="absolute -left-24 top-10 w-96 h-96 rounded-full bg-blue-400/12 blur-3xl opacity-70 will-change-transform" />
        <div ref={heroFgRef} className="absolute right-0 bottom-10 w-72 h-72 rounded-full bg-slate-900/10 blur-3xl opacity-80 will-change-transform" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50 via-blue-50/80 to-transparent" />
        
        <div className="w-full max-w-5xl mx-auto relative z-20">
          <div className="space-y-8 sm:space-y-12 text-center">
            {/* Badge */}
            <div className="inline-flex justify-center">
              <span className="text-xs sm:text-sm font-semibold text-blue-600 bg-blue-100/60 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full border border-blue-200/50 backdrop-blur-sm hover:bg-blue-100/80 transition-colors">
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
                  className="w-full px-8 h-12 sm:h-14 lg:h-16 rounded-2xl text-base sm:text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-glow hover:shadow-xl hover:-translate-y-1 transition-all text-white"
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
                      className="flex-shrink-0 w-48 sm:w-72 px-5 py-4 sm:py-6 rounded-2xl border border-slate-200/70 bg-white/95 shadow-floating hover:shadow-glow hover:-translate-y-1 transition-all group"
                    >
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-xl transition-shadow flex-shrink-0">
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
                      className="flex-shrink-0 w-48 sm:w-72 px-5 py-4 sm:py-6 rounded-2xl border border-slate-200/70 bg-white/95 shadow-floating hover:shadow-glow hover:-translate-y-1 transition-all group"
                    >
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-xl transition-shadow flex-shrink-0">
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

            <div className="relative overflow-hidden rounded-[2rem] bg-blue-50/70 border border-white/70 shadow-elevated">
              <div className="absolute inset-x-10 top-0 h-64 rounded-[1.8rem] bg-gradient-to-br from-blue-200/60 via-white/15 to-transparent blur-3xl opacity-90" />
              <div className="absolute -bottom-12 left-8 w-60 h-60 rounded-full bg-cyan-300/25 blur-3xl" />
              <div className="absolute -top-8 right-12 w-52 h-52 rounded-full bg-slate-900/8 blur-3xl" />
              <div className="relative glass-secondary rounded-[2rem] border border-white/30 bg-white/80 p-5 sm:p-6 lg:p-8">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    {
                      icon: HeartPulse,
                      title: t('landing.vitalSignsCard'),
                      path: "/try",
                      color: "from-blue-500 to-blue-600",
                    },
                    {
                      icon: TrendingUp,
                      title: t('landing.riskEvaluationCard'),
                      path: "/try",
                      color: "from-cyan-500 to-blue-500",
                    },
                    {
                      icon: Zap,
                      title: t('landing.lifestyleOptCard'),
                      path: "/try",
                      color: "from-emerald-500 to-teal-500",
                    },
                    {
                      icon: BarChart3,
                      title: t('landing.insightsReportsCard'),
                      path: "/try",
                      color: "from-purple-500 to-indigo-500",
                    },
                  ].map((feature, i) => (
                    <Link key={i} to={feature.path} className="group block">
                      <div className="w-full rounded-3xl border border-slate-200/80 bg-white/95 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden p-4 text-center active:scale-[0.98]">
                        <div className={`mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg shadow-slate-900/10 transition-all group-hover:shadow-xl`}>
                          <feature.icon className="h-5 w-5" />
                        </div>
                        <h3 className="text-sm font-semibold text-slate-900 leading-tight">{feature.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Links to dedicated pages */}
      <section className="relative py-16 sm:py-20 px-4 sm:px-6 z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link to="/about" className="group block rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center shadow-lg">
                <Heart className="h-5 w-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">{t('overlay.about') || 'About Afya Compass'}</h3>
            </div>
            <p className="text-sm text-slate-600">Discover our story, mission and how Afya Compass guides your health journey.</p>
            <span className="mt-4 inline-block text-sm font-semibold text-blue-700 group-hover:translate-x-1 transition-transform">Learn more →</span>
          </Link>
          <Link to="/features" className="group block rounded-3xl border border-slate-200/80 bg-white/95 p-6 sm:p-8 shadow-soft hover:shadow-elevated hover:-translate-y-0.5 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">Powerful Features</h3>
            </div>
            <p className="text-sm text-slate-600">Real-time tracking, AI insights, smart alerts and secure data — all in one place.</p>
            <span className="mt-4 inline-block text-sm font-semibold text-blue-700 group-hover:translate-x-1 transition-transform">Explore features →</span>
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
            <div className="relative h-56 sm:h-96 rounded-3xl overflow-hidden shadow-floating border border-white/50 animate-fade-in-up order-2 lg:order-1">
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
              <button className="mt-4 sm:mt-6 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold shadow-glow transition-all hover:shadow-xl hover:-translate-y-1 neumorphic-button">
                {t('landing.learnMore')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 sm:py-24 px-4 sm:px-6 z-10">
        <div className="max-w-4xl mx-auto">
          <div
            className="group relative rounded-3xl overflow-hidden scroll-reveal delay-100 transition-all duration-500 hover:-translate-y-1"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.18) 100%)",
              backdropFilter: "blur(28px) saturate(180%)",
              WebkitBackdropFilter: "blur(28px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.45)",
              boxShadow:
                "0 20px 60px -15px rgba(31, 70, 130, 0.25), inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(255,255,255,0.15)",
            }}
          >
            {/* Glass refraction highlights */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-b from-white/40 via-transparent to-transparent opacity-70" />
            <div className="pointer-events-none absolute -top-1/2 -left-1/3 w-[160%] h-full rotate-12 bg-gradient-to-r from-transparent via-white/30 to-transparent blur-2xl opacity-60" />
            <div className="pointer-events-none absolute -top-32 -right-32 w-64 h-64 bg-blue-400/25 rounded-full blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -left-32 w-64 h-64 bg-slate-300/25 rounded-full blur-3xl" />
            {/* Shine sweep on hover */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute -inset-y-10 -left-1/3 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-md opacity-0 group-hover:opacity-100 group-hover:translate-x-[400%] transition-all duration-1000 ease-out" />
            </div>

            <div className="relative p-8 sm:p-12 lg:p-16 text-center space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-3 sm:mb-4 drop-shadow-sm">{t('landing.startToday')}</h2>
                <p className="text-sm sm:text-lg text-slate-700 max-w-2xl mx-auto">{t('landing.ctaDesc')}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2 sm:pt-4">
                <LoginDropdown variant="cta" />
                <Link
                  to="/contact"
                  className="w-full sm:w-auto inline-flex h-12 sm:h-14 items-center justify-center rounded-xl bg-white/80 px-6 sm:px-8 text-slate-900 font-semibold transition-all hover:-translate-y-0.5 hover:bg-white"
                  style={{
                    backdropFilter: "blur(16px) saturate(160%)",
                    WebkitBackdropFilter: "blur(16px) saturate(160%)",
                    border: "1px solid rgba(255,255,255,0.55)",
                    boxShadow:
                      "0 8px 24px -8px rgba(31, 70, 130, 0.2), inset 0 1px 0 rgba(255,255,255,0.6)",
                  }}
                >
                  {t('landing.qualitySummary')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Discover Recommended Health Tools — Shop CTA */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 z-10 scroll-reveal delay-100">
        <div className="max-w-5xl mx-auto">
          <Link to="/shop" className="group block">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-6 sm:p-10 lg:p-12 shadow-floating hover:shadow-glow hover:-translate-y-1 transition-all duration-500">
              {/* Decorative blobs */}
              <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/15 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-cyan-300/25 blur-3xl" />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_60%)]" />
              {/* Shine sweep */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[2rem]">
                <div className="absolute -inset-y-10 -left-1/3 w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-md opacity-0 group-hover:opacity-100 group-hover:translate-x-[400%] transition-all duration-1000 ease-out" />
              </div>

              <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 items-center">
                <div className="text-white space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase">{t('landing.tools.smartNote')}</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-tight">{t('landing.tools.heading')}</h2>
                  <p className="text-sm sm:text-base text-blue-50">{t('landing.tools.intro')}</p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {[
                      { icon: Dumbbell, label: t('landing.tools.exerciseTitle') },
                      { icon: HeartPulse, label: t('landing.tools.healthTitle') },
                      { icon: Moon, label: t('landing.tools.sleepTitle') },
                      { icon: Brain, label: t('landing.tools.stressTitle') },
                      { icon: Wind, label: t('landing.tools.airTitle') },
                      { icon: ClipboardList, label: t('landing.tools.productivityTitle') },
                    ].map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-[11px] sm:text-xs font-semibold text-white">
                        <c.icon className="h-3.5 w-3.5" />{c.label}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-3 text-xs sm:text-sm text-blue-50">
                    <span className="inline-flex items-center gap-1.5"><Shield className="h-4 w-4" />{t('common.appName')}</span>
                  </div>

                  <div className="pt-3">
                    <span className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-white text-blue-700 font-bold shadow-lg group-hover:shadow-xl group-hover:translate-x-1 transition-all">
                      {t('landing.tools.subheading')} →
                    </span>
                  </div>
                </div>

                {/* Visual cluster */}
                <div className="relative hidden lg:block w-64 h-64">
                  <div className="absolute inset-0 rounded-3xl bg-white/10 backdrop-blur-md border border-white/30" />
                  <div className="absolute top-6 left-6 h-20 w-20 rounded-2xl bg-white text-blue-700 flex items-center justify-center text-4xl shadow-xl rotate-[-8deg]">🩺</div>
                  <div className="absolute top-4 right-6 h-16 w-16 rounded-2xl bg-white text-blue-700 flex items-center justify-center text-3xl shadow-xl rotate-[10deg]">🏋️</div>
                  <div className="absolute bottom-8 left-10 h-16 w-16 rounded-2xl bg-white text-blue-700 flex items-center justify-center text-3xl shadow-xl rotate-[6deg]">⚖️</div>
                  <div className="absolute bottom-6 right-4 h-20 w-20 rounded-2xl bg-white text-blue-700 flex items-center justify-center text-4xl shadow-xl rotate-[-4deg]">🌬️</div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-14 w-14 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center shadow-2xl">
                    <ShoppingBag className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Doctor Preparation — Coming Soon */}
      <section className="relative py-12 sm:py-20 px-4 sm:px-6 z-10 scroll-reveal delay-100">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-blue-200 bg-gradient-to-br from-white via-blue-50/40 to-white p-6 sm:p-10 shadow-floating overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-blue-300/30 blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row gap-5 sm:gap-7 items-start">
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                <Stethoscope className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-[10px] font-bold tracking-wider uppercase">
                    <Sparkles className="h-3 w-3" /> {t('landing.doctorPrep.comingSoon')}
                  </span>
                </div>
                <h3 className="text-xl sm:text-3xl font-black text-slate-900">{t('landing.doctorPrep.heading')}</h3>
                <p className="text-sm sm:text-base text-blue-700 font-semibold mt-1">{t('landing.doctorPrep.subheading')}</p>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed mt-3">{t('landing.doctorPrep.desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Expert Section */}
      <section className="relative py-12 sm:py-16 px-4 sm:px-6 z-10 scroll-reveal delay-100">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 backdrop-blur-sm border border-blue-200 mb-4">
            <Award className="w-3.5 h-3.5 text-blue-700" />
            <span className="text-[10px] sm:text-xs font-semibold text-blue-700 tracking-wider uppercase">{t('landing.expert.heading')}</span>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 sm:p-10 shadow-floating">
            <div className="h-16 w-16 sm:h-20 sm:w-20 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
              <Stethoscope className="h-8 w-8 sm:h-10 sm:w-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">{t('landing.expert.name')}</h3>
            <p className="text-sm font-semibold text-blue-700 mt-1">{t('landing.expert.credentials')}</p>
            <p className="text-sm sm:text-base text-slate-600 mt-2">{t('landing.expert.role')}</p>
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
      <footer className="relative border-t border-white/40 backdrop-blur-xl z-10 py-8 sm:py-12 px-4 sm:px-6 bg-white/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-3 sm:mb-4">{t('landing.product')}</p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li><Link to="/features" className="hover:text-blue-600 transition">{t('landing.features')}</Link></li>
                <li><Link to="/shop" className="hover:text-blue-600 transition">{lang === 'sw' ? 'Duka' : 'Shop'}</Link></li>
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.pricing')}</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.security')}</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-3 sm:mb-4">{t('landing.company')}</p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.about')}</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.blog')}</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.careers')}</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-3 sm:mb-4">{t('landing.legal')}</p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.privacyPolicy')}</a></li>
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.terms')}</a></li>
              </ul>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 mb-3 sm:mb-4">{t('landing.contact')}</p>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-600">
                <li><a href="#" className="hover:text-blue-600 transition">{t('landing.support')}</a></li>
                <li><Link to="/contact" className="hover:text-blue-600 transition">{t('landing.contact')}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/40 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-slate-600">
            <p>{t('landing.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}