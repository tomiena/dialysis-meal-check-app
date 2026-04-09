"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FOODS, type FoodCategory } from "@/lib/foods";
import { getMealHistory, toDateStr } from "@/lib/storage";
import { getIsPremium } from "@/lib/premium";
import FoodCard from "@/app/components/FoodCard";
import FreeLimitNotice from "@/app/components/FreeLimitNotice";

const FREE_MEAL_LIMIT = 3;

// ─── カテゴリ ──────────────────────────────────────────────
type CategoryId = FoodCategory | "all" | "meat_fish";

const CATEGORIES: { id: CategoryId; label: string }[] = [
  { id: "all",           label: "すべて" },
  { id: "grain",         label: "主食・麺" },
  { id: "soup",          label: "汁物" },
  { id: "drink",         label: "飲み物" },
  { id: "prepared_food", label: "惣菜" },
  { id: "meat_fish",     label: "肉・魚" },
];

// ─── 月カレンダー ────────────────────────────────────────
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

const DOT: Record<string, string> = {
  ok:      "bg-teal-400",
  caution: "bg-yellow-400",
  ng:      "bg-red-400",
};

function formatDateJP(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ja-JP", {
    month: "long", day: "numeric", weekday: "short",
  });
}

export default function MealPage() {
  const router = useRouter();
  const today  = toDateStr(new Date());

  // ── 日付選択 ───────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(today);
  const [calYear,  setCalYear]  = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth() + 1);

  // ── 食材選択 ───────────────────────────────────────────
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFreeLimit, setShowFreeLimit] = useState(false);

  // 過去記録（カレンダードット用）
  const history = getMealHistory();

  function dayStatus(dateStr: string) {
    const meals = history.filter((m) => m.date === dateStr);
    if (meals.length === 0) return "none";
    const hasNg      = meals.some((m) => m.overall === "ng");
    const hasCaution = meals.some((m) => m.overall === "caution");
    return hasNg ? "ng" : hasCaution ? "caution" : "ok";
  }

  // ── カレンダー計算 ─────────────────────────────────────
  const daysInMonth  = new Date(calYear, calMonth, 0).getDate();
  const firstWeekday = new Date(calYear, calMonth - 1, 1).getDay();

  const prevMonth = () => {
    if (calMonth === 1) { setCalYear((y) => y - 1); setCalMonth(12); }
    else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 12) { setCalYear((y) => y + 1); setCalMonth(1); }
    else setCalMonth((m) => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  // ── 食材操作 ───────────────────────────────────────────
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

  const handleSave = () => {
    if (selected.size === 0) return;
    const isPremium  = getIsPremium();
    const dayCount   = history.filter((m) => m.date === selectedDate).length;
    if (!isPremium && dayCount >= FREE_MEAL_LIMIT) {
      setShowFreeLimit(true);
      return;
    }
    const params = Array.from(selected).map((id) => `${id}:100`).join(",");
    router.push(`/result?foods=${encodeURIComponent(params)}&date=${encodeURIComponent(selectedDate)}`);
  };

  if (showFreeLimit) return <FreeLimitNotice />;

  return (
    <main className="min-h-screen bg-gray-50 pb-32">

      {/* ── ヘッダー ────────────────────────────────────── */}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-20 shadow-sm">
        <div className="mx-auto max-w-md relative flex items-center justify-center">
          <Link
            href="/"
            className="absolute left-0 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <span className="text-base leading-none">←</span>
            <span>戻る</span>
          </Link>
          <h1 className="text-lg font-bold text-gray-800">食事を記録</h1>
        </div>
      </header>

      <div className="mx-auto max-w-md px-4 pt-4 space-y-4">

        {/* ── カレンダー ──────────────────────────────────── */}
        <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-800 text-sm">記録する日を選ぶ</p>
            <span className="text-xs text-teal-600 font-semibold bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
              {formatDateJP(selectedDate)}
            </span>
          </div>

          {/* 月ナビ */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl"
              aria-label="前の月"
            >
              ‹
            </button>
            <p className="font-bold text-gray-700">{calYear}年{calMonth}月</p>
            <button
              type="button"
              onClick={nextMonth}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl"
              aria-label="次の月"
            >
              ›
            </button>
          </div>

          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-7 text-center">
            {WEEKDAYS.map((d, i) => (
              <span
                key={d}
                className={`text-xs font-semibold pb-1 ${
                  i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
                }`}
              >
                {d}
              </span>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`b-${idx}`} className="h-10" />;

              const dateStr = `${calYear}-${String(calMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const st      = dayStatus(dateStr);
              const isToday    = dateStr === today;
              const isSelected = dateStr === selectedDate;
              const colIdx  = idx % 7;

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex flex-col items-center justify-center h-10 rounded-xl transition-colors ${
                    isSelected
                      ? "bg-teal-500 text-white"
                      : isToday
                        ? "bg-teal-50 ring-2 ring-teal-400"
                        : "hover:bg-gray-50"
                  }`}
                >
                  <span className={`text-xs font-semibold ${
                    isSelected
                      ? "text-white"
                      : colIdx === 0
                        ? "text-red-400"
                        : colIdx === 6
                          ? "text-blue-400"
                          : "text-gray-700"
                  }`}>
                    {day}
                  </span>
                  {st !== "none" && (
                    <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-white" : DOT[st]}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* 凡例 */}
          <div className="flex gap-4 justify-center text-xs text-gray-400 pt-1">
            {[
              { color: "bg-teal-400", label: "良好" },
              { color: "bg-yellow-400", label: "注意" },
              { color: "bg-red-400", label: "多すぎ" },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* ── セクションタイトル ───────────────────────────── */}
        <div className="flex items-center gap-2 px-1">
          <span className="text-base font-bold text-gray-800">＋ 食材を選ぶ</span>
          {selected.size > 0 && (
            <span className="text-xs bg-teal-100 text-teal-700 font-bold rounded-full px-2 py-0.5">
              {selected.size}品選択中
            </span>
          )}
        </div>

      </div>

      {/* ── カテゴリタブ（sticky）────────────────────────── */}
      <div className="sticky top-[57px] z-10 bg-white border-b mt-2">
        <div className="mx-auto max-w-md overflow-x-auto flex gap-2 px-4 py-2">
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

      {/* ── 食品グリッド ─────────────────────────────────── */}
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

      {/* ── 下部固定ボタン ───────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 shadow-lg z-20">
        <div className="mx-auto max-w-md">
          {selected.size > 0 ? (
            <button
              type="button"
              onClick={handleSave}
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
