import { useEffect, useState } from "react";

interface StartupScreenProps {
  onDone: () => void;
  minDurationMs?: number;
}

export function StartupScreen({ onDone, minDurationMs = 2200 }: StartupScreenProps) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setLeaving(true), minDurationMs);
    const t2 = window.setTimeout(() => onDone(), minDurationMs + 450);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [minDurationMs, onDone]);

  return (
    <div
      role="status"
      aria-label="Loading Tathmini Afya"
      className={[
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center",
        "bg-gradient-to-b from-[#d3ebe8] via-[#c7f6f4] to-[#a8e6e1]",
        "transition-opacity duration-500 ease-out",
        leaving ? "opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <div className="flex flex-col items-center gap-6 animate-[splash-in_700ms_ease-out_both]">
        <div className="relative">
          <div className="absolute inset-0 rounded-3xl bg-white/40 blur-2xl scale-110" aria-hidden />
          <img
            src="/TathminiAfyaLogo.png"
            alt="Tathmini Afya"
            className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-3xl shadow-2xl object-contain bg-white/80 p-3"
            draggable={false}
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
            Tathmini Afya
          </h1>
          <p className="mt-1 text-sm text-slate-700/80">Imarisha Afya Yako</p>
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
      `}</style>
    </div>
  );
}
