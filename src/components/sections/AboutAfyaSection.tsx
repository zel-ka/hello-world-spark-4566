import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useI18n } from "@/hooks/useI18n";

import sw1 from "@/assets/about/kiswahili11.png";
import en1 from "@/assets/about/english11.png";
import sw2 from "@/assets/about/kiswahili22.png";
import en2 from "@/assets/about/english22.png";
import sw3 from "@/assets/about/kiswahili33.png";
import en3 from "@/assets/about/english33.png";

gsap.registerPlugin(ScrollTrigger);

// Pairs in order: each pair = [Swahili, English]
const SLIDES = [
  { sw: sw1, en: en1, label: "Health Tracking" },
  { sw: sw2, en: en2, label: "Powerful Features" },
  { sw: sw3, en: en3, label: "About Us" },
];

export default function AboutAfyaSection() {
  const { lang } = useI18n();
  const sectionRef = useRef<HTMLElement | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (!sectionRef.current || !stackRef.current) return;

    const ctx = gsap.context(() => {
      const slides = gsap.utils.toArray<HTMLElement>(".about-slide");
      // Each slide has 2 layers: [0]=swahili (front), [1]=english (back)
      // Total steps = slides * 2 (sw->en transitions) + (slides-1) (en->next sw transitions)
      // Simpler: 6 visual states = sw1, en1, sw2, en2, sw3, en3 (5 transitions between them)
      const totalStates = SLIDES.length * 2; // 6
      const transitions = totalStates - 1; // 5

      // Initial state: only first sw visible, others hidden below with rotation
      slides.forEach((slide, i) => {
        const sw = slide.querySelector<HTMLElement>(".layer-sw")!;
        const en = slide.querySelector<HTMLElement>(".layer-en")!;
        gsap.set(sw, {
          autoAlpha: i === 0 ? 1 : 0,
          scale: i === 0 ? 1 : 0.85,
          y: i === 0 ? 0 : 120,
          rotateX: i === 0 ? 0 : -25,
          rotateZ: i === 0 ? 0 : 8,
          transformPerspective: 1000,
          transformOrigin: "center bottom",
        });
        gsap.set(en, {
          autoAlpha: 0,
          scale: 0.85,
          y: 120,
          rotateX: -25,
          rotateZ: -8,
          transformPerspective: 1000,
          transformOrigin: "center bottom",
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => `+=${window.innerHeight * transitions * 0.9}`,
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progressRef.current) {
              progressRef.current.style.width = `${self.progress * 100}%`;
            }
            // Update active label
            const stateIndex = Math.min(
              totalStates - 1,
              Math.floor(self.progress * totalStates)
            );
            const slideIdx = Math.floor(stateIndex / 2);
            const isEn = stateIndex % 2 === 1;
            if (labelRef.current) {
              labelRef.current.textContent = `${slideIdx + 1} / ${SLIDES.length} — ${
                isEn ? "English" : "Kiswahili"
              }`;
            }
          },
        },
      });

      // Build sequence: sw1 -> en1 -> sw2 -> en2 -> sw3 -> en3
      const eases = "power2.inOut";
      const dur = 1;

      for (let i = 0; i < SLIDES.length; i++) {
        const slide = slides[i];
        const sw = slide.querySelector<HTMLElement>(".layer-sw")!;
        const en = slide.querySelector<HTMLElement>(".layer-en")!;

        // Transition: sw[i] -> en[i] (sw rotates out upward, en rises from bottom with rotation)
        tl.to(
          sw,
          { autoAlpha: 0, scale: 0.85, y: -120, rotateX: 25, rotateZ: -8, duration: dur, ease: eases },
          "+=0"
        ).to(
          en,
          { autoAlpha: 1, scale: 1, y: 0, rotateX: 0, rotateZ: 0, duration: dur, ease: eases },
          "<"
        );

        // Transition: en[i] -> sw[i+1] (if not last)
        if (i < SLIDES.length - 1) {
          const next = slides[i + 1];
          const nextSw = next.querySelector<HTMLElement>(".layer-sw")!;
          tl.to(
            en,
            { autoAlpha: 0, scale: 0.85, y: -120, rotateX: 25, rotateZ: 8, duration: dur, ease: eases },
            "+=0.3"
          ).to(
            nextSw,
            { autoAlpha: 1, scale: 1, y: 0, rotateX: 0, rotateZ: 0, duration: dur, ease: eases },
            "<"
          );
        }
      }

      // Animate text reveal on enter
      gsap.from(".about-text > *", {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const isSw = lang === "sw";

  return (
    <section
      ref={sectionRef}
      className="relative bg-gradient-to-b from-white via-blue-50/40 to-white overflow-hidden"
      style={{ minHeight: "100vh" }}
      aria-label="About Afya Compass"
    >
      <div className="relative h-screen flex items-center px-4 sm:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* LEFT: Text */}
          <div className="about-text space-y-5 sm:space-y-7 z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/80 backdrop-blur-sm border border-blue-200">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-blue-700 tracking-wider uppercase">
                {isSw ? "Kuhusu Sisi" : "About Us"}
              </span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-slate-900">
              {isSw ? (
                <>
                  Afya Yako,
                  <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Dira Yetu.
                  </span>
                </>
              ) : (
                <>
                  Your Health,
                  <span className="block bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                    Our Compass.
                  </span>
                </>
              )}
            </h2>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
              {isSw
                ? "Afya Compass ni mfumo wa kisasa unaokusaidia kufuatilia, kuelewa na kuboresha afya yako kila siku — kwa lugha mbili: Kiswahili na English."
                : "Afya Compass is a modern platform that helps you track, understand and improve your health every day — in two languages: Kiswahili and English."}
            </p>

            {/* Feature bullets */}
            <ul className="space-y-3 pt-2">
              {(isSw
                ? ["Fuatilia afya kwa wakati halisi", "Pata uchambuzi wa kibinafsi", "Salama na siri kabisa"]
                : ["Real-time health tracking", "Personalized insights", "Fully secure & private"]
              ).map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-sm sm:text-base text-slate-700">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>

            {/* Progress + label */}
            <div className="pt-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <span>{isSw ? "Endelea kusoma" : "Keep scrolling"}</span>
                <span ref={labelRef}>1 / {SLIDES.length} — Kiswahili</span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  ref={progressRef}
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full"
                  style={{ width: "0%" }}
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Image stack */}
          <div className="relative h-[420px] sm:h-[520px] lg:h-[600px] w-full">
            {/* Decorative glows */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl pointer-events-none" />

            <div ref={stackRef} className="relative w-full h-full">
              {SLIDES.map((slide, i) => (
                <div
                  key={i}
                  className="about-slide absolute inset-0"
                  style={{ zIndex: SLIDES.length - i }}
                >
                  {/* Swahili layer */}
                  <div className="layer-sw absolute inset-0 will-change-transform">
                    <div className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-blue-500/80 shadow-2xl shadow-blue-500/30 ring-1 ring-blue-200 bg-white">
                      <img
                        src={slide.sw}
                        alt={`Kiswahili slide ${i + 1}`}
                        className="w-full h-full object-contain p-2"
                        loading={i === 0 ? "eager" : "lazy"}
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-bold tracking-wide shadow-lg">
                        KISWAHILI
                      </div>
                    </div>
                  </div>
                  {/* English layer */}
                  <div className="layer-en absolute inset-0 will-change-transform">
                    <div className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-blue-600/80 shadow-2xl shadow-blue-600/30 ring-1 ring-blue-200 bg-white">
                      <img
                        src={slide.en}
                        alt={`English slide ${i + 1}`}
                        className="w-full h-full object-contain p-2"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold tracking-wide shadow-lg">
                        ENGLISH
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll hint at bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 text-xs animate-bounce pointer-events-none">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
