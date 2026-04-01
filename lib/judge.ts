import type { Food } from "./foods";

export type MealItem = {
  food: Food;
  amount: number;
};

export type NutrientResult = {
  value: number;
  status: string;
};

export type JudgeResult = {
  overall: "ok" | "caution" | "ng";
  sodium: NutrientResult;
  potassium: NutrientResult;
  phosphorus: NutrientResult;
};

export function judgeMeal(items: MealItem[]): JudgeResult {
  return {
    overall: "ok",
    sodium: { value: 0, status: "ok" },
    potassium: { value: 0, status: "ok" },
    phosphorus: { value: 0, status: "ok" },
  };
}