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

// ─── ステータス ───────────────────────────────────────────
const BAR_COLOR: Record<string, string> = {
  ok:      "bg-teal-400",
  caution: "bg-yellow-400",
  ng:      "bg-red-400",
};
const VALUE_COLOR: Record<string, string> = {
  ok:      "text-teal-600",
  caution: "text-yellow-500",
  ng:      "text-red-500",
};

function getStatus(value: number, okMax: number, ngMin: number) {
  if (value <= okMax) return "ok";
  if (value < ngMin)  return "caution";
  return "ng";
}

function todayLabel() {
  return new Date().toLocaleDateString("ja-JP", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
  });
}

function getDailyTip(
  meals: Meal[],
  total: { sodium: number; potassium: number; phosphorus: number },
): string {
  if (meals.length === 0) return "今日もこまめな記録で体の変化に気づきましょう。";

  const sNg = total.sodium     > 1050;
  const kNg = total.potassium  > 825;
  const pNg = total.phosphorus > 330;
  const sCa = !sNg && total.sodium     > 700;
  const kCa = !kNg && total.potassium  > 550;
  const pCa = !pNg && total.phosphorus > 220;

  if (sNg) return `今日の塩分が${total.sodium}mgを超えています。汁物を残す・醤油を減らすなど、次の食事で調整しましょう。`;
  if (kNg) return `今日のカリウムが${total.potassium}mgを超えています。野菜は茹でこぼしを心がけてください。`;
  if (pNg) return `今日のリンが${total.phosphorus}mgを超えています。乳製品や加工食品を控えると改善できます。`;
  if (sCa) return `塩分がやや多め（${total.sodium}mg）です。明日は汁物を半量にするだけで大きく変わります。`;
  if (kCa) return `カリウムがやや高め（${total.potassium}mg）です。茹で野菜を意識してみてください。`;
  if (pCa) return `リンがやや多め（${total.phosphorus}mg）です。加工食品を少し控えてみましょう。`;
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

  const todayMeals   = history.filter((m) => m.date === today);
  const hasTodayData = todayMeals.length > 0;

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

      {/* ── ヘッダー ──────────────────────────────────────── */}
      <header className="bg-white border-b px-5 py-4 sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-md">
          <h1 className="text-xl font-bold text-gray-800">食事チェック</h1>
          <p className="text-xs text-gray-400">{todayLabel()}</p>
        </div>
      </header>

      <div className="mx-auto max-w-md px-4 py-5 space-y-4">

        {/* ── 今日の状態 ────────────────────────────────────── */}
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
                      <span className={`font-bold ${VALUE_COLOR[st]}`}>
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
            <div className="py-4 text-center space-y-2">
              <p className="text-sm text-gray-400">まだ記録がありません</p>
              <Link
                href="/meal"
                className="inline-block text-sm text-teal-600 font-semibold underline"
              >
                食事を記録する →
              </Link>
            </div>
          )}
        </section>

        {/* ── 今日のひとこと ────────────────────────────────── */}
        <section className="bg-white rounded-2xl border shadow-sm p-4 flex gap-3 items-start">
          <span className="text-2xl flex-shrink-0 mt-0.5">💬</span>
          <div>
            <p className="text-xs font-bold text-gray-500 mb-1">今日のひとこと</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {getDailyTip(todayMeals, todayTotal)}
            </p>
          </div>
        </section>

        {/* ── 記録ボタン ───────────────────────────────────── */}
        <div className="flex gap-3">
          <Link
            href="/meal"
            className="flex-1 rounded-2xl bg-teal-600 py-4 text-center text-white text-base font-bold shadow-sm hover:bg-teal-700 active:scale-[0.98] transition-all"
          >
            食事を記録する
          </Link>
          <Link
            href="/meal?mode=free"
            className="flex-1 rounded-2xl border-2 border-teal-500 py-4 text-center text-teal-700 text-base font-semibold hover:bg-teal-50 active:scale-[0.98] transition-all"
          >
            自由入力する
          </Link>
        </div>

        {/* ── バイタル ──────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-800">今日のバイタル</p>
            <button
              type="button"
              onClick={() => setShowVitals((v) => !v)}
              className="text-xs text-teal-600 font-semibold border border-teal-200 rounded-full px-3 py-1 hover:bg-teal-50"
            >
              {showVitals ? "閉じる" : "入力する"}
            </button>
          </div>

          {!showVitals && (vitals.weight || vitals.bpSystolic || vitals.pulse) ? (
            <div className="grid grid-cols-3 gap-2 text-center">
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
          ) : !showVitals ? (
            <p className="text-sm text-gray-400 text-center py-1">未入力です</p>
          ) : null}

          {showVitals && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-500">体重 (kg)</span>
                  <input
                    type="number" inputMode="decimal" step="0.1"
                    value={editVitals.weight ?? ""}
                    onChange={(e) => setEditVitals((v) => ({ ...v, weight: parseFloat(e.target.value) || undefined }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                    placeholder="55.0"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-500">脈拍 (bpm)</span>
                  <input
                    type="number" inputMode="numeric"
                    value={editVitals.pulse ?? ""}
                    onChange={(e) => setEditVitals((v) => ({ ...v, pulse: parseInt(e.target.value) || undefined }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                    placeholder="72"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-500">収縮期血圧</span>
                  <input
                    type="number" inputMode="numeric"
                    value={editVitals.bpSystolic ?? ""}
                    onChange={(e) => setEditVitals((v) => ({ ...v, bpSystolic: parseInt(e.target.value) || undefined }))}
                    className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                    placeholder="120"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-xs font-medium text-gray-500">拡張期血圧</span>
                  <input
                    type="number" inputMode="numeric"
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
            </div>
          )}
        </section>

        {/* ── 今日の食事記録 ────────────────────────────────── */}
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

        {/* ── プレミアム ────────────────────────────────────── */}
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
