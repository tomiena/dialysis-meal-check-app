"use client";
import { useState } from "react";
import { Check, Utensils } from "lucide-react";
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
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-150 active:scale-95 ${
        selected
          ? "border-teal-500 bg-teal-50 shadow-md"
          : "border-slate-100 bg-white shadow-sm active:border-teal-200"
      }`}
    >
      {selected && (
        <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center shadow-sm">
          <Check size={12} strokeWidth={3} className="text-white" />
        </span>
      )}

      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center flex-shrink-0">
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
          <Utensils size={24} className="text-slate-300" />
        )}
      </div>

      <p className="text-xs font-semibold text-slate-700 text-center leading-tight line-clamp-2">
        {food.name}
      </p>

      <p className={`text-[10px] font-medium ${selected ? "text-teal-600" : "text-slate-400"}`}>
        塩 {food.sodium}mg
      </p>
    </button>
  );
}
