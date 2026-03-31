export function toDateStr() { return ""; }
export function parseDateLocal(dateStr: string) {
  return new Date(dateStr);
}

export function getMealHistory() { return []; }
export function saveMealHistory() {}
export function deleteMealById() {}

export function getDailyStatsFromHistory() { return {}; }
export function getRecentAverageFromHistory() { return {}; }
export function getMealsBeforeDateFromHistory() { return []; }

export function getLabRecords() { return []; }
export function saveLabRecord() {}

export type Meal = any;
export type LabRecord = any;