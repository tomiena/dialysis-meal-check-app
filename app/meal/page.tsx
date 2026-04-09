"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FOODS, type FoodCategory } from "@/lib/foods";
import FoodCard from "@/app/components/FoodCard";

// ─── カテゴリ定義 ────────────────────────────────────────────
type CategoryId = FoodCategory | "all" | "meat_fish";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "all",          label: "すべて" },
  { id: "grain",        label: "主食・麺" },
  { id: "soup",         label: "汁物" },
  { id: "drink",        label: "飲み物" },
  { id: "prepared_food",label: "惣菜" },
  { id: "meat_fish",    label: "肉・魚" },
];

export default function MealPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [selected, setSelected]             = useState<Set<string>>(new Set());

  const displayFoods = activeCategory === "all"
    ? FOODS
    : activeCategory === "meat_fish"
      ? FOODS.filter((f) => f.category === "meat" || f.category === "fish")
      : FOODS.filter((f) => f.category === activeCategory);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (selected.size === 0) return;
    const params = Array.from(selected).map((id) => `${id}:100`).join(",");
    router.push(`/result?foods=${encodeURIComponent(params)}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-32">

      {/* ── ヘッダー ──────────────────────────────────────────── */}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-md relative flex items-center justify-center">
          <Link
            href="/"
            className="absolute left-0 flex items-center gap-1 text-gray-500 hover:text-gray-700 py-1 px-1"
          >
            <span className="text-xl leading-none">←</span>
            <span className="text-sm font-medium">戻る</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">食事を記録</h1>
        </div>
      </header>

      {/* ── カテゴリタブ ──────────────────────────────────────── */}
      <div className="sticky top-[57px] z-10 bg-white border-b">
        <div className="mx-auto max-w-md overflow-x-auto flex gap-2 px-4 py-2 scrollbar-hide">
          {CATEGORIES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveCategory(id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === id
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 食品グリッド ──────────────────────────────────────── */}
      <div className="mx-auto max-w-md px-4 py-4">
        <div className="grid grid-cols-3 gap-3">
          {displayFoods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              selected={selected.has(food.id)}
              onToggle={() => toggle(food.id)}
            />
          ))}
        </div>
      </div>

      {/* ── 下部固定ボタン ────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 shadow-lg">
        <div className="mx-auto max-w-md">
          {selected.size > 0 ? (
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full rounded-2xl bg-teal-600 py-4 text-white text-lg font-bold shadow-md hover:bg-teal-700 active:scale-[0.98] transition-all"
            >
              {selected.size}品を選択 → 保存する
            </button>
          ) : (
            <p className="text-center text-gray-400 text-sm py-3">
              食品をタップして選んでください
            </p>
          )}
        </div>
      </div>

    </main>
  );
}
