import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/useI18n";
import {
  calcBmi,
  calcBmr,
  calcTdee,
  macroSplit,
  TZ_FOODS,
  getBmiBand,
  type ActivityLevel,
  type Sex,
} from "@/lib/calculators";
import { Flame, Scale, Apple } from "lucide-react";

const ACTIVITY_OPTIONS: { value: ActivityLevel; labelKey: string }[] = [
  { value: "sedentary", labelKey: "calc.activity.sedentary" },
  { value: "light", labelKey: "calc.activity.light" },
  { value: "moderate", labelKey: "calc.activity.moderate" },
  { value: "active", labelKey: "calc.activity.active" },
  { value: "very_active", labelKey: "calc.activity.veryActive" },
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

  const TZ_FOOD_CATALOG: { titleSw: string; titleEn: string; items: string[] }[] = [
    {
      titleSw: "Vyakula vya asili",
      titleEn: "Traditional foods",
      items: [
        "Ugali","Wali","Pilau ya mboga","Ndizi za kupika","Matoke","Viazi vitamu","Viazi mviringo","Mihogo","Makande","Gimbi","Mahindi ya kuchemsha","Mahindi ya kuchoma","Ulezi","Mtama","Uji","Uji wa ulezi","Uji wa dona","Uji wa lishe","Maharage","Dengu","Choroko","Kunde","Njegere","Karanga","Korosho","Ufuta","Soybeans","Tofu","Mayai","Maziwa fresh","Mtindi wa asili","Siagi","Samaki wenye magamba","Dagaa","Sangara","Sato","Kamba","Mchicha","Matembele","Kisamvu","Sukuma wiki","Kabichi","Bamia","Karoti","Nyanya","Hoho","Matango","Maboga","Mnavu","Mwage","Ndizi","Embe","Papai","Nanasi","Tikiti maji","Chungwa","Passion","Zabibu","Fenesi","Parachichi","Tende","Mapera","Vitumbua","Chapati za nyumbani","Maandazi ya nyumbani","Kashata","Mkate wa kawaida",
      ],
    },
    {
      titleSw: "Nyama na samaki",
      titleEn: "Meat & fish",
      items: [
        "Nyama za kawaida","Samaki","Mayai","Fish sausage","Processed fish products","Canned fish","Frozen fish products","Fish balls","Fish burger patties","Fish fingers",
      ],
    },
    {
      titleSw: "Vyakula vya viwandani (vinavyokubalika)",
      titleEn: "Processed foods (acceptable)",
      items: [
        "Biscuits","Cookies","Chocolate","Crisps","Potato chips","Popcorn za packet","Chevda","Ice cream","Candy","Bubble gum","Donuts","Cakes za viwandani","Wafers","Instant noodles","Tambi za packet","Macaroni za box","Frozen pizza ya mboga","Frozen fries","Sandwiches za viwandani","Soda","Energy drinks","Juice za viwandani","Flavoured milk","Milkshake za packet","Ice tea za bottle","Coffee substitute drinks","White bread ya viwandani","Corn flakes","Cereals","Oats za packet","Pasta","Pancake mix","Canned beans","Canned fish","Tomato sauce","Tomato paste","Mayonnaise","Margarine","Peanut butter ya viwandani","Jam","Ketchup","Pickles","Azam products","Sayona drinks","Indomie","Oreo","Pringles","Minute Maid","Sprite","Fanta","Pepsi","Coca-Cola",
      ],
    },
  ];

  const toneClass =
    bmiBand.tone === "success"
      ? "text-success bg-success/15 border-success/30"
      : bmiBand.tone === "warning"
        ? "text-warning bg-warning/15 border-warning/30"
        : "text-destructive bg-destructive/15 border-destructive/30";

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Inputs */}
      <div className="rounded-2xl frosted-glass border border-border/40 p-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">{t("calc.weight")}</label>
            <Input
              type="number"
              value={weight}
              min={20}
              max={300}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">{t("calc.height")}</label>
            <Input
              type="number"
              value={height}
              min={100}
              max={230}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">{t("calc.age")}</label>
            <Input
              type="number"
              value={age}
              min={10}
              max={100}
              onChange={(e) => setAge(Number(e.target.value))}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">{t("calc.sex")}</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            <Button
              type="button"
              variant={sex === "male" ? "default" : "outline"}
              onClick={() => setSex("male")}
              className="h-10 rounded-xl"
            >
              {t("calc.male")}
            </Button>
            <Button
              type="button"
              variant={sex === "female" ? "default" : "outline"}
              onClick={() => setSex("female")}
              className="h-10 rounded-xl"
            >
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
                  activity === a.value
                    ? "border-primary bg-primary/10 font-semibold"
                    : "border-border/40 hover:border-primary/40"
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
          <p className="text-[10px] text-muted-foreground mt-2">
            {t("calc.bmr")}: {bmr} kcal
          </p>
        </div>
      </div>

      {/* Macros */}
      <div className="rounded-2xl frosted-glass border border-border/40 p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
          {t("calc.macros")}
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-lg font-bold text-info">{macros.carbs_g}g</p>
            <p className="text-[10px] text-muted-foreground">{t("calc.carbs")}</p>
          </div>
          <div>
            <p className="text-lg font-bold text-success">{macros.protein_g}g</p>
            <p className="text-[10px] text-muted-foreground">{t("calc.protein")}</p>
          </div>
          <div>
            <p className="text-lg font-bold text-warning">{macros.fat_g}g</p>
            <p className="text-[10px] text-muted-foreground">{t("calc.fat")}</p>
          </div>
        </div>
      </div>

      {/* Tanzania food catalog */}
      <div className="rounded-2xl frosted-glass border border-border/40 p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Apple className="h-4 w-4 text-success" />
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {t("calc.foodIdeas")}
          </p>
        </div>
        {TZ_FOOD_CATALOG.map((cat) => (
          <div key={cat.titleSw}>
            <p className="text-sm font-semibold text-foreground mb-2">{cat.titleSw}</p>
            <div className="flex flex-wrap gap-1.5">
              {cat.items.map((item, i) => (
                <span
                  key={`${cat.titleSw}-${i}`}
                  className="text-[11px] bg-primary/10 text-primary rounded-full px-2.5 py-1 font-medium border border-primary/20"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
        <p className="text-[10px] text-muted-foreground">{t("calc.foodNote")}</p>
      </div>
    </div>
  );
}
