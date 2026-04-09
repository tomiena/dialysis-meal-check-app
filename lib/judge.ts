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
  water: NutrientResult;
  sodium: NutrientResult;
  potassium: NutrientResult;
  phosphorus: NutrientResult;
};

function getStatus(value: number, okMax: number, cautionMax: number): string {
  if (value <= okMax) return "ok";
  if (value <= cautionMax) return "caution";
  return "ng";
}

/** Single source of truth for live recording totals */
export function calculateTotals(items: MealItem[], drinkWater = 0) {
  let foodWater = 0, sodium = 0, potassium = 0, phosphorus = 0;
  for (const { food, amount } of items) {
    foodWater  += food.water     * amount / 100;
    sodium     += food.sodium    * amount / 100;
    potassium  += food.potassium * amount / 100;
    phosphorus += food.phosphorus * amount / 100;
  }
  return {
    water:      Math.round(foodWater) + drinkWater,
    foodWater:  Math.round(foodWater),
    sodium:     Math.round(sodium),
    potassium:  Math.round(potassium),
    phosphorus: Math.round(phosphorus),
  };
}

export function judgeMeal(items: MealItem[]): JudgeResult {
  let water = 0, sodium = 0, potassium = 0, phosphorus = 0;
  for (const { food, amount } of items) {
    water      += food.water      * amount / 100;
    sodium     += food.sodium     * amount / 100;
    potassium  += food.potassium  * amount / 100;
    phosphorus += food.phosphorus * amount / 100;
  }
  water      = Math.round(water);
  sodium     = Math.round(sodium);
  potassium  = Math.round(potassium);
  phosphorus = Math.round(phosphorus);

  const waterStatus      = getStatus(water,      1500, 2000);
  const sodiumStatus     = getStatus(sodium,       700, 1050);
  const potassiumStatus  = getStatus(potassium,    550,  825);
  const phosphorusStatus = getStatus(phosphorus,   220,  330);

  const statuses = [waterStatus, sodiumStatus, potassiumStatus, phosphorusStatus];
  const overall = statuses.includes("ng") ? "ng"
    : statuses.includes("caution") ? "caution"
    : "ok";

  return {
    overall,
    water:      { value: water,      status: waterStatus },
    sodium:     { value: sodium,     status: sodiumStatus },
    potassium:  { value: potassium,  status: potassiumStatus },
    phosphorus: { value: phosphorus, status: phosphorusStatus },
  };
}