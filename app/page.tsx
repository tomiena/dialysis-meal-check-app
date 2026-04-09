"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  getMealHistory,
  getDailyVitals,
  saveDailyVitals,
  toDateStr,
  type Meal,
  type DailyVitals,
} from "@/lib/storage";
import { getIsPremium } from "@/lib/premium";
import PremiumButton from "@/app/components/PremiumButton";

// ─── ステータス色 ────────────────────────────────────────────
const BAR_COLOR: Record<string, string> = {
  ok:      "bg-teal-400",
  caution: "bg-yellow-400",
  ng:      "bg-red-400",
};

const DOT_COLOR: Record<string, string> = {
  ok:      "bg-teal-400",
  caution: "bg-yellow-400",
  ng:      "bg-red-400",
  none:    "bg-gray-200",
};

const STATUS_TEXT: Record<string, string> = {
  ok:      "text-teal-600",
  caution: "text-yellow-500",
  ng:      "text-red-500",
};

function getStatus(value: number, okMax: number, ngMin: number) {
  if (value <= okMax) return "ok";
  if (value < ngMin)  return "caution";
  return "ng";
}

// ─── 今日の日付表示 ──────────────────────────────────────────
function todayLabel() {
  return new Date().toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
  });
}

// ─── 今日のひとこと ──────────────────────────────────────────
function getDailyTip(meals: Meal[]): string {
  if (meals.length === 0) return "今日もこまめな記録で体の変化に気づきましょう。";
  const hasNg      = meals.some((m) => m.overall === "ng");
  const hasCaution = meals.some((m) => m.overall === "caution");
  if (hasNg)      return "塩分やカリウムが多めでした。次の食事は少し控えめにしてみましょう。";
  if (hasCaution) return "やや多めの栄養素があります。水分補給も意識してみてください。";
  return "今日の食事はバランスが取れています。この調子で続けましょう！";
}

// ─── 月カレンダー ─────────────────────────────────────────────
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function MonthCalendar({
  history,
  today,
}: {
  history: Meal[];
  today: string;
}) {
  const [year, setYear]   = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth() + 1);

  function dayStatus(dateStr: string) {
    const meals = history.filter((m) => m.date === dateStr);
    if (meals.length === 0) return "none";
    const hasNg      = meals.some((m) => m.overall === "ng");
    const hasCaution = meals.some((m) => m.overall === "caution");
    return hasNg ? "ng" : hasCaution ? "caution" : "ok";
  }

  const daysInMonth  = new Date(year, month, 0).getDate();
  const firstWeekday = new Date(year, month - 1, 1).getDay();

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-3">
      {/* ナビゲーション */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-lg"
          aria-label="前の月"
        >
          ‹
        </button>
        <p className="font-bold text-gray-700 text-base">
          {year}年{month}月
        </p>
        <button
          type="button"
          onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-lg"
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
          if (day === null) return <div key={`blank-${idx}`} />;
          const dateStr  = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const st       = dayStatus(dateStr);
          const isToday  = dateStr === today;
          const colIdx   = idx % 7;

          return (
            <div key={dateStr} className="flex flex-col items-center gap-0.5 py-0.5">
              <span
                className={`text-xs ${
                  isToday
                    ? "font-bold text-white bg-teal-500 w-6 h-6 rounded-full flex items-center justify-center"
                    : colIdx === 0
                      ? "text-red-400"
                      : colIdx === 6
                        ? "text-blue-400"
                        : "text-gray-600"
                }`}
              >
                {day}
              </span>
              {st !== "none" && (
                <div className={`w-1.5 h-1.5 rounded-full ${DOT_COLOR[st]}`} />
              )}
            </div>
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
            <span className={`w-2 h-2 rounded-full inline-block ${color}`} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── ホーム画面 ──────────────────────────────────────────────
export default function HomePage() {
  const today = toDateStr(new Date());

  const [history, setHistory]       = useState<Meal[]>([]);
  const [vitals, setVitals]         = useState<DailyVitals>({ date: today });
  const [editVitals, setEditVitals] = useState<DailyVitals>({ date: today });
  const [showVitals, setShowVitals] = useState(false);
  const [isPremium, setIsPremium]   = useState(false);

  useEffect(() => {
    setHistory(getMealHistory());
    const v = getDailyVitals(today);
    setVitals(v);
    setEditVitals(v);
    setIsPremium(getIsPremium());
  }, [today]);

  const todayMeals = history.filter((m) => m.date === today);
  const hasTodayData = todayMeals.length > 0;

  // 今日の合計栄養
  const todayTotal = todayMeals.reduce(
    (acc, m) => ({
      water:      acc.water      + (m.total.water      ?? 0),
      sodium:     acc.sodium     + (m.total.sodium     ?? 0),
      potassium:  acc.potassium  + (m.total.potassium  ?? 0),
      phosphorus: acc.phosphorus + (m.total.phosphorus ?? 0),
    }),
    { water: 0, sodium: 0, potassium: 0, phosphorus: 0 }
  );

  const handleSaveVitals = () => {
    saveDailyVitals({ ...editVitals, date: today });
    setVitals({ ...editVitals, date: today });
    setShowVitals(false);
  };

  return (
    <main className="min-h-screen bg-gray-50">

      {/* ── ヘッダー ──────────────────────────────────────────── */}
      <header className="bg-white border-b px-5 py-4 sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-md flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">食事チェック</h1>
            <p className="text-xs text-gray-400">{todayLabel()}</p>
          </div>
          <span className="text-3xl" role="img" aria-label="食事チェック">🍱</span>
        </div>
      </header>

      <div className="mx-auto max-w-md px-4 py-5 space-y-4">

        {/* ── 今日の状態 ───────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-800">今日の状態</p>
            {hasTodayData && (
              <span className="text-xs text-gray-400 bg-gray-50 border rounded-full px-2 py-0.5">
                {todayMeals.length}食記録済み
              </span>
            )}
          </div>

          {hasTodayData ? (
            <div className="space-y-3">
              {[
                { label: "水分",     value: todayTotal.water,      unit: "ml", ok: 1500, ng: 2000 },
                { label: "ナトリウム", value: todayTotal.sodium,   unit: "mg", ok: 700,  ng: 1050 },
                { label: "カリウム",  value: todayTotal.potassium, unit: "mg", ok: 550,  ng: 825  },
                { label: "リン",     value: todayTotal.phosphorus, unit: "mg", ok: 220,  ng: 330  },
              ].map(({ label, value, unit, ok, ng }) => {
                const st = getStatus(value, ok, ng);
                return (
                  <div key={label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600 font-medium">{label}</span>
                      <span className={`font-bold ${STATUS_TEXT[st]}`}>
                        {value.toLocaleString()} {unit}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${BAR_COLOR[st] ?? "bg-teal-400"}`}
                        style={{ width: `${Math.min((value / ng) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              まだ記録がありません
            </p>
          )}
        </section>

        {/* ── 今日のひとこと ───────────────────────────────────── */}
        <section className="bg-white rounded-2xl border shadow-sm p-4 flex gap-3 items-start">
          <span className="text-2xl flex-shrink-0 mt-0.5" role="img" aria-label="アドバイス">💬</span>
          <div>
            <p className="text-xs font-bold text-gray-500 mb-1">今日のひとこと</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {getDailyTip(todayMeals)}
            </p>
          </div>
        </section>

        {/* ── 食事を記録するボタン ──────────────────────────────── */}
        <Link
          href="/meal"
          className="block w-full rounded-2xl bg-teal-600 py-5 text-center text-white text-lg font-bold shadow-md hover:bg-teal-700 active:scale-[0.98] transition-all"
        >
          ＋ 食事を記録する
        </Link>

        {/* ── 登録するボタン ────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setShowVitals((v) => !v)}
          className="w-full rounded-2xl border-2 border-teal-600 py-4 text-center text-teal-700 text-base font-bold hover:bg-teal-50 active:scale-[0.98] transition-all"
        >
          {showVitals ? "閉じる" : "バイタルを登録する"}
        </button>

        {/* ── バイタル入力フォーム ──────────────────────────────── */}
        {showVitals && (
          <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
            <p className="font-bold text-gray-800">今日のバイタル</p>

            {/* 保存済みバイタル表示 */}
            {(vitals.weight || vitals.bpSystolic || vitals.pulse) && (
              <div className="grid grid-cols-3 gap-2 text-center pb-2 border-b">
                {vitals.weight && (
                  <div className="bg-teal-50 rounded-xl py-2">
                    <p className="text-lg font-bold text-teal-700">{vitals.weight}</p>
                    <p className="text-xs text-gray-400">体重 kg</p>
                  </div>
                )}
                {vitals.bpSystolic && vitals.bpDiastolic && (
                  <div className="bg-teal-50 rounded-xl py-2">
                    <p className="text-base font-bold text-teal-700">
                      {vitals.bpSystolic}/{vitals.bpDiastolic}
                    </p>
                    <p className="text-xs text-gray-400">血圧</p>
                  </div>
                )}
                {vitals.pulse && (
                  <div className="bg-teal-50 rounded-xl py-2">
                    <p className="text-lg font-bold text-teal-700">{vitals.pulse}</p>
                    <p className="text-xs text-gray-400">脈拍 bpm</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-500">体重 (kg)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  value={editVitals.weight ?? ""}
                  onChange={(e) => setEditVitals((v) => ({ ...v, weight: parseFloat(e.target.value) || undefined }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                  placeholder="55.0"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-500">脈拍 (bpm)</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={editVitals.pulse ?? ""}
                  onChange={(e) => setEditVitals((v) => ({ ...v, pulse: parseInt(e.target.value) || undefined }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                  placeholder="72"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-500">収縮期血圧</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={editVitals.bpSystolic ?? ""}
                  onChange={(e) => setEditVitals((v) => ({ ...v, bpSystolic: parseInt(e.target.value) || undefined }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                  placeholder="120"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-medium text-gray-500">拡張期血圧</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={editVitals.bpDiastolic ?? ""}
                  onChange={(e) => setEditVitals((v) => ({ ...v, bpDiastolic: parseInt(e.target.value) || undefined }))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                  placeholder="80"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={handleSaveVitals}
              className="w-full rounded-xl bg-teal-600 py-3 text-white text-base font-bold hover:bg-teal-700 transition-colors"
            >
              登録する
            </button>
          </section>
        )}

        {/* ── カレンダー ────────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border shadow-sm p-4">
          <MonthCalendar history={history} today={today} />
        </section>

        {/* ── 今日の食事一覧 ────────────────────────────────────── */}
        {todayMeals.length > 0 && (
          <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-2">
            <p className="font-bold text-gray-800">今日の食事記録</p>
            {todayMeals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-3">
                <p className="text-sm text-gray-700 truncate flex-1">
                  {meal.items.map((i) => i.name).join("・")}
                </p>
                <span className={`ml-2 flex-shrink-0 text-xs font-bold px-2 py-1 rounded-full ${
                  meal.overall === "ng"        ? "bg-red-100 text-red-600"
                  : meal.overall === "caution" ? "bg-yellow-100 text-yellow-600"
                  : "bg-teal-100 text-teal-600"
                }`}>
                  {meal.overall === "ng" ? "要注意" : meal.overall === "caution" ? "注意" : "良好"}
                </span>
              </div>
            ))}
          </section>
        )}

        {/* ── プレミアムセクション ──────────────────────────────── */}
        {!isPremium && (
          <section className="rounded-2xl bg-gradient-to-r from-teal-50 to-white border border-teal-100 p-4 text-center space-y-2">
            <p className="text-xs text-gray-500">より詳しい管理でさらに安心</p>
            <PremiumButton />
          </section>
        )}

      </div>
    </main>
  );
}
