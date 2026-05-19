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
import {
  Flame, Scale, Apple, Sunrise, Sun, Moon, Cookie, GlassWater,
  AlertTriangle, ArrowRight, Check, Plus, X,
} from "lucide-react";

const ACTIVITY_OPTIONS: { value: ActivityLevel; labelKey: string }[] = [
  { value: "sedentary", labelKey: "calc.activity.sedentary" },
  { value: "light", labelKey: "calc.activity.light" },
  { value: "moderate", labelKey: "calc.activity.moderate" },
  { value: "active", labelKey: "calc.activity.active" },
  { value: "very_active", labelKey: "calc.activity.veryActive" },
];

type Goal = "bulk" | "maintain" | "cut";
type Condition = "none" | "diabetes" | "hypertension" | "kidney";
type DietMode = "balanced" | "vegetarian" | "vegan" | "highProtein" | "lowSugar" | "lowSodium";
type Category = "carbs" | "legumes" | "vegetables" | "fruits" | "animal" | "fats" | "snacks" | "drinks";
type MealKey = "breakfast" | "lunch" | "dinner" | "snacks" | "drinks";

interface Food {
  id: string;
  sw: string;
  en: string;
  category: Category;
  serving: { sw: string; en: string };
  kcal: number;
  meals: MealKey[];
  diets: DietMode[]; // diets this food is OK for (besides 'balanced' which everyone allows)
  highSugar?: boolean;
  highSodium?: boolean;
  highProtein?: boolean;
  animal?: boolean;
}

