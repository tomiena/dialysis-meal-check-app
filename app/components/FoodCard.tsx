"use client";
import { useState } from "react";
import type { Food } from "@/lib/foods";

type Props = {
  food: Food;
  selected: boolean;
  onToggle: () => void;
};

export default function FoodCard({ food, selected, onToggle }: Props) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all active:scale-95 ${
        selected
          ? "border-teal-500 bg-teal-50 shadow-md"
          : "border-gray-100 bg-white shadow-sm hover:border-teal-200"
      }`}
    >
      {selected && (
        <span className="absolute top-1 right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          ✓
        </span>
      )}

      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
        {food.image && !imgError ? (
          <img
            src={food.image}
            alt={food.name}
            width={56}
            height={56}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-2xl">🍽</span>
        )}
      </div>

      <p className="text-xs font-semibold text-gray-700 text-center leading-tight">
        {food.name}
      </p>

      <p className="text-[10px] text-gray-400">
        塩 {food.sodium}mg
      </p>
    </button>
  );
}
