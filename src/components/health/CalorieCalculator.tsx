import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import {
  calcBmi,
  calcBmr,
  calcTdee,
  macroSplit,
  getBmiBand,
  type ActivityLevel,
  type Sex,
} from "@/lib/calculators";
import { Flame, Scale, Apple, Sunrise, Sun, Moon, Cookie, XCircle } from "lucide-react";

const ACTIVITY_OPTIONS: { value: ActivityLevel; labelKey: string }[] = [
  { value: "sedentary", labelKey: "calc.activity.sedentary" },
  { value: "light", labelKey: "calc.activity.light" },
  { value: "moderate", labelKey: "calc.activity.moderate" },
  { value: "active", labelKey: "calc.activity.active" },
  { value: "very_active", labelKey: "calc.activity.veryActive" },
];

type Goal = "bulk" | "maintain" | "cut";

interface FoodEntry {
  name: string;
  serving: string;
  kcal: number;
  // suitability per goal: good | ok | avoid
  bulk: "good" | "ok" | "avoid";
  maintain: "good" | "ok" | "avoid";
  cut: "good" | "ok" | "avoid";
}

// Curated Tanzania foods with realistic kcal per common serving.
const FOODS: FoodEntry[] = [
  // Vyakula vya wanga
  { name: "Ugali", serving: "kikombe 1 (200g)", kcal: 220, bulk: "good", maintain: "good", cut: "ok" },
  { name: "Wali", serving: "kikombe 1 (200g)", kcal: 200, bulk: "good", maintain: "good", cut: "ok" },
  { name: "Pilau", serving: "kikombe 1", kcal: 320, bulk: "good", maintain: "ok", cut: "avoid" },
  { name: "Chapati", serving: "kipande 1", kcal: 280, bulk: "good", maintain: "ok", cut: "avoid" },
  { name: "Ndizi za kupika", serving: "kikombe 1", kcal: 180, bulk: "good", maintain: "good", cut: "ok" },
  { name: "Matoke", serving: "kikombe 1", kcal: 170, bulk: "good", maintain: "good", cut: "ok" },
  { name: "Viazi vitamu", serving: "kikombe 1", kcal: 180, bulk: "good", maintain: "good", cut: "good" },
  { name: "Viazi mviringo", serving: "kikombe 1", kcal: 160, bulk: "good", maintain: "good", cut: "ok" },
  { name: "Mihogo", serving: "kikombe 1", kcal: 200, bulk: "good", maintain: "good", cut: "ok" },
  { name: "Mahindi ya kuchemsha", serving: "gunzi 1", kcal: 150, bulk: "good", maintain: "good", cut: "good" },
  { name: "Makande", serving: "kikombe 1", kcal: 260, bulk: "good", maintain: "good", cut: "good" },
  { name: "Uji wa lishe", serving: "kikombe 1", kcal: 180, bulk: "good", maintain: "good", cut: "good" },
  { name: "Uji wa ulezi", serving: "kikombe 1", kcal: 150, bulk: "good", maintain: "good", cut: "good" },
  { name: "Mkate wa kawaida", serving: "vipande 2", kcal: 160, bulk: "good", maintain: "ok", cut: "ok" },

  // Protini
  { name: "Maharage", serving: "kikombe 1", kcal: 230, bulk: "good", maintain: "good", cut: "good" },
  { name: "Dengu", serving: "kikombe 1", kcal: 220, bulk: "good", maintain: "good", cut: "good" },
  { name: "Choroko", serving: "kikombe 1", kcal: 210, bulk: "good", maintain: "good", cut: "good" },
  { name: "Kunde", serving: "kikombe 1", kcal: 200, bulk: "good", maintain: "good", cut: "good" },
  { name: "Karanga", serving: "kiganja 1 (30g)", kcal: 170, bulk: "good", maintain: "good", cut: "ok" },
  { name: "Mayai", serving: "yai 1", kcal: 78, bulk: "good", maintain: "good", cut: "good" },
  { name: "Maziwa fresh", serving: "glasi 1 (250ml)", kcal: 150, bulk: "good", maintain: "good", cut: "ok" },
  { name: "Mtindi wa asili", serving: "kikombe 1", kcal: 130, bulk: "good", maintain: "good", cut: "good" },
  { name: "Samaki (sangara/sato)", serving: "kipande (150g)", kcal: 220, bulk: "good", maintain: "good", cut: "good" },
  { name: "Dagaa", serving: "kikombe 1/2", kcal: 180, bulk: "good", maintain: "good", cut: "good" },
  { name: "Kuku wa kuchoma", serving: "kipande (150g)", kcal: 280, bulk: "good", maintain: "good", cut: "good" },
  { name: "Nyama ya ng'ombe", serving: "kipande (150g)", kcal: 320, bulk: "good", maintain: "ok", cut: "ok" },
  { name: "Tofu/Soybeans", serving: "kikombe 1/2", kcal: 180, bulk: "good", maintain: "good", cut: "good" },

  // Mboga
  { name: "Mchicha", serving: "kikombe 1", kcal: 40, bulk: "ok", maintain: "good", cut: "good" },
  { name: "Sukuma wiki", serving: "kikombe 1", kcal: 45, bulk: "ok", maintain: "good", cut: "good" },
  { name: "Matembele", serving: "kikombe 1", kcal: 50, bulk: "ok", maintain: "good", cut: "good" },
  { name: "Kisamvu", serving: "kikombe 1", kcal: 60, bulk: "ok", maintain: "good", cut: "good" },
  { name: "Kabichi", serving: "kikombe 1", kcal: 35, bulk: "ok", maintain: "good", cut: "good" },
  { name: "Karoti", serving: "kikombe 1", kcal: 50, bulk: "ok", maintain: "good", cut: "good" },
  { name: "Nyanya", serving: "kikombe 1", kcal: 30, bulk: "ok", maintain: "good", cut: "good" },
  { name: "Bamia", serving: "kikombe 1", kcal: 35, bulk: "ok", maintain: "good", cut: "good" },

  // Matunda
  { name: "Embe", serving: "tunda 1", kcal: 100, bulk: "good", maintain: "good", cut: "good" },
  { name: "Ndizi mbivu", serving: "tunda 1", kcal: 105, bulk: "good", maintain: "good", cut: "ok" },
  { name: "Papai", serving: "kikombe 1", kcal: 60, bulk: "ok", maintain: "good", cut: "good" },
  { name: "Parachichi", serving: "1/2 tunda", kcal: 160, bulk: "good", maintain: "good", cut: "ok" },
  { name: "Chungwa", serving: "tunda 1", kcal: 65, bulk: "ok", maintain: "good", cut: "good" },
  { name: "Tikiti maji", serving: "kikombe 1", kcal: 45, bulk: "ok", maintain: "good", cut: "good" },
  { name: "Nanasi", serving: "kikombe 1", kcal: 80, bulk: "ok", maintain: "good", cut: "good" },

  // Vinywaji & vitafunwa kiwandani (epuka kwa wengi)
  { name: "Soda", serving: "chupa (500ml)", kcal: 210, bulk: "ok", maintain: "avoid", cut: "avoid" },
  { name: "Juice ya viwandani", serving: "glasi 1", kcal: 130, bulk: "ok", maintain: "avoid", cut: "avoid" },
  { name: "Energy drinks", serving: "chupa 1", kcal: 160, bulk: "avoid", maintain: "avoid", cut: "avoid" },
  { name: "Chai ya sukari nyingi", serving: "kikombe 1", kcal: 100, bulk: "ok", maintain: "ok", cut: "avoid" },
  { name: "Mandazi", serving: "kipande 1", kcal: 180, bulk: "good", maintain: "ok", cut: "avoid" },
  { name: "Vitumbua", serving: "kipande 1", kcal: 150, bulk: "good", maintain: "ok", cut: "avoid" },
  { name: "Chips (potato)", serving: "sahani ndogo", kcal: 380, bulk: "ok", maintain: "avoid", cut: "avoid" },
  { name: "Biscuits/Cookies", serving: "vipande 3", kcal: 150, bulk: "ok", maintain: "avoid", cut: "avoid" },
  { name: "Ice cream", serving: "scoop 1", kcal: 200, bulk: "ok", maintain: "avoid", cut: "avoid" },
  { name: "Indomie", serving: "pakiti 1", kcal: 380, bulk: "ok", maintain: "avoid", cut: "avoid" },
  { name: "Margarine/Mayonnaise", serving: "kijiko 1", kcal: 100, bulk: "ok", maintain: "avoid", cut: "avoid" },
];

