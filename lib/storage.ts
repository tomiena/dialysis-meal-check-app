export function toDateStr(date: Date) {
  return date.toISOString().slice(0, 10);
}
export function parseDateLocal(dateStr: string) {
  return new Date(dateStr);
}

export function getMealHistory() { return []; }
export function saveMealHistory(meal: any) {}
export function deleteMealById(id: string) {}

export function getMealsBeforeDateFromHistory(date: string, history: any[]) {
  return history.filter((meal) => meal.date < date);
}
export function getRecentAverageFromHistory(days: number, history: any[]) {
  return {};
}
export function getDailyStatsFromHistory(date: string, history: any[]) {
  const meals = history.filter((meal: any) => meal.date === date);
  let totalWater = 0;
  let totalSalt = 0;
  for (const meal of meals) {
    totalWater += meal.water ?? 0;
    totalSalt += meal.salt ?? 0;
  }
  return { totalWater, totalSalt };
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
  items: { name: string }[];
  total: {
    water: number;
    salt: number;
    potassium: number;
    phosphorus: number;
  };
  water?: number;
  salt?: number;
};

export type LabRecord = {
  id?: string;
  date: string;
  potassium: number;
  phosphorus: number;
};