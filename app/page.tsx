"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  getMealHistory,
  getDailyVitals,
  saveDailyVitals,
  getDryWeight,
  saveDryWeight,
  getDialysisInterval,
  saveDialysisInterval,
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

// ─── 体重増加アドバイス ───────────────────────────────────
function getWeightAdvice(
  gain: number,
  rate: number,
  interval: "1" | "2",
  weight: number,
): { status: "ok" | "caution" | "ng"; message: string } {
  const threshold = interval === "1" ? 3 : 5;
  const isSmall = weight < 45;

  if (gain < -1) {
    return {
      status: "caution",
      message: "体重がやや少ない傾向があります。食事量が落ちていないか確認してみてください。疲れやすさや貧血傾向も合わせて気にかけてみましょう。",
    };
  }
  const effectiveThreshold = isSmall ? threshold + 1 : threshold;
  if (rate > effectiveThreshold) {
    return {
      status: "ng",
      message: `体重が増えやすい状態です。飲み物の量や、汁物・塩分の多い食品を少し控えてみましょう。むくみや息苦しさが出たら早めに施設へご連絡ください。`,
    };
  }
  if (rate > threshold * 0.7) {
    return {
      status: "caution",
      message: "体重がやや増えています。飲み物の量に気をつけながら過ごしてみましょう。",
    };
  }
  return {
    status: "ok",
    message: "体重管理ができています。この調子で続けましょう。",
  };
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

  // 体重・飲水管理
  const [dryWeight, setDryWeight]           = useState<number | null>(null);
  const [dialysisInterval, setDialysisInterval] = useState<"1" | "2">("1");
  const [showWeightCard, setShowWeightCard] = useState(false);
  const [editDryWeight, setEditDryWeight]   = useState<string>("");
  const [editDrinkWater, setEditDrinkWater] = useState<string>("");
  const [editInterval, setEditInterval]     = useState<"1" | "2">("1");

  useEffect(() => {
    setHistory(getMealHistory());
    const v = getDailyVitals(today);
    setVitals(v);
    setEditVitals(v);
    setIsPremium(getIsPremium());
    const dw = getDryWeight();
    setDryWeight(dw);
    setEditDryWeight(dw != null ? String(dw) : "");
    const interval = getDialysisInterval();
    setDialysisInterval(interval);
    setEditInterval(interval);
    setEditDrinkWater(v.drinkWater != null ? String(v.drinkWater) : "");
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

  const handleSaveWeightCard = () => {
    const dw = parseFloat(editDryWeight);
    if (!isNaN(dw) && dw > 0) { saveDryWeight(dw); setDryWeight(dw); }
    const dint = editInterval;
    saveDialysisInterval(dint); setDialysisInterval(dint);
    const dWater = parseInt(editDrinkWater) || undefined;
    const updated = { ...vitals, date: today, drinkWater: dWater };
    saveDailyVitals(updated); setVitals(updated);
    setShowWeightCard(false);
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

        {/* ── 体重・飲水管理 ───────────────────────────────── */}
        {(() => {
          const todayWeight = vitals.weight;
          const hasData = dryWeight != null && todayWeight != null;
          const gain = hasData ? Math.round((todayWeight! - dryWeight!) * 10) / 10 : null;
          const rate = hasData ? Math.round(((todayWeight! - dryWeight!) / dryWeight!) * 1000) / 10 : null;
          const advice = hasData && gain !== null && rate !== null
            ? getWeightAdvice(gain, rate, dialysisInterval, todayWeight!)
            : null;
          const ADVICE_BG: Record<string, string> = {
            ok:      "bg-teal-50 text-teal-700",
            caution: "bg-yellow-50 text-yellow-700",
            ng:      "bg-red-50 text-red-700",
          };
          return (
            <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-800">体重・飲水管理</p>
                <button
                  type="button"
                  onClick={() => setShowWeightCard((v) => !v)}
                  className="text-xs text-teal-600 font-semibold border border-teal-200 rounded-full px-3 py-1 hover:bg-teal-50"
                >
                  {showWeightCard ? "閉じる" : "入力する"}
                </button>
              </div>

              {!showWeightCard && (
                <>
                  {hasData && gain !== null && rate !== null ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-teal-50 rounded-xl py-2">
                          <p className="text-lg font-bold text-teal-700">{dryWeight}</p>
                          <p className="text-xs text-gray-400">DW (kg)</p>
                        </div>
                        <div className="bg-teal-50 rounded-xl py-2">
                          <p className="text-lg font-bold text-teal-700">{todayWeight}</p>
                          <p className="text-xs text-gray-400">今日 (kg)</p>
                        </div>
                        <div className={`rounded-xl py-2 ${advice ? ADVICE_BG[advice.status] : "bg-gray-50"}`}>
                          <p className="text-lg font-bold">
                            {gain >= 0 ? "+" : ""}{gain}
                          </p>
                          <p className="text-xs opacity-70">{rate >= 0 ? "+" : ""}{rate}%</p>
                        </div>
                      </div>
                      {vitals.drinkWater != null && (
                        <p className="text-xs text-gray-500 text-center">飲水：{vitals.drinkWater} ml</p>
                      )}
                      {advice && (
                        <div className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${ADVICE_BG[advice.status]}`}>
                          {advice.message}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 text-center">
                        ※個別の指示は主治医・透析施設の方針を優先してください。
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 text-center py-1">
                      {dryWeight == null ? "ドライウェイトを入力してください" : "今日の体重を入力してください"}
                    </p>
                  )}
                </>
              )}

              {showWeightCard && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-gray-500">ドライウェイト (kg)</span>
                      <input
                        type="number" inputMode="decimal" step="0.1"
                        value={editDryWeight}
                        onChange={(e) => setEditDryWeight(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                        placeholder="55.0"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-gray-500">今日の体重 (kg)</span>
                      <input
                        type="number" inputMode="decimal" step="0.1"
                        value={editVitals.weight ?? ""}
                        onChange={(e) => setEditVitals((v) => ({ ...v, weight: parseFloat(e.target.value) || undefined }))}
                        className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                        placeholder="57.0"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-gray-500">飲水量 (ml)</span>
                      <input
                        type="number" inputMode="numeric"
                        value={editDrinkWater}
                        onChange={(e) => setEditDrinkWater(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                        placeholder="800"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-xs font-medium text-gray-500">透析間隔</span>
                      <select
                        value={editInterval}
                        onChange={(e) => setEditInterval(e.target.value as "1" | "2")}
                        className="w-full rounded-xl border border-gray-200 px-3 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-300"
                      >
                        <option value="1">1日空き</option>
                        <option value="2">2日空き</option>
                      </select>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveWeightCard}
                    className="w-full rounded-xl bg-teal-600 py-3 text-white text-base font-bold hover:bg-teal-700 transition-colors"
                  >
                    登録する
                  </button>
                </div>
              )}
            </section>
          );
        })()}

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
