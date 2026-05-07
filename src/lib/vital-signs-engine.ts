// Vital signs interpretation engine.
// Pure, rule-based, deterministic. Returns i18n keys (no hard-coded English/Swahili
// strings) so callers translate via t().

export type VitalLevel = "normal" | "elevated" | "high" | "low";

export interface VitalReading {
  systolic: number;
  diastolic: number;
  heart_rate: number;
  temperature: number;
  weight: number;
  blood_sugar?: number | null;
  recorded_date: string; // ISO date
}

export interface InterpretedMetric {
  metric: "bp" | "heartRate" | "temperature" | "bmi" | "bloodSugar";
  level: VitalLevel;
  /** i18n key for short status label (e.g. "vital.level.high") */
  statusKey: string;
  /** i18n key for the human-readable advice sentence */
  adviceKey: string;
  /** Numeric value summary used for display */
  value: string;
}

// ============ BP ============
export function interpretBP(systolic: number, diastolic: number): InterpretedMetric {
  let level: VitalLevel = "normal";
  let adviceKey = "vital.advice.bp.normal";
  if (systolic >= 140 || diastolic >= 90) {
    level = "high";
    adviceKey = "vital.advice.bp.high";
  } else if (systolic >= 130 || diastolic >= 85) {
    level = "elevated";
    adviceKey = "vital.advice.bp.elevated";
  } else if (systolic < 90 || diastolic < 60) {
    level = "low";
    adviceKey = "vital.advice.bp.low";
  }
  return {
    metric: "bp",
    level,
    statusKey: `vital.level.${level}`,
    adviceKey,
    value: `${systolic}/${diastolic} mmHg`,
  };
}

// ============ Heart Rate ============
export function interpretHeartRate(hr: number, age = 30): InterpretedMetric {
  let level: VitalLevel = "normal";
  let adviceKey = "vital.advice.hr.normal";
  const lower = age >= 65 ? 50 : 60;
  const upper = age >= 65 ? 95 : 100;
  if (hr > upper) {
    level = "high";
    adviceKey = "vital.advice.hr.high";
  } else if (hr < lower) {
    level = "low";
    adviceKey = "vital.advice.hr.low";
  }
  return {
    metric: "heartRate",
    level,
    statusKey: `vital.level.${level}`,
    adviceKey,
    value: `${hr} bpm`,
  };
}

// ============ Temperature ============
export function interpretTemperature(t: number): InterpretedMetric {
  let level: VitalLevel = "normal";
  let adviceKey = "vital.advice.temp.normal";
  if (t >= 38) {
    level = "high";
    adviceKey = "vital.advice.temp.high";
  } else if (t >= 37.5) {
    level = "elevated";
    adviceKey = "vital.advice.temp.elevated";
  } else if (t < 35.5) {
    level = "low";
    adviceKey = "vital.advice.temp.low";
  }
  return {
    metric: "temperature",
    level,
    statusKey: `vital.level.${level}`,
    adviceKey,
    value: `${t.toFixed(1)} °C`,
  };
}

// ============ BMI ============
export function interpretBMI(weightKg: number, heightCm: number): InterpretedMetric {
  const m = heightCm / 100;
  const bmi = m > 0 ? Number((weightKg / (m * m)).toFixed(1)) : 0;
  let level: VitalLevel = "normal";
  let adviceKey = "vital.advice.bmi.normal";
  if (bmi >= 30) {
    level = "high";
    adviceKey = "vital.advice.bmi.obese";
  } else if (bmi >= 25) {
    level = "elevated";
    adviceKey = "vital.advice.bmi.overweight";
  } else if (bmi < 18.5 && bmi > 0) {
    level = "low";
    adviceKey = "vital.advice.bmi.underweight";
  }
  return {
    metric: "bmi",
    level,
    statusKey: `vital.level.${level}`,
    adviceKey,
    value: `BMI ${bmi}`,
  };
}

// ============ Blood Sugar (fasting mg/dL) ============
export function interpretBloodSugar(mg: number): InterpretedMetric {
  let level: VitalLevel = "normal";
  let adviceKey = "vital.advice.sugar.normal";
  if (mg >= 126) {
    level = "high";
    adviceKey = "vital.advice.sugar.high";
  } else if (mg >= 100) {
    level = "elevated";
    adviceKey = "vital.advice.sugar.elevated";
  } else if (mg < 70) {
    level = "low";
    adviceKey = "vital.advice.sugar.low";
  }
  return {
    metric: "bloodSugar",
    level,
    statusKey: `vital.level.${level}`,
    adviceKey,
    value: `${mg} mg/dL`,
  };
}

