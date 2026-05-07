import { useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";
import type { Tip } from "@/lib/health-score";
import { useRecordRecommendation } from "@/hooks/use-daily-logs";
import { Lightbulb } from "lucide-react";

interface Props {
  tips: Tip[];
  userId: string;
}

export function RecommendationsCard({ tips, userId }: Props) {
  const { t } = useI18n();
  const record = useRecordRecommendation();

  // Record shown tips once per render set
  useEffect(() => {
    if (!userId || tips.length === 0) return;
    const key = `tips-recorded-${userId}-${new Date().toISOString().slice(0, 10)}`;
    const recorded = JSON.parse(localStorage.getItem(key) || "[]") as string[];
    const newOnes = tips.filter((t) => !recorded.includes(t.id));
    if (newOnes.length === 0) return;
    newOnes.forEach((tip) => {
      record.mutate({ user_id: userId, tip_id: tip.id, category: tip.category });
    });
    localStorage.setItem(key, JSON.stringify([...recorded, ...newOnes.map((t) => t.id)]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tips.map((t) => t.id).join(","), userId]);

  if (tips.length === 0) return null;

  return (
    <div className="rounded-2xl frosted-glass border border-primary/20 backdrop-blur-md p-4 bg-gradient-to-br from-primary/5 to-transparent shadow-soft">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
          <Lightbulb className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-bold text-foreground">{t("rec.heading")}</h3>
      </div>
      <ul className="space-y-2">
        {tips.map((tip, idx) => (
          <li
            key={tip.id}
            className="flex gap-3 items-start scroll-fade-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <span className="h-5 w-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              {idx + 1}
            </span>
            <p className="text-sm text-foreground leading-snug">{t(tip.textKey)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
