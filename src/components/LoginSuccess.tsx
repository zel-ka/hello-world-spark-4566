import { useEffect, useMemo, useState } from "react";
import { Check } from "lucide-react";

interface LoginSuccessProps {
  message?: string;
  onDone?: () => void;
}

interface Leaf {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotate: number;
  size: number;
  hue: number;
  drift: number;
  phase: "rise" | "fall";
}

/**
 * LoginSuccess overlay
 * - Shows a green check + message
 * - Plays a 1-second leaves animation: leaves rise from the bottom, then spill/fall
 * - Auto-dismisses after ~1s
 */
export default function LoginSuccess({ message = "Karibu!", onDone }: LoginSuccessProps) {
  const [visible, setVisible] = useState(true);

  const leaves = useMemo<Leaf[]>(() => {
    const arr: Leaf[] = [];
    // Rising leaves (first half)
    for (let i = 0; i < 18; i++) {
      arr.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 200,
        duration: 700 + Math.random() * 250,
        rotate: Math.random() * 360,
        size: 14 + Math.random() * 14,
        hue: 110 + Math.random() * 40,
        drift: (Math.random() - 0.5) * 120,
        phase: "rise",
      });
    }
    // Falling leaves (spill, second half)
    for (let i = 0; i < 22; i++) {
      arr.push({
        id: 100 + i,
        left: Math.random() * 100,
        delay: 450 + Math.random() * 350,
        duration: 800 + Math.random() * 400,
        rotate: Math.random() * 360,
        size: 12 + Math.random() * 16,
        hue: 100 + Math.random() * 50,
        drift: (Math.random() - 0.5) * 160,
        phase: "fall",
      });
    }
    return arr;
  }, []);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 450);
    const t2 = setTimeout(() => onDone?.(), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
      {/* Center card */}
      <div className="pointer-events-auto animate-scale-in flex flex-col items-center gap-3 rounded-2xl bg-background/90 backdrop-blur-md px-6 py-5 shadow-2xl border border-border">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-green-500 shadow-lg">
          <Check className="h-8 w-8 text-white" strokeWidth={3} />
          <span className="absolute inset-0 rounded-full bg-green-500/40 animate-ping" />
        </div>
        <p className="text-sm font-semibold text-foreground">{message}</p>
      </div>

      {/* Leaves layer */}
      <div className="absolute inset-0 overflow-hidden">
        {leaves.map((l) => (
          <span
            key={l.id}
            className={l.phase === "rise" ? "leaf-rise" : "leaf-fall"}
            style={{
              left: `${l.left}%`,
              width: `${l.size}px`,
              height: `${l.size}px`,
              animationDelay: `${l.delay}ms`,
              animationDuration: `${l.duration}ms`,
              // pass custom values via CSS vars
              ["--leaf-rotate" as any]: `${l.rotate}deg`,
              ["--leaf-drift" as any]: `${l.drift}px`,
              ["--leaf-hue" as any]: l.hue,
            }}
          >
            <svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
              <path
                d="M12 2C7 6 4 10 4 14a8 8 0 0 0 16 0c0-4-3-8-8-12z"
                fill={`hsl(${l.hue} 65% 42%)`}
                stroke={`hsl(${l.hue} 70% 28%)`}
                strokeWidth="0.6"
              />
              <path
                d="M12 4 V20"
                stroke={`hsl(${l.hue} 70% 25%)`}
                strokeWidth="0.6"
                fill="none"
              />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