interface Props {
  initialWeight?: number;
  initialHeight?: number;
  initialAge?: number;
}

export function CalorieCalculator({ initialWeight = 70, initialHeight = 170, initialAge = 30 }: Props) {
  const { t } = useI18n();
  const [weight, setWeight] = useState(initialWeight);
  const [height, setHeight] = useState(initialHeight);
  const [age, setAge] = useState(initialAge);
  const [sex, setSex] = useState<Sex>("male");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");

  const bmi = useMemo(() => calcBmi(weight, height), [weight, height]);
  const bmiBand = useMemo(() => getBmiBand(bmi), [bmi]);
  const bmr = useMemo(() => calcBmr(weight, height, age, sex), [weight, height, age, sex]);
  const tdee = useMemo(() => calcTdee(bmr, activity), [bmr, activity]);
  const macros = useMemo(() => macroSplit(tdee), [tdee]);

  // Map BMI band to dietary goal
  const goal: Goal = useMemo(() => {
    if (bmi === 0) return "maintain";
    if (bmi < 18.5) return "bulk";
    if (bmi < 25) return "maintain";
    return "cut";
  }, [bmi]);

  const goalLabel =
    goal === "bulk"
      ? "Lengo: Kuongeza uzito kwa afya"
      : goal === "cut"
        ? "Lengo: Kupunguza uzito polepole"
        : "Lengo: Kudumisha uzito wako";

  const recommended = FOODS.filter((f) => f[goal] === "good");
  const moderate = FOODS.filter((f) => f[goal] === "ok");
  const avoid = FOODS.filter((f) => f[goal] === "avoid");

  const toneClass =
    bmiBand.tone === "success"
      ? "text-success bg-success/15 border-success/30"
      : bmiBand.tone === "warning"
        ? "text-warning bg-warning/15 border-warning/30"
        : "text-destructive bg-destructive/15 border-destructive/30";

  const renderFoodGroup = (
    title: string,
    items: FoodEntry[],
    icon: React.ReactNode,
    accent: string
  ) => (
    <div>
      <div className={`flex items-center gap-2 mb-2 ${accent}`}>
        {icon}
        <p className="text-sm font-semibold">{title}</p>
        <span className="text-[10px] text-muted-foreground">({items.length})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {items.map((f) => (
          <div
            key={f.name}
            className="flex items-center justify-between gap-2 rounded-lg bg-background/60 border border-border/40 px-2.5 py-1.5"
          >
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-foreground truncate">{f.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{f.serving}</p>
            </div>
            <span className="text-[11px] font-bold text-primary whitespace-nowrap">{f.kcal} kcal</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Inputs */}
      <div className="rounded-2xl frosted-glass border border-border/40 p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">{t("calc.weight")}</label>
            <Input type="number" value={weight} min={20} max={300} onChange={(e) => setWeight(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">{t("calc.height")}</label>
            <Input type="number" value={height} min={100} max={230} onChange={(e) => setHeight(Number(e.target.value))} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">{t("calc.age")}</label>
            <Input type="number" value={age} min={10} max={100} onChange={(e) => setAge(Number(e.target.value))} className="mt-1" />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">{t("calc.sex")}</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Button type="button" variant={sex === "male" ? "default" : "outline"} onClick={() => setSex("male")} className="h-10 rounded-xl">
              {t("calc.male")}
            </Button>
            <Button type="button" variant={sex === "female" ? "default" : "outline"} onClick={() => setSex("female")} className="h-10 rounded-xl">
              {t("calc.female")}
            </Button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">{t("calc.activity")}</label>
          <div className="grid grid-cols-1 gap-1.5 mt-1">
            {ACTIVITY_OPTIONS.map((a) => (
              <button
                key={a.value}
                type="button"
                onClick={() => setActivity(a.value)}
                className={`text-left rounded-xl border-2 p-2.5 text-xs transition-all ${
                  activity === a.value ? "border-primary bg-primary/10 font-semibold" : "border-border/40 hover:border-primary/40"
                }`}
              >
                {t(a.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl frosted-glass border border-primary/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-4 w-4 text-primary" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{t("calc.bmi")}</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{bmi || "—"}</p>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${toneClass}`}>
            {t(bmiBand.labelKey)}
          </span>
        </div>

        <div className="rounded-2xl frosted-glass border border-warning/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-4 w-4 text-warning" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{t("calc.tdee")}</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{tdee || "—"}</p>
          <p className="text-[10px] text-muted-foreground mt-2">{t("calc.bmr")}: {bmr} kcal</p>
        </div>
      </div>

      {/* Macros */}
      <div className="rounded-2xl frosted-glass border border-border/40 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">{t("calc.macros")}</p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div><p className="text-lg font-bold text-info">{macros.carbs_g}g</p><p className="text-[10px] text-muted-foreground">{t("calc.carbs")}</p></div>
          <div><p className="text-lg font-bold text-success">{macros.protein_g}g</p><p className="text-[10px] text-muted-foreground">{t("calc.protein")}</p></div>
          <div><p className="text-lg font-bold text-warning">{macros.fat_g}g</p><p className="text-[10px] text-muted-foreground">{t("calc.fat")}</p></div>
        </div>
      </div>

      {/* Personalized food guide */}
      <div className="rounded-2xl frosted-glass border border-border/40 p-4 space-y-5">
        <div className="flex items-start gap-2">
          <Apple className="h-4 w-4 text-success mt-0.5" />
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Mwongozo wa vyakula kwa hali yako
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{goalLabel} · ~{tdee || 0} kcal/siku</p>
          </div>
        </div>

        {renderFoodGroup(
          "Vyakula vinavyoshauriwa",
          recommended,
          <CheckCircle2 className="h-4 w-4" />,
          "text-success"
        )}
        {renderFoodGroup(
          "Tumia kwa kiasi",
          moderate,
          <AlertTriangle className="h-4 w-4" />,
          "text-warning"
        )}
        {renderFoodGroup(
          "Vinavyofaa kuepukwa",
          avoid,
          <XCircle className="h-4 w-4" />,
          "text-destructive"
        )}

        <p className="text-[10px] text-muted-foreground">{t("calc.foodNote")}</p>
      </div>
    </div>
  );
}
