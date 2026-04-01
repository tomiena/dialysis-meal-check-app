export function toDateStr(date: Date) {
  return date.toISOString().slice(0, 10);
}
export function parseDateLocal(dateStr: string) {
  return new Date(dateStr);
}

const MEAL_KEY = "mealHistory";

export function getMealHistory(): Meal[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(MEAL_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveMealHistory(meal: Omit<Meal, "id">) {
  const history = getMealHistory();
  history.push({ ...meal, id: crypto.randomUUID() });
  localStorage.setItem(MEAL_KEY, JSON.stringify(history));
}

export function deleteMealById(id: string) {
  const history = getMealHistory().filter((m) => m.id !== id);
  localStorage.setItem(MEAL_KEY, JSON.stringify(history));
}

export function getMealsBeforeDateFromHistory(date: string, history: Meal[]) {
  return history.filter((meal) => meal.date < date);
}

export function getRecentAverageFromHistory(days: number, history: Meal[]) {
  const dates = new Set<string>();
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.add(toDateStr(d));
  }
  const byDate: Record<string, Meal[]> = {};
  for (const meal of history) {
    if (dates.has(meal.date)) {
      if (!byDate[meal.date]) byDate[meal.date] = [];
      byDate[meal.date].push(meal);
    }
  }
  const activeDates = Object.keys(byDate);
  if (activeDates.length === 0) {
    return { totalWater: 0, totalSodium: 0, totalPotassium: 0, totalPhosphorus: 0 };
  }
  let water = 0, sodium = 0, potassium = 0, phosphorus = 0;
  for (const d of activeDates) {
    for (const m of byDate[d]) {
      water     += m.total.water     ?? 0;
      sodium    += m.total.sodium    ?? 0;
      potassium += m.total.potassium ?? 0;
      phosphorus+= m.total.phosphorus?? 0;
    }
  }
  const n = activeDates.length;
  return {
    totalWater:      Math.round(water / n),
    totalSodium:     Math.round(sodium / n),
    totalPotassium:  Math.round(potassium / n),
    totalPhosphorus: Math.round(phosphorus / n),
  };
}

export function getDailyStatsFromHistory(date: string, history: Meal[]) {
  const meals = history.filter((meal) => meal.date === date);
  let totalWater = 0, totalSodium = 0, totalPotassium = 0, totalPhosphorus = 0;
  for (const meal of meals) {
    totalWater      += meal.total.water      ?? 0;
    totalSodium     += meal.total.sodium     ?? 0;
    totalPotassium  += meal.total.potassium  ?? 0;
    totalPhosphorus += meal.total.phosphorus ?? 0;
  }
  return { totalWater, totalSodium, totalPotassium, totalPhosphorus, mealCount: meals.length };
}

export type DailyVitals = {
  date: string;
  weight?: number;       // kg
  bpSystolic?: number;   // mmHg
  bpDiastolic?: number;  // mmHg
  pulse?: number;        // bpm
};

export function getDailyVitals(date: string): DailyVitals {
  if (typeof window === "undefined") return { date };
  try {
    const all = JSON.parse(localStorage.getItem("dailyVitals") ?? "{}");
    return all[date] ?? { date };
  } catch { return { date }; }
}

export function saveDailyVitals(vitals: DailyVitals) {
  if (typeof window === "undefined") return;
  try {
    const all = JSON.parse(localStorage.getItem("dailyVitals") ?? "{}");
    all[vitals.date] = vitals;
    localStorage.setItem("dailyVitals", JSON.stringify(all));
  } catch {}
}

export function getLabRecords(): LabRecord[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("labRecords") ?? "[]");
  } catch {
    return [];
  }
}
export function saveLabRecord(record: LabRecord) {
  const data = getLabRecords();
  data.push({ ...record, id: record.id ?? crypto.randomUUID() });
  localStorage.setItem("labRecords", JSON.stringify(data));
}

export type Meal = {
  id: string;
  date: string;
  items: { name: string; foodId?: string; amount?: number }[];
  total: {
    water: number;
    sodium: number;     // mg (NOT NaCl grams — single source of truth)
    potassium: number;
    phosphorus: number;
  };
  overall?: "ok" | "caution" | "ng";
  advice?: string;
};

export type LabRecord = {
  id?: string;
  date: string;
  potassium: number;
  phosphorus: number;
};
