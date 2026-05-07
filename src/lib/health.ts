export type BpStatus = "Normal" | "Elevated" | "Hypertension";
export type HeartRateStatus = "Normal" | "Abnormal";
export type BmiCategory = "Underweight" | "Normal" | "Overweight";

export interface HealthEntry {
  date: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  temperature: number;
  weight: number;
  savedAt: string;
}

export function classifyBloodPressure(systolic: number, diastolic: number): BpStatus {
  if (systolic < 120 && diastolic < 80) {
    return "Normal";
  }

  if (systolic < 130 && diastolic < 80) {
    return "Elevated";
  }

  return "Hypertension";
}

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < 18.5) {
    return "Underweight";
  }

  if (bmi < 25) {
    return "Normal";
  }

  return "Overweight";
}

export function classifyHeartRate(age: number, heartRate: number): HeartRateStatus {
  const normalRange = age >= 65 ? [50, 95] : age >= 18 ? [60, 100] : [70, 110];
  return heartRate >= normalRange[0] && heartRate <= normalRange[1] ? "Normal" : "Abnormal";
}

export function getStatusTone(status: string) {
  switch (status) {
    case "Normal":
      return "success";
    case "Elevated":
      return "warning";
    case "Hypertension":
    case "Abnormal":
      return "destructive";
    case "Underweight":
      return "warning";
    case "Overweight":
      return "warning";
    default:
      return "default";
  }
}

export function healthStorageKey(patientId: string) {
  return `health-data-${patientId}`;
}

export function saveHealthEntry(patientId: string, entry: HealthEntry) {
  if (typeof window === "undefined") return;
  const key = healthStorageKey(patientId);
  const existing = loadHealthEntries(patientId);
  const updated = [...existing, entry];
  window.localStorage.setItem(key, JSON.stringify(updated));
}

export function loadHealthEntries(patientId: string): HealthEntry[] {
  if (typeof window === "undefined") return [];
  const key = healthStorageKey(patientId);
  const raw = window.localStorage.getItem(key);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as HealthEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getLatestHealthEntry(entries: HealthEntry[] | null) {
  if (!entries?.length) {
    return null;
  }

  return entries.reduce((latest, current) => {
    return new Date(current.savedAt) > new Date(latest.savedAt) ? current : latest;
  }, entries[0]);
}

export function daysSince(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function buildSampleTrendData() {
  return [
    { label: "Mon", systolic: 118, diastolic: 76, weight: 72, heartRate: 74 },
    { label: "Tue", systolic: 122, diastolic: 79, weight: 72.2, heartRate: 76 },
    { label: "Wed", systolic: 128, diastolic: 81, weight: 72.5, heartRate: 78 },
    { label: "Thu", systolic: 130, diastolic: 84, weight: 72.7, heartRate: 79 },
    { label: "Fri", systolic: 125, diastolic: 80, weight: 72.3, heartRate: 77 },
    { label: "Sat", systolic: 119, diastolic: 75, weight: 72.0, heartRate: 73 },
    { label: "Sun", systolic: 121, diastolic: 77, weight: 72.1, heartRate: 75 },
  ];
}
