import { useEffect, useMemo, useState } from "react";

interface StartupScreenProps {
  onDone: () => void;
  minDurationMs?: number;
  celebrate?: boolean;
  message?: string;
}

type Petal = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
  spin: number;
  scale: number;
  hue: number;
  shape: "petal" | "spark" | "leaf";
};

export function StartupScreen({
  onDone,
  minDurationMs = 2200,
  celebrate = false,
  message,
}: StartupScreenProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setLeaving(true), minDurationMs);
    const t2 = window.setTimeout(() => onDone(), minDurationMs + 450);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [minDurationMs, onDone]);

  const petals = useMemo<Petal[]>(() => {
    if (!celebrate) return [];
    const palette = [350, 330, 20, 45, 175, 200, 280];
    const shapes: Petal["shape"][] = ["petal", "petal", "petal", "spark", "leaf"];
    return Array.from({ length: 38 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 1.1,
      duration: 2.4 + Math.random() * 2.2,
      drift: (Math.random() - 0.5) * 220,
      rotate: Math.random() * 360,
      spin: 360 + Math.random() * 720,
      scale: 0.7 + Math.random() * 0.8,
      hue: palette[Math.floor(Math.random() * palette.length)],
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));
  }, [celebrate]);

  return (
    <div
      role="status"
      aria-label="Loading Tathmini Afya"
      className={[
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden",
        "bg-gradient-to-b from-[#d3ebe8] via-[#c7f6f4] to-[#a8e6e1]",
        "transition-opacity duration-500 ease-out",
        leaving ? "opacity-0" : "opacity-100",
      ].join(" ")}
      style={{ perspective: "900px" }}
    >
      {celebrate && (
        <>
          {/* Burst rings behind the logo */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
            <span className="absolute h-40 w-40 rounded-full border-2 border-white/60 animate-[burst_1.6s_ease-out_forwards]" />
            <span className="absolute h-40 w-40 rounded-full border border-amber-300/70 animate-[burst_2s_ease-out_300ms_forwards]" />
            <span className="absolute h-40 w-40 rounded-full border border-rose-300/70 animate-[burst_2.4s_ease-out_600ms_forwards]" />
          </div>

          {/* 3D falling petals / sparks */}
          <div
            className="pointer-events-none absolute inset-0"
            aria-hidden
            style={{ transformStyle: "preserve-3d" }}
          >
            {petals.map((p) => (
              <span
                key={p.id}
                className="absolute top-[-10%] animate-[petal-fall_var(--dur)_cubic-bezier(.2,.6,.3,1)_var(--delay)_forwards]"
                style={
                  {
                    left: `${p.left}%`,
                    ["--dur" as any]: `${p.duration}s`,
                    ["--delay" as any]: `${p.delay}s`,
                    ["--drift" as any]: `${p.drift}px`,
                    ["--rot" as any]: `${p.rotate}deg`,
                    ["--spin" as any]: `${p.spin}deg`,
                    transformStyle: "preserve-3d",
                  } as React.CSSProperties
                }
              >
                <span
                  className="block"
                  style={{
                    width: p.shape === "spark" ? `${6 * p.scale}px` : `${14 * p.scale}px`,
                    height: p.shape === "spark" ? `${6 * p.scale}px` : `${20 * p.scale}px`,
                    borderRadius:
                      p.shape === "petal"
                        ? "60% 40% 60% 40% / 70% 60% 40% 30%"
                        : p.shape === "leaf"
                        ? "0 100% 0 100%"
                        : "9999px",
                    background:
                      p.shape === "spark"
                        ? `radial-gradient(circle at 30% 30%, hsl(${p.hue} 100% 80%), hsl(${p.hue} 90% 55%))`
                        : `linear-gradient(135deg, hsl(${p.hue} 95% 78%) 0%, hsl(${p.hue} 85% 58%) 60%, hsl(${p.hue} 70% 42%) 100%)`,
                    boxShadow: `0 6px 14px hsl(${p.hue} 80% 45% / 0.35), inset 0 0 6px hsl(${p.hue} 100% 90% / 0.6)`,
                    transform: `rotateX(35deg) rotateZ(${p.rotate}deg)`,
                  }}
                />
              </span>
            ))}
          </div>
        </>
      )}

      <div className="relative flex flex-col items-center gap-6 animate-[splash-in_700ms_ease-out_both]">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-white/40 blur-2xl scale-110" aria-hidden />
          {celebrate && (
            <div
              className="absolute inset-0 rounded-3xl scale-125 animate-[pulse-glow_1.6s_ease-in-out_infinite]"
              aria-hidden
              style={{
                background:
                  "radial-gradient(circle, rgba(255,221,128,0.55), rgba(255,159,212,0.25) 60%, transparent 75%)",
              }}
            />
          )}
          <img
            src="/TathminiAfyaLogo.png"
            alt="Tathmini Afya"
            className={[
              "relative h-28 w-28 sm:h-32 sm:w-32 rounded-3xl shadow-2xl object-contain bg-white/80 p-3",
              celebrate ? "animate-[logo-pop_900ms_cubic-bezier(.3,1.4,.5,1)_both]" : "",
            ].join(" ")}
            draggable={false}
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Tathmini Afya
          </h1>
          <p className="mt-1 text-sm text-slate-700/80">
            {message ?? "Imarisha Afya Yako"}
          </p>
        </div>
        <div className="mt-4 h-1.5 w-40 overflow-hidden rounded-full bg-white/50">
          <div className="h-full w-1/2 rounded-full bg-slate-900/70 animate-[splash-bar_1.4s_ease-in-out_infinite]" />
        </div>
      </div>

      <style>{`
        @keyframes splash-in {
          0%   { opacity: 0; transform: translateY(8px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes splash-bar {
          0%   { transform: translateX(-100%); }
          50%  { transform: translateX(60%); }
          100% { transform: translateX(220%); }
        }
        @keyframes logo-pop {
          0%   { transform: scale(0.6) rotate(-8deg); opacity: 0; }
          60%  { transform: scale(1.12) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.55; transform: scale(1.15); }
          50%      { opacity: 0.95; transform: scale(1.35); }
        }
        @keyframes burst {
          0%   { transform: scale(0.2); opacity: 0.9; }
          100% { transform: scale(3.4); opacity: 0; }
        }
        @keyframes petal-fall {
          0% {
            transform: translate3d(0, -20vh, 0) rotateX(60deg) rotateZ(var(--rot));
            opacity: 0;
          }
          10% { opacity: 1; }
          100% {
            transform: translate3d(var(--drift), 115vh, 200px) rotateX(80deg) rotateZ(calc(var(--rot) + var(--spin)));
            opacity: 0.9;
          }
        }
      `}</style>
    </div>
  );
}
