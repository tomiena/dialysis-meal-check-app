type Food = {
  id: string;
};

export const FOODS: Food[] = [];

type Food = {
  id: string;
};

export function getFoodRisk(food: Food) {
  return { sodium: false, potassium: false };
}