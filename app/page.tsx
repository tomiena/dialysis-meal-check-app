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
import PremiumSupportRow from "@/app/components/PremiumSupportRow";

// ─── ステータス色 ────────────────────────────────────────────
const DOT: Record<string, string> = {
  ok:      "bg-teal-400",
  caution: "bg-yellow-400",
  ng:      "bg-red-400",
  none:    "bg-gray-200",
};

const BAR_COLOR: Record<string, string> = {
  ok:      "bg-teal-400",
  caution: "bg-yellow-400",
  ng:      "bg-red-400",
};

function getStatus(value: number, okMax: number, ngMin: number) {
  if (value <= okMax) return "ok";
  if (value < ngMin)  return "caution";
  return "ng";
}

// ─── 直近7日間 ───────────────────────────────────────────────
function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return toDateStr(d);
  });
}

// ─── 今日の日付表示 ──────────────────────────────────────────
function todayLabel() {
  return new Date().toLocaleDateString("ja-JP", {
    month: "long", day: "numeric", weekday: "short",
  });
}

// ─── 今日のひとこと ──────────────────────────────────────────
function getDailyTip(meals: Meal[]): string {
  if (meals.length === 0) return "今日もこまめな記録で体の変化に気づきましょう。";
  const hasNg      = meals.some((m) => m.overall === "ng");
  const hasCaution = meals.some((m) => m.overall === "caution");
  if (hasNg)      return "今日は少し塩分やカリウムが多めでした。次の食事で調整しましょう。";
  if (hasCaution) return "今日はやや多めの栄養素があります。水分補給も意識してみてください。";
  return "今日の食事はバランスが取れています。この調子で続けましょう！";
}

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
  const last7      = getLast7Days();

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
  const hasTodayData = todayMeals.length > 0;

  // 日別のサマリー（カレンダー用）
  function dayStatus(dateStr: string) {
    const meals = history.filter((m) => m.date === dateStr);
    if (meals.length === 0) return "none";
    const hasNg      = meals.some((m) => m.overall === "ng");
    const hasCaution = meals.some((m) => m.overall === "caution");
    return hasNg ? "ng" : hasCaution ? "caution" : "ok";
  }

  // バイタル保存
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
          <span className="text-3xl">🍱</span>
        </div>
      </header>

      <div className="mx-auto max-w-md px-4 py-5 space-y-4">

        {/* ── 今日の栄養サマリー ──────────────────────────────── */}
        <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-700">今日の栄養状態</p>
            {hasTodayData && (
              <span className="text-xs text-gray-400">{todayMeals.length}食記録済み</span>
            )}
          </div>

          {hasTodayData ? (
            <div className="space-y-2">
              {[
                { label: "水分",     value: todayTotal.water,      unit: "ml", ok: 1500, ng: 2000 },
                { label: "塩分",     value: todayTotal.sodium,     unit: "mg", ok: 700,  ng: 1050 },
                { label: "カリウム", value: todayTotal.potassium,  unit: "mg", ok: 550,  ng: 825  },
                { label: "リン",     value: todayTotal.phosphorus, unit: "mg", ok: 220,  ng: 330  },
              ].map(({ label, value, unit, ok, ng }) => {
                const st = getStatus(value, ok, ng);
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">{label}</span>
                      <span className={`font-semibold ${
                        st === "ng" ? "text-red-500" : st === "caution" ? "text-yellow-500" : "text-teal-600"
                      }`}>
                        {value.toLocaleString()} {unit}
                      </span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
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
            <p className="text-sm text-gray-400 text-center py-3">
              まだ記録がありません
            </p>
          )}
        </section>

        {/* ── 今日のひとこと ───────────────────────────────────── */}
        <section className="bg-white rounded-2xl border shadow-sm p-4 flex gap-3 items-start">
          <span className="text-2xl flex-shrink-0">💬</span>
          <div>
            <p className="text-xs font-bold text-gray-500 mb-1">今日のひとこと</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {getDailyTip(todayMeals)}
            </p>
          </div>
        </section>

        {/* ── ＋食事を記録するボタン ────────────────────────────── */}
        <Link
          href="/meal"
          className="block w-full rounded-2xl bg-teal-600 py-5 text-center text-white text-lg font-bold shadow-md hover:bg-teal-700 active:scale-98 transition-all"
        >
          ＋ 食事を記録する
        </Link>

        {/* ── プレミアムサポート行 ──────────────────────────────── */}
        {!isPremium && <PremiumSupportRow />}

        {/* ── バイタル入力 ───────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-700">今日のバイタル</p>
            <button
              type="button"
              onClick={() => setShowVitals((v) => !v)}
              className="text-xs text-teal-600 font-semibold border border-teal-200 rounded-full px-3 py-1 hover:bg-teal-50"
            >
              {showVitals ? "閉じる" : "入力する"}
            </button>
          </div>

          {/* 保存済みバイタル表示 */}
          {!showVitals && (vitals.weight || vitals.bpSystolic || vitals.pulse) ? (
            <div className="grid grid-cols-3 gap-2 text-center">
              {vitals.weight && (
                <div className="bg-gray-50 rounded-xl py-2">
                  <p className="text-lg font-bold text-gray-800">{vitals.weight}</p>
                  <p className="text-xs text-gray-400">体重 kg</p>
                </div>
              )}
              {vitals.bpSystolic && vitals.bpDiastolic && (
                <div className="bg-gray-50 rounded-xl py-2">
                  <p className="text-lg font-bold text-gray-800">
                    {vitals.bpSystolic}/{vitals.bpDiastolic}
                  </p>
                  <p className="text-xs text-gray-400">血圧 mmHg</p>
                </div>
              )}
              {vitals.pulse && (
                <div className="bg-gray-50 rounded-xl py-2">
                  <p className="text-lg font-bold text-gray-800">{vitals.pulse}</p>
                  <p className="text-xs text-gray-400">脈拍 bpm</p>
                </div>
              )}
            </div>
          ) : !showVitals ? (
            <p className="text-sm text-gray-400 text-center py-1">
              未入力です
            </p>
          ) : null}

          {/* 入力フォーム */}
          {showVitals && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs text-gray-500">体重 (kg)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={editVitals.weight ?? ""}
                    onChange={(e) => setEditVitals((v) => ({ ...v, weight: parseFloat(e.target.value) || undefined }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                    placeholder="55.0"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-gray-500">脈拍 (bpm)</span>
                  <input
                    type="number"
                    value={editVitals.pulse ?? ""}
                    onChange={(e) => setEditVitals((v) => ({ ...v, pulse: parseInt(e.target.value) || undefined }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                    placeholder="72"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-gray-500">収縮期血圧 (mmHg)</span>
                  <input
                    type="number"
                    value={editVitals.bpSystolic ?? ""}
                    onChange={(e) => setEditVitals((v) => ({ ...v, bpSystolic: parseInt(e.target.value) || undefined }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                    placeholder="120"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs text-gray-500">拡張期血圧 (mmHg)</span>
                  <input
                    type="number"
                    value={editVitals.bpDiastolic ?? ""}
                    onChange={(e) => setEditVitals((v) => ({ ...v, bpDiastolic: parseInt(e.target.value) || undefined }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                    placeholder="80"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={handleSaveVitals}
                className="w-full rounded-xl bg-teal-600 py-3 text-white font-semibold hover:bg-teal-700 transition-colors"
              >
                保存する
              </button>
            </div>
          )}
        </section>

        {/* ── 直近7日間カレンダー（プレミアムのみ）──────────────── */}
        {isPremium && (
          <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
            <p className="font-bold text-gray-700">直近7日間</p>
            <div className="grid grid-cols-7 gap-1 text-center">
              {last7.map((dateStr) => {
                const st      = dayStatus(dateStr);
                const day     = new Date(dateStr).getDate();
                const isToday = dateStr === today;
                return (
                  <div key={dateStr} className="flex flex-col items-center gap-1">
                    <span className={`text-xs ${isToday ? "font-bold text-teal-600" : "text-gray-400"}`}>
                      {day}
                    </span>
                    <div className={`w-6 h-6 rounded-full ${DOT[st]} ${isToday ? "ring-2 ring-teal-400 ring-offset-1" : ""}`} />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3 text-xs text-gray-400 justify-center pt-1">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-400 inline-block" />良好</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />注意</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />多すぎ</span>
            </div>
          </section>
        )}

        {/* ── 今日の食事一覧 ────────────────────────────────────── */}
        {todayMeals.length > 0 && (
          <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-2">
            <p className="font-bold text-gray-700">今日の食事記録</p>
            {todayMeals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2">
                <p className="text-sm text-gray-700 truncate flex-1">
                  {meal.items.map((i) => i.name).join("・")}
                </p>
                <span className={`ml-2 flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                  meal.overall === "ng"      ? "bg-red-100 text-red-600"
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
            <p className="text-xs text-gray-400">より詳しい管理でさらに安心</p>
            <PremiumButton />
          </section>
        )}

      </div>
    </main>
  );
}