const FOODS: Food[] = [
  // Carbohydrates
  { id: "ugali_dona", sw: "Ugali wa dona", en: "Stiff porridge (whole maize)", category: "carbs", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 210, meals: ["lunch", "dinner"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "wali", sw: "Wali wa kawaida", en: "White rice", category: "carbs", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 200, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","lowSodium"] },
  { id: "wali_brown", sw: "Wali wa brown", en: "Brown rice", category: "carbs", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 215, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "makande", sw: "Makande", en: "Maize & beans", category: "carbs", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 260, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","lowSugar","lowSodium","highProtein"], highProtein: true },
  { id: "viazi", sw: "Viazi mviringo", en: "Potatoes", category: "carbs", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 160, meals: ["lunch","dinner","breakfast"], diets: ["vegetarian","vegan","lowSodium"] },
  { id: "viazi_vitamu", sw: "Viazi vitamu", en: "Sweet potatoes", category: "carbs", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 180, meals: ["breakfast","lunch","dinner"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "mhogo", sw: "Mhogo", en: "Cassava", category: "carbs", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 200, meals: ["lunch","dinner","snacks"], diets: ["vegetarian","vegan","lowSodium"] },
  { id: "ndizi_kupika", sw: "Ndizi za kupika", en: "Cooking bananas", category: "carbs", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 180, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","lowSodium"] },
  { id: "matoke", sw: "Matoke", en: "Matoke", category: "carbs", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 170, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","lowSodium"] },
  { id: "mahindi", sw: "Mahindi ya kuchemsha", en: "Boiled maize", category: "carbs", serving: { sw: "gunzi 1", en: "1 cob" }, kcal: 150, meals: ["snacks","breakfast"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "uji_lishe", sw: "Uji wa lishe", en: "Nutrient porridge", category: "carbs", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 180, meals: ["breakfast"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "uji_ulezi", sw: "Uji wa ulezi", en: "Finger-millet porridge", category: "carbs", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 150, meals: ["breakfast"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },

  // Legumes / plant proteins
  { id: "maharage", sw: "Maharage", en: "Beans", category: "legumes", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 230, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","highProtein","lowSugar","lowSodium"], highProtein: true },
  { id: "choroko", sw: "Choroko", en: "Green grams", category: "legumes", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 210, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","highProtein","lowSugar","lowSodium"], highProtein: true },
  { id: "kunde", sw: "Kunde", en: "Cowpeas", category: "legumes", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 200, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","highProtein","lowSugar","lowSodium"], highProtein: true },
  { id: "dengu", sw: "Dengu", en: "Lentils", category: "legumes", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 220, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","highProtein","lowSugar","lowSodium"], highProtein: true },
  { id: "njegere", sw: "Njegere", en: "Peas", category: "legumes", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 180, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "soya", sw: "Soya", en: "Soya", category: "legumes", serving: { sw: "kikombe 1/2", en: "1/2 cup" }, kcal: 190, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","highProtein","lowSugar","lowSodium"], highProtein: true },
  { id: "karanga", sw: "Karanga", en: "Peanuts", category: "legumes", serving: { sw: "kiganja 1 (30g)", en: "1 handful (30g)" }, kcal: 170, meals: ["snacks"], diets: ["vegetarian","vegan","highProtein","lowSugar","lowSodium"], highProtein: true },

  // Vegetables
  { id: "mchicha", sw: "Mchicha", en: "Amaranth greens", category: "vegetables", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 40, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "kisamvu", sw: "Kisamvu", en: "Cassava leaves", category: "vegetables", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 60, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "matembele", sw: "Matembele", en: "Sweet potato leaves", category: "vegetables", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 50, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "sukuma", sw: "Sukuma wiki", en: "Collard greens", category: "vegetables", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 45, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "spinachi", sw: "Spinachi", en: "Spinach", category: "vegetables", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 40, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "bamia", sw: "Bamia", en: "Okra", category: "vegetables", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 35, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "kabichi", sw: "Kabichi", en: "Cabbage", category: "vegetables", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 35, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "karoti", sw: "Karoti", en: "Carrots", category: "vegetables", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 50, meals: ["lunch","dinner","snacks"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },

  // Fruits
  { id: "ndizi_mbivu", sw: "Ndizi mbivu", en: "Ripe banana", category: "fruits", serving: { sw: "tunda 1", en: "1 fruit" }, kcal: 105, meals: ["breakfast","snacks"], diets: ["vegetarian","vegan","lowSodium"] },
  { id: "papai", sw: "Papai", en: "Papaya", category: "fruits", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 60, meals: ["breakfast","snacks"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "embe", sw: "Embe", en: "Mango", category: "fruits", serving: { sw: "tunda 1", en: "1 fruit" }, kcal: 100, meals: ["snacks","breakfast"], diets: ["vegetarian","vegan","lowSodium"] },
  { id: "chungwa", sw: "Chungwa", en: "Orange", category: "fruits", serving: { sw: "tunda 1", en: "1 fruit" }, kcal: 65, meals: ["breakfast","snacks"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "tikiti", sw: "Tikiti maji", en: "Watermelon", category: "fruits", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 45, meals: ["snacks"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "fenesi", sw: "Fenesi", en: "Jackfruit", category: "fruits", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 155, meals: ["snacks"], diets: ["vegetarian","vegan","lowSodium"] },
  { id: "parachichi", sw: "Parachichi", en: "Avocado", category: "fruits", serving: { sw: "1/2 tunda", en: "1/2 fruit" }, kcal: 160, meals: ["breakfast","lunch","snacks"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },

  // Animal (optional)
  { id: "samaki", sw: "Samaki (sangara/sato)", en: "Fish (Nile perch/tilapia)", category: "animal", serving: { sw: "kipande 150g", en: "150g piece" }, kcal: 220, meals: ["lunch","dinner"], diets: ["vegetarian","highProtein","lowSugar","lowSodium"], highProtein: true, animal: true },
  { id: "dagaa", sw: "Dagaa", en: "Sardines", category: "animal", serving: { sw: "kikombe 1/2", en: "1/2 cup" }, kcal: 180, meals: ["lunch","dinner"], diets: ["vegetarian","highProtein","lowSugar"], highProtein: true, animal: true },
  { id: "mayai", sw: "Mayai", en: "Eggs", category: "animal", serving: { sw: "yai 1", en: "1 egg" }, kcal: 78, meals: ["breakfast","lunch"], diets: ["vegetarian","highProtein","lowSugar","lowSodium"], highProtein: true, animal: true },
  { id: "maziwa", sw: "Maziwa fresh", en: "Fresh milk", category: "animal", serving: { sw: "glasi 1 (250ml)", en: "1 glass (250ml)" }, kcal: 150, meals: ["breakfast","snacks"], diets: ["vegetarian","lowSodium"], animal: true },
  { id: "mtindi", sw: "Mtindi wa asili", en: "Plain yoghurt", category: "animal", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 130, meals: ["breakfast","snacks"], diets: ["vegetarian","highProtein","lowSugar","lowSodium"], highProtein: true, animal: true },
  { id: "kuku", sw: "Kuku wa kuchemsha", en: "Boiled chicken", category: "animal", serving: { sw: "kipande 150g", en: "150g piece" }, kcal: 250, meals: ["lunch","dinner"], diets: ["highProtein","lowSugar","lowSodium"], highProtein: true, animal: true },

  // Healthy fats
  { id: "ufuta", sw: "Mbegu za ufuta", en: "Sesame seeds", category: "fats", serving: { sw: "kijiko 1", en: "1 tbsp" }, kcal: 50, meals: ["breakfast","snacks"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "alizeti", sw: "Mbegu za alizeti", en: "Sunflower seeds", category: "fats", serving: { sw: "kijiko 1", en: "1 tbsp" }, kcal: 55, meals: ["snacks"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "nazi", sw: "Nazi", en: "Coconut", category: "fats", serving: { sw: "kijiko 2", en: "2 tbsp" }, kcal: 70, meals: ["lunch","dinner"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },

  // Healthy snacks
  { id: "korosho", sw: "Korosho", en: "Cashews", category: "snacks", serving: { sw: "kiganja 1 (30g)", en: "1 handful (30g)" }, kcal: 160, meals: ["snacks"], diets: ["vegetarian","vegan","highProtein","lowSugar"] },
  { id: "njugu", sw: "Njugu", en: "Groundnuts", category: "snacks", serving: { sw: "kiganja 1", en: "1 handful" }, kcal: 165, meals: ["snacks"], diets: ["vegetarian","vegan","highProtein","lowSugar","lowSodium"] },

  // Drinks
  { id: "maji", sw: "Maji", en: "Water", category: "drinks", serving: { sw: "glasi 1", en: "1 glass" }, kcal: 0, meals: ["drinks"], diets: ["vegetarian","vegan","highProtein","lowSugar","lowSodium"] },
  { id: "fresh_juice", sw: "Juice ya matunda fresh", en: "Fresh fruit juice", category: "drinks", serving: { sw: "glasi 1", en: "1 glass" }, kcal: 110, meals: ["drinks","breakfast"], diets: ["vegetarian","vegan","lowSodium"] },
  { id: "smoothie", sw: "Smoothie ya matunda", en: "Fruit smoothie", category: "drinks", serving: { sw: "glasi 1", en: "1 glass" }, kcal: 180, meals: ["drinks","breakfast"], diets: ["vegetarian","vegan","lowSodium"] },
  { id: "tangawizi", sw: "Chai ya tangawizi", en: "Ginger tea", category: "drinks", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 5, meals: ["drinks","breakfast"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
  { id: "limao", sw: "Chai ya limao", en: "Lemon tea", category: "drinks", serving: { sw: "kikombe 1", en: "1 cup" }, kcal: 5, meals: ["drinks","breakfast"], diets: ["vegetarian","vegan","lowSugar","lowSodium"] },
];

interface ReduceItem { id: string; sw: string; en: string; reasonSw: string; reasonEn: string; altIds: string[]; flags: { highSugar?: boolean; highSodium?: boolean }; }

const REDUCE: ReduceItem[] = [
  { id: "soda", sw: "Soda", en: "Soda", reasonSw: "Sukari nyingi", reasonEn: "High sugar", altIds: ["maji","fresh_juice","tangawizi"], flags: { highSugar: true } },
  { id: "energy", sw: "Energy drinks", en: "Energy drinks", reasonSw: "Sukari na kafeini nyingi", reasonEn: "High sugar & caffeine", altIds: ["maji","tangawizi"], flags: { highSugar: true } },
  { id: "juice_pkt", sw: "Juice za pakiti", en: "Packaged juices", reasonSw: "Sukari iliyozidi", reasonEn: "Added sugar", altIds: ["fresh_juice","maji"], flags: { highSugar: true } },
  { id: "chips", sw: "Chips za kukaanga", en: "Deep-fried chips", reasonSw: "Mafuta na chumvi nyingi", reasonEn: "High fat & salt", altIds: ["viazi","viazi_vitamu"], flags: { highSodium: true } },
  { id: "indomie", sw: "Indomie / noodles za pakiti", en: "Instant noodles", reasonSw: "Chumvi na viungio vingi", reasonEn: "High sodium & additives", altIds: ["wali_brown","makande"], flags: { highSodium: true } },
  { id: "sausage", sw: "Soseji na nyama za viwandani", en: "Processed meats", reasonSw: "Chumvi na mafuta mabaya", reasonEn: "High sodium & saturated fat", altIds: ["maharage","dengu","samaki"], flags: { highSodium: true } },
  { id: "biscuits", sw: "Biscuits na keki", en: "Biscuits & cakes", reasonSw: "Sukari na unga uliosafishwa", reasonEn: "Refined sugar & flour", altIds: ["embe","papai","njugu"], flags: { highSugar: true } },
  { id: "salt", sw: "Chumvi ya ziada mezani", en: "Extra table salt", reasonSw: "Inaongeza shinikizo la damu", reasonEn: "Raises blood pressure", altIds: ["limao","tangawizi"], flags: { highSodium: true } },
  { id: "reused_oil", sw: "Mafuta ya kurudia kukaanga", en: "Reused cooking oil", reasonSw: "Mafuta hatari", reasonEn: "Harmful trans fats", altIds: ["nazi","ufuta"], flags: {} },
];

const CATEGORY_ORDER: Category[] = ["carbs","legumes","vegetables","fruits","animal","fats","snacks","drinks"];
const MEALS: { key: MealKey; icon: React.ReactNode; titleKey: string; cats: Category[] }[] = [
  { key: "breakfast", icon: <Sunrise className="h-4 w-4" />, titleKey: "nutrition.meal.breakfast", cats: ["carbs","fruits","animal","drinks"] },
  { key: "lunch",     icon: <Sun className="h-4 w-4" />,     titleKey: "nutrition.meal.lunch",     cats: ["carbs","legumes","vegetables","animal","fats"] },
  { key: "dinner",    icon: <Moon className="h-4 w-4" />,    titleKey: "nutrition.meal.dinner",    cats: ["carbs","legumes","vegetables","animal"] },
  { key: "snacks",    icon: <Cookie className="h-4 w-4" />,  titleKey: "nutrition.meal.snacks",    cats: ["fruits","snacks","legumes"] },
  { key: "drinks",    icon: <GlassWater className="h-4 w-4" />, titleKey: "nutrition.meal.drinks", cats: ["drinks"] },
];

interface Props {
  initialWeight?: number;
  initialHeight?: number;
  initialAge?: number;
}

export function CalorieCalculator({ initialWeight = 70, initialHeight = 170, initialAge = 30 }: Props) {
  const { t, lang } = useI18n();
  const [weight, setWeight] = useState(initialWeight);
  const [height, setHeight] = useState(initialHeight);
  const [age, setAge] = useState(initialAge);
  const [sex, setSex] = useState<Sex>("male");
  const [activity, setActivity] = useState<ActivityLevel>("moderate");
  const [condition, setCondition] = useState<Condition>("none");
  const [diet, setDiet] = useState<DietMode>("balanced");
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [activeMeal, setActiveMeal] = useState<MealKey>("breakfast");

  const bmi = useMemo(() => calcBmi(weight, height), [weight, height]);
  const bmiBand = useMemo(() => getBmiBand(bmi), [bmi]);
  const bmr = useMemo(() => calcBmr(weight, height, age, sex), [weight, height, age, sex]);
  const tdee = useMemo(() => calcTdee(bmr, activity), [bmr, activity]);
  const macros = useMemo(() => macroSplit(tdee), [tdee]);

  const goal: Goal = useMemo(() => {
    if (bmi === 0) return "maintain";
    if (bmi < 18.5) return "bulk";
    if (bmi < 25) return "maintain";
    return "cut";
  }, [bmi]);

  const targetKcal = useMemo(() => {
    if (!tdee) return 0;
    if (goal === "bulk") return tdee + 300;
    if (goal === "cut") return Math.max(1200, tdee - 500);
    return tdee;
  }, [tdee, goal]);

  // Filter foods by diet + condition
  const allowedFoods = useMemo(() => {
    return FOODS.filter((f) => {
      // Dietary mode
      if (diet === "vegan" && f.animal) return false;
      if (diet === "vegetarian" && (f.id === "samaki" || f.id === "dagaa" || f.id === "kuku")) return false;
      if (diet !== "balanced" && diet !== "vegan" && diet !== "vegetarian") {
        // For specialty diets, prefer foods tagged for that diet
        if (!f.diets.includes(diet)) return false;
      }
      // Condition based exclusions (still soft — only hide clear high-risk)
      if (condition === "diabetes" && f.highSugar) return false;
      if (condition === "hypertension" && f.highSodium) return false;
      if (condition === "kidney" && f.highProtein && goal !== "bulk") return false;
      return true;
    });
  }, [diet, condition, goal]);

  const mealFoods = useMemo(() => {
    const meal = MEALS.find((m) => m.key === activeMeal)!;
    return allowedFoods
      .filter((f) => f.meals.includes(activeMeal))
      .sort((a, b) => CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category) || a.kcal - b.kcal)
      .reduce<Record<Category, Food[]>>((acc, f) => {
        if (!meal.cats.includes(f.category)) return acc;
        (acc[f.category] ||= []).push(f);
        return acc;
      }, {} as Record<Category, Food[]>);
  }, [allowedFoods, activeMeal]);

  const reduceItems = useMemo(() => {
    return REDUCE.filter((r) => {
      if (condition === "diabetes" && r.flags.highSugar) return true;
      if (condition === "hypertension" && r.flags.highSodium) return true;
      if (diet === "lowSugar" && r.flags.highSugar) return true;
      if (diet === "lowSodium" && r.flags.highSodium) return true;
      // default: show all general reduce items
      return condition === "none" && (diet === "balanced" || diet === "highProtein" || diet === "vegan" || diet === "vegetarian");
    });
  }, [condition, diet]);

  const selectedTotal = useMemo(() => {
    return Object.entries(selected).reduce((sum, [id, n]) => {
      const f = FOODS.find((x) => x.id === id);
      return sum + (f ? f.kcal * n : 0);
    }, 0);
  }, [selected]);

  const toggleFood = (id: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = 1;
      return next;
    });
  };
  const incFood = (id: string, delta: number) => {
    setSelected((prev) => {
      const next = { ...prev };
      const v = (next[id] || 0) + delta;
      if (v <= 0) delete next[id];
      else next[id] = v;
      return next;
    });
  };

  const foodName = (f: Food) => (lang === "en" ? f.en : f.sw);
  const foodServing = (f: Food) => (lang === "en" ? f.serving.en : f.serving.sw);
  const reduceName = (r: ReduceItem) => (lang === "en" ? r.en : r.sw);
  const reduceReason = (r: ReduceItem) => (lang === "en" ? r.reasonEn : r.reasonSw);

  const toneClass =
    bmiBand.tone === "success"
      ? "text-success bg-success/15 border-success/30"
      : bmiBand.tone === "warning"
        ? "text-warning bg-warning/15 border-warning/30"
        : "text-destructive bg-destructive/15 border-destructive/30";

  const pct = targetKcal > 0 ? Math.min(100, Math.round((selectedTotal / targetKcal) * 100)) : 0;

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
            <Button type="button" variant={sex === "male" ? "default" : "outline"} onClick={() => setSex("male")} className="h-10 rounded-xl">{t("calc.male")}</Button>
            <Button type="button" variant={sex === "female" ? "default" : "outline"} onClick={() => setSex("female")} className="h-10 rounded-xl">{t("calc.female")}</Button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-muted-foreground">{t("calc.activity")}</label>
          <div className="grid grid-cols-1 gap-1.5 mt-1">
            {ACTIVITY_OPTIONS.map((a) => (
              <button key={a.value} type="button" onClick={() => setActivity(a.value)}
                className={`text-left rounded-xl border-2 p-2.5 text-xs transition-all ${activity === a.value ? "border-primary bg-primary/10 font-semibold" : "border-border/40 hover:border-primary/40"}`}>
                {t(a.labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">{t("nutrition.condition")}</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value as Condition)}
              className="mt-1 w-full h-10 rounded-xl border-2 border-border/40 bg-background px-2 text-xs font-medium">
              {(["none","diabetes","hypertension","kidney"] as Condition[]).map((c) => (
                <option key={c} value={c}>{t(`nutrition.condition.${c}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">{t("nutrition.diet")}</label>
            <select value={diet} onChange={(e) => setDiet(e.target.value as DietMode)}
              className="mt-1 w-full h-10 rounded-xl border-2 border-border/40 bg-background px-2 text-xs font-medium">
              {(["balanced","vegetarian","vegan","highProtein","lowSugar","lowSodium"] as DietMode[]).map((d) => (
                <option key={d} value={d}>{t(`nutrition.diet.${d}`)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl frosted-glass border border-primary/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Scale className="h-4 w-4 text-primary" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{t("calc.bmi")}</p>
          </div>
          <p className="text-3xl font-bold text-foreground">{bmi || "—"}</p>
          <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${toneClass}`}>{t(bmiBand.labelKey)}</span>
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

      {/* Recommendations */}
      <div className="rounded-2xl frosted-glass border border-border/40 p-4 space-y-4">
        <div className="flex items-start gap-2">
          <Apple className="h-4 w-4 text-success mt-0.5" />
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{t("nutrition.title")}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t("nutrition.goalLabel")}: {t(`nutrition.goal.${goal}`)} · {t("nutrition.targetKcal")} ~{targetKcal || 0} kcal
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">{t("nutrition.subtitle")}</p>
          </div>
        </div>

        {/* Selected summary */}
        <div className="rounded-xl bg-primary/10 border border-primary/30 p-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-foreground">
              {t("nutrition.selectedKcal")}: <span className="text-primary">{selectedTotal} kcal</span>
              <span className="text-muted-foreground"> / {targetKcal || 0} kcal</span>
            </p>
            {Object.keys(selected).length > 0 && (
              <button onClick={() => setSelected({})} className="text-[10px] text-destructive flex items-center gap-1">
                <X className="h-3 w-3" />{t("nutrition.clearSelection")}
              </button>
            )}
          </div>
          <div className="h-1.5 w-full bg-background/60 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Meal tabs */}
        <div className="flex gap-1.5 overflow-x-auto -mx-1 px-1">
          {MEALS.map((m) => (
            <button key={m.key} onClick={() => setActiveMeal(m.key)}
              className={`flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-full border text-[11px] font-semibold transition-all ${activeMeal === m.key ? "bg-primary text-primary-foreground border-primary" : "bg-background/60 text-muted-foreground border-border/40"}`}>
              {m.icon}{t(m.titleKey)}
            </button>
          ))}
        </div>

        {/* Foods grouped by category */}
        <div className="space-y-3">
          {Object.keys(mealFoods).length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-6">{t("nutrition.noFoods")}</p>
          )}
          {(Object.keys(mealFoods) as Category[]).sort((a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)).map((cat) => (
            <div key={cat}>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{t(`nutrition.category.${cat}`)}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mealFoods[cat].map((f) => {
                  const count = selected[f.id] || 0;
                  const active = count > 0;
                  return (
                    <div key={f.id} className={`rounded-xl border p-2.5 transition-all ${active ? "border-primary bg-primary/10" : "border-border/40 bg-background/60 hover:border-primary/40"}`}>
                      <button onClick={() => toggleFood(f.id)} className="w-full text-left">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground">{foodName(f)}</p>
                            <p className="text-[11px] text-muted-foreground">{foodServing(f)} · {f.kcal} kcal</p>
                          </div>
                          <div className={`shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${active ? "bg-primary text-primary-foreground" : "bg-background border border-border/40 text-muted-foreground"}`}>
                            {active ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                          </div>
                        </div>
                      </button>
                      {active && (
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                          <div className="flex items-center gap-1">
                            <button onClick={() => incFood(f.id, -1)} className="h-6 w-6 rounded-full bg-background border border-border/40 text-xs">−</button>
                            <span className="text-xs font-bold w-6 text-center">{count}×</span>
                            <button onClick={() => incFood(f.id, +1)} className="h-6 w-6 rounded-full bg-background border border-border/40 text-xs">+</button>
                          </div>
                          <span className="text-[11px] font-semibold text-primary">{f.kcal * count} kcal</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-muted-foreground">{t("nutrition.selectHint")} · {t("calc.foodNote")}</p>
      </div>

      {/* Foods to reduce + alternatives */}
      {reduceItems.length > 0 && (
        <div className="rounded-2xl frosted-glass border border-warning/30 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-wider text-warning font-semibold">{t("nutrition.reduceTitle")}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{t("nutrition.reduceHint")}</p>
            </div>
          </div>
          <div className="space-y-2">
            {reduceItems.map((r) => {
              const alts = r.altIds.map((id) => FOODS.find((f) => f.id === id)).filter(Boolean) as Food[];
              return (
                <div key={r.id} className="rounded-xl bg-background/60 border border-border/40 p-3">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-sm font-semibold text-foreground">{reduceName(r)}</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/30">{reduceReason(r)}</span>
                  </div>
                  {alts.length > 0 && (
                    <div className="flex items-start gap-2 text-[11px]">
                      <ArrowRight className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                      <div className="flex flex-wrap gap-1">
                        <span className="text-muted-foreground">{t("nutrition.alternative")}:</span>
                        {alts.map((a) => (
                          <button key={a.id} onClick={() => toggleFood(a.id)}
                            className="px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/30 hover:bg-success/20 transition-colors">
                            {foodName(a)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
