// Health calculators: BMI, BMR, TDEE + Tanzania/Africa-friendly food references.

export type Sex = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

/** BMI: kg / m² */
export function calcBmi(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm) return 0;
  const m = heightCm / 100;
  return Number((weightKg / (m * m)).toFixed(1));
}

/** Mifflin-St Jeor BMR (kcal/day) */
export function calcBmr(weightKg: number, heightCm: number, age: number, sex: Sex): number {
  if (!weightKg || !heightCm || !age) return 0;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(sex === "male" ? base + 5 : base - 161);
}

/** Total Daily Energy Expenditure */
export function calcTdee(bmr: number, activity: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIER[activity]);
}

/** Macro split given target calories — balanced 50/20/30 (carbs/protein/fat) */
export function macroSplit(calories: number) {
  const carbsKcal = calories * 0.5;
  const proteinKcal = calories * 0.2;
  const fatKcal = calories * 0.3;
  return {
    carbs_g: Math.round(carbsKcal / 4),
    protein_g: Math.round(proteinKcal / 4),
    fat_g: Math.round(fatKcal / 9),
  };
}

/** Tanzania/East Africa-friendly food references with kcal per common serving. */
export interface FoodItem {
  id: string;
  nameKey: string;
  servingKey: string;
  kcal: number;
  category: "carb" | "protein" | "veg" | "fruit" | "drink" | "snack";
}

export const TZ_FOODS: FoodItem[] = [
  // Carbs
  { id: "ugali", nameKey: "food.ugali", servingKey: "food.serving.cup", kcal: 220, category: "carb" },
  { id: "wali", nameKey: "food.wali", servingKey: "food.serving.cup", kcal: 200, category: "carb" },
  { id: "chapati", nameKey: "food.chapati", servingKey: "food.serving.piece", kcal: 280, category: "carb" },
  { id: "ndizi", nameKey: "food.ndizi_kupika", servingKey: "food.serving.cup", kcal: 180, category: "carb" },
  { id: "viazi", nameKey: "food.viazi", servingKey: "food.serving.cup", kcal: 150, category: "carb" },
  // Proteins
  { id: "maharage", nameKey: "food.maharage", servingKey: "food.serving.cup", kcal: 230, category: "protein" },
  { id: "samaki", nameKey: "food.samaki", servingKey: "food.serving.piece", kcal: 220, category: "protein" },
  { id: "kuku", nameKey: "food.kuku", servingKey: "food.serving.piece", kcal: 280, category: "protein" },
  { id: "nyama", nameKey: "food.nyama", servingKey: "food.serving.piece", kcal: 320, category: "protein" },
  { id: "yai", nameKey: "food.yai", servingKey: "food.serving.piece", kcal: 78, category: "protein" },
  // Veg
  { id: "mchicha", nameKey: "food.mchicha", servingKey: "food.serving.cup", kcal: 40, category: "veg" },
  { id: "sukuma", nameKey: "food.sukuma", servingKey: "food.serving.cup", kcal: 45, category: "veg" },
  // Fruits
  { id: "embe", nameKey: "food.embe", servingKey: "food.serving.piece", kcal: 100, category: "fruit" },
  { id: "ndizi_mbivu", nameKey: "food.ndizi_mbivu", servingKey: "food.serving.piece", kcal: 105, category: "fruit" },
  { id: "papai", nameKey: "food.papai", servingKey: "food.serving.cup", kcal: 60, category: "fruit" },
  // Drinks
  { id: "chai_sukari", nameKey: "food.chai_sukari", servingKey: "food.serving.cup", kcal: 60, category: "drink" },
  { id: "soda", nameKey: "food.soda", servingKey: "food.serving.bottle", kcal: 150, category: "drink" },
  // Snacks
  { id: "mandazi", nameKey: "food.mandazi", servingKey: "food.serving.piece", kcal: 180, category: "snack" },
  { id: "kashata", nameKey: "food.kashata", servingKey: "food.serving.piece", kcal: 120, category: "snack" },
];

export function getBmiBand(bmi: number): { labelKey: string; tone: "success" | "warning" | "danger" } {
  if (bmi < 18.5) return { labelKey: "bmi.underweight", tone: "warning" };
  if (bmi < 25) return { labelKey: "bmi.normal", tone: "success" };
  if (bmi < 30) return { labelKey: "bmi.overweight", tone: "warning" };
  return { labelKey: "bmi.obese", tone: "danger" };
}