// ============ Aggregation ============
export function interpretAll(
  reading: VitalReading,
  opts: { age?: number; heightCm?: number },
): InterpretedMetric[] {
  const age = opts.age ?? 30;
  const height = opts.heightCm ?? 170;
  const out: InterpretedMetric[] = [
    interpretBP(reading.systolic, reading.diastolic),
    interpretHeartRate(reading.heart_rate, age),
    interpretTemperature(reading.temperature),
    interpretBMI(reading.weight, height),
  ];
  if (reading.blood_sugar != null && reading.blood_sugar > 0) {
    out.push(interpretBloodSugar(Number(reading.blood_sugar)));
  }
  return out;
}

// ============ Trend aggregation (weekly / monthly) ============

export type Granularity = "weekly" | "monthly";

export interface TrendPoint {
  /** Bucket label (e.g. "Wk 12" or "Mar") */
  label: string;
  bucketKey: string;
  systolic: number;
  diastolic: number;
  heart_rate: number;
  temperature: number;
  weight: number;
  blood_sugar: number | null;
  count: number;
}

function isoWeek(d: Date): { year: number; week: number } {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return { year: date.getUTCFullYear(), week };
}

export function bucketReadings(
  readings: VitalReading[],
  granularity: Granularity,
  lang: "en" | "sw" = "en",
): TrendPoint[] {
  const buckets = new Map<string, TrendPoint>();
  const monthLabels = {
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    sw: ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ago", "Sep", "Okt", "Nov", "Des"],
  };
  const wkLabel = lang === "sw" ? "Wk" : "Wk";

  for (const r of readings) {
    const d = new Date(r.recorded_date);
    if (isNaN(d.getTime())) continue;
    let key: string;
    let label: string;
    if (granularity === "weekly") {
      const { year, week } = isoWeek(d);
      key = `${year}-W${String(week).padStart(2, "0")}`;
      label = `${wkLabel} ${week}`;
    } else {
      const y = d.getFullYear();
      const m = d.getMonth();
      key = `${y}-${String(m + 1).padStart(2, "0")}`;
      label = `${monthLabels[lang][m]} ${String(y).slice(2)}`;
    }
    const existing = buckets.get(key);
    if (!existing) {
      buckets.set(key, {
        label,
        bucketKey: key,
        systolic: r.systolic,
        diastolic: r.diastolic,
        heart_rate: r.heart_rate,
        temperature: r.temperature,
        weight: Number(r.weight),
        blood_sugar: r.blood_sugar != null ? Number(r.blood_sugar) : null,
        count: 1,
      });
    } else {
      existing.systolic += r.systolic;
      existing.diastolic += r.diastolic;
      existing.heart_rate += r.heart_rate;
      existing.temperature += r.temperature;
      existing.weight += Number(r.weight);
      if (r.blood_sugar != null) {
        existing.blood_sugar =
          (existing.blood_sugar ?? 0) + Number(r.blood_sugar);
      }
      existing.count += 1;
    }
  }
  // Average
  const out = Array.from(buckets.values()).map((b) => ({
    ...b,
    systolic: Math.round(b.systolic / b.count),
    diastolic: Math.round(b.diastolic / b.count),
    heart_rate: Math.round(b.heart_rate / b.count),
    temperature: Number((b.temperature / b.count).toFixed(1)),
    weight: Number((b.weight / b.count).toFixed(1)),
    blood_sugar:
      b.blood_sugar != null ? Number((b.blood_sugar / b.count).toFixed(1)) : null,
  }));
  // Sort by key ascending (chronological)
  return out.sort((a, b) => (a.bucketKey < b.bucketKey ? -1 : 1));
}

// ============ Direction detection ============
export type Direction = "up" | "down" | "flat";

export function detectDirection(values: number[], threshold = 0.05): Direction {
  if (values.length < 2) return "flat";
  const first = values[0];
  const last = values[values.length - 1];
  if (first === 0) return "flat";
  const change = (last - first) / first;
  if (change > threshold) return "up";
  if (change < -threshold) return "down";
  return "flat";
}

// Color tone helper for UI badges
export function levelTone(level: VitalLevel): "success" | "warning" | "destructive" {
  if (level === "normal") return "success";
  if (level === "elevated" || level === "low") return "warning";
  return "destructive";
}
