"use client";

import { useState, useEffect } from "react";
import {
  Utensils,
  Activity,
  Scale,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Droplets,
  Settings2,
  Check,
  Wind,
} from "lucide-react";
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
import MealRecorder from "@/app/components/MealRecorder";

// ─── 判定色 ──────────────────────────────────────────────
const BAR_COLOR: Record<string, string> = {
  ok:      "bg-teal-400",
  caution: "bg-amber-400",
  ng:      "bg-red-400",
};
const VALUE_COLOR: Record<string, string> = {
  ok:      "text-teal-600",
  caution: "text-amber-500",
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
  bowelStatus: "normal" | "constipated" | "none" = "normal",
  edema = false,
  dyspnea = false,
): { status: "ok" | "caution" | "ng"; message: string } {
  const threshold = interval === "1" ? 3 : 5;
  void weight;

  if (gain < -1) {
    return { status: "caution", message: "食事量が落ちていないか確認しましょう。" };
  }

  let status: "ok" | "caution" | "ng" = "ok";
  let message = "";

  if (rate <= threshold) {
    status = "ok";
    message = "ドライウェイトを基準にみると、体重増加は目安の範囲内です。このまま飲水量・塩分・食事量のバランスを意識して続けましょう。";
  } else {
    status = "caution";
    message = "ドライウェイトを基準にみると、体重増加がやや多めです。飲水量や塩分だけでなく、食事量や排便状況の影響で増えることがあります。";
  }

  if (bowelStatus !== "normal") {
    message += " 便秘が続いている場合は、その影響で体重が増えることがあります。排便状況も確認しましょう。";
  }

  if (edema || dyspnea) {
    status = "ng";
    message += " むくみや息苦しさがある場合は注意が必要です。次回透析を待たず、医療機関へ相談してください。";
  }

  return { status, message };
}

function getDailyTip(
  meals: Meal[],
  total: { sodium: number; potassium: number; phosphorus: number },
): string {
  if (meals.length === 0) return "";
  if (total.sodium     > 1050) return `塩分が${total.sodium}mgを超えています。次の食事で汁物・醤油を控えましょう。`;
  if (total.potassium  > 825)  return `カリウムが${total.potassium}mgを超えています。野菜は茹でこぼしを心がけて。`;
  if (total.phosphorus > 330)  return `リンが${total.phosphorus}mgを超えています。乳製品や加工食品を控えると改善できます。`;
  if (total.sodium     > 700)  return `塩分がやや多め（${total.sodium}mg）です。汁物を半量にするだけで大きく変わります。`;
  if (total.potassium  > 550)  return `カリウムがやや高め（${total.potassium}mg）です。茹で野菜を意識してみてください。`;
  if (total.phosphorus > 220)  return `リンがやや多め（${total.phosphorus}mg）です。加工食品を少し控えてみましょう。`;
  return "今日の食事はバランスが取れています。";
}

const ADVICE_BG: Record<string, string> = {
  ok:      "bg-teal-50 text-teal-700 border-teal-100",
  caution: "bg-amber-50 text-amber-700 border-amber-100",
  ng:      "bg-red-50 text-red-700 border-red-100",
};
const ADVICE_ICON: Record<string, React.ReactNode> = {
  ok:      <CheckCircle2 size={14} className="text-teal-500 flex-shrink-0" />,
  caution: <AlertTriangle size={14} className="text-amber-500 flex-shrink-0" />,
  ng:      <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />,
};

// ヘッダー高さ（sticky offset 用）
const HOME_HEADER_HEIGHT = 80;

export default function HomePage() {
  const today = toDateStr(new Date());

  const [history,    setHistory]    = useState<Meal[]>([]);
  const [vitals,     setVitals]     = useState<DailyVitals>({ date: today });
  const [editVitals, setEditVitals] = useState<DailyVitals>({ date: today });
  const [isPremium,  setIsPremium]  = useState(false);

  const [dryWeight,        setDryWeight]        = useState<number | null>(null);
  const [dialysisInterval, setDialysisInterval] = useState<"1" | "2">("1");
  const [editDryWeight,    setEditDryWeight]    = useState("");
  const [editDrinkWater,   setEditDrinkWater]   = useState("");
  const [editInterval,     setEditInterval]     = useState<"1" | "2">("1");
  const [bowelStatus, setBowelStatus] = useState<"normal" | "constipated" | "none">("normal");
  const [edema,   setEdema]   = useState(false);
  const [dyspnea, setDyspnea] = useState(false);

  const [openForm, setOpenForm] = useState<null | "vitals" | "weight">(null);
  const toggleForm = (form: "vitals" | "weight") =>
    setOpenForm((prev) => (prev === form ? null : form));

  useEffect(() => {
    setHistory(getMealHistory());
    const v = getDailyVitals(today);
    setVitals(v);
    setEditVitals(v);
    setIsPremium(getIsPremium());
    const dw = getDryWeight();
    setDryWeight(dw);
    setEditDryWeight(dw != null ? String(dw) : "");
    const iv = getDialysisInterval();
    setDialysisInterval(iv);
    setEditInterval(iv);
    setEditDrinkWater(v.drinkWater != null ? String(v.drinkWater) : "");
  }, [today]);

  const todayMeals = history.filter((m) => m.date === today);
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
    const updated = { ...editVitals, date: today };
    saveDailyVitals(updated);
    setVitals(updated);
    setOpenForm(null);
  };

  const handleSaveWeight = () => {
    const dw = parseFloat(editDryWeight);
    if (!isNaN(dw) && dw > 0) { saveDryWeight(dw); setDryWeight(dw); }
    saveDialysisInterval(editInterval); setDialysisInterval(editInterval);
    const dWater = parseInt(editDrinkWater) || undefined;
    const updated = { ...vitals, date: today, drinkWater: dWater };
    saveDailyVitals(updated); setVitals(updated);
    setOpenForm(null);
  };

  const todayWeight    = vitals.weight;
  const hasWeightData  = dryWeight != null && todayWeight != null;
  const weightGain     = hasWeightData ? Math.round((todayWeight! - dryWeight!) * 10) / 10 : null;
  const weightRate     = hasWeightData
    ? Math.round(((todayWeight! - dryWeight!) / dryWeight!) * 1000) / 10
    : null;
  const weightAdvice   =
    hasWeightData && weightGain !== null && weightRate !== null
      ? getWeightAdvice(weightGain, weightRate, dialysisInterval, todayWeight!, bowelStatus, edema, dyspnea)
      : null;

  const tip = getDailyTip(todayMeals, todayTotal);

  const allOk = todayMeals.length > 0 &&
    todayMeals.every((m) => m.overall === "ok");
  const hasNg = todayMeals.some((m) => m.overall === "ng");

  return (
    <main className="min-h-screen bg-teal-50/50">

      {/* ── グラデーションヘッダー ── */}
      <header className="bg-gradient-to-br from-teal-600 to-teal-800 px-5 pt-10 pb-6 sticky top-0 z-20">
        <div className="mx-auto max-w-md">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Utensils size={18} className="text-teal-200" strokeWidth={2} />
                <h1 className="text-2xl font-bold text-white tracking-tight">透析食事チェック</h1>
              </div>
              <p className="text-sm text-teal-200">{todayLabel()}</p>
            </div>
            {todayMeals.length > 0 && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                allOk ? "bg-teal-500/50 text-white"
                : hasNg ? "bg-red-500/40 text-white"
                : "bg-amber-400/40 text-white"
              }`}>
                {allOk
                  ? <><CheckCircle2 size={13} /> 良好</>
                  : hasNg
                    ? <><AlertTriangle size={13} /> 要注意</>
                    : <><TrendingUp size={13} /> 注意</>
                }
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── ホームエリア ── */}
      <div className="mx-auto max-w-md px-4 pt-4 pb-3 space-y-3">

        {/* ① 今日の栄養状態カード */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-teal-500" />
              <p className="font-bold text-slate-800">今日の栄養状態</p>
            </div>
            {todayMeals.length > 0 && (
              <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-full px-2 py-0.5">
                {todayMeals.length}食記録済み
              </span>
            )}
          </div>

          {todayMeals.length > 0 ? (
            <>
              <div className="space-y-2.5">
                {[
                  { label: "水分",       icon: <Droplets size={13} />,   value: todayTotal.water,      unit: "ml", ok: 1500, ng: 2000 },
                  { label: "ナトリウム", icon: <span className="text-[11px] font-bold">塩</span>, value: todayTotal.sodium,     unit: "mg", ok: 700,  ng: 1050 },
                  { label: "カリウム",   icon: <span className="text-[11px] font-bold">K</span>,  value: todayTotal.potassium,  unit: "mg", ok: 550,  ng: 825  },
                  { label: "リン",       icon: <span className="text-[11px] font-bold">P</span>,  value: todayTotal.phosphorus, unit: "mg", ok: 220,  ng: 330  },
                ].map(({ label, value, unit, ok, ng }) => {
                  const st = getStatus(value, ok, ng);
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 font-medium">{label}</span>
                        <span className={`font-bold tabular-nums ${VALUE_COLOR[st]}`}>
                          {value.toLocaleString()} {unit}
                        </span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${BAR_COLOR[st]}`}
                          style={{ width: `${Math.min((value / ng) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {tip && (
                <div className={`flex items-start gap-2 text-xs rounded-xl px-3 py-2.5 border ${
                  hasNg
                    ? "bg-red-50 text-red-700 border-red-100"
                    : todayMeals.some(m => m.overall === "caution")
                      ? "bg-amber-50 text-amber-700 border-amber-100"
                      : "bg-teal-50 text-teal-700 border-teal-100"
                }`}>
                  {hasNg
                    ? <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                    : todayMeals.some(m => m.overall === "caution")
                      ? <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" />
                      : <Check size={13} className="flex-shrink-0 mt-0.5" />
                  }
                  <span className="leading-relaxed">{tip}</span>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4 space-y-1">
              <Utensils size={28} className="text-slate-200 mx-auto" />
              <p className="text-sm text-slate-400">まだ記録がありません</p>
              <p className="text-xs text-slate-300">下のエリアで食事を記録しましょう</p>
            </div>
          )}
        </section>

        {/* ② 今日の食事記録 */}
        {todayMeals.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-2 flex items-center gap-2">
              <Utensils size={15} className="text-teal-500" />
              <p className="font-bold text-slate-800">今日の食事記録</p>
            </div>
            <div className="px-3 pb-3 space-y-2">
              {todayMeals.map((meal) => (
                <div
                  key={meal.id}
                  className={`flex items-start justify-between rounded-xl px-3 py-3 gap-2 border-l-4 ${
                    meal.overall === "ng"      ? "bg-red-50   border-l-red-400"
                    : meal.overall === "caution" ? "bg-amber-50 border-l-amber-400"
                    :                              "bg-teal-50  border-l-teal-400"
                  }`}
                >
                  <p className="text-sm text-slate-700 leading-snug flex-1 min-w-0">
                    {meal.items.map((i) => i.name).join("・")}
                  </p>
                  <div className="flex-shrink-0 flex flex-col items-end gap-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      meal.overall === "ng"        ? "bg-red-100    text-red-600"
                      : meal.overall === "caution" ? "bg-amber-100  text-amber-600"
                      :                              "bg-teal-100   text-teal-600"
                    }`}>
                      {meal.overall === "ng" ? "要注意" : meal.overall === "caution" ? "注意" : "良好"}
                    </span>
                    {meal.advice && (
                      <p className="text-xs text-slate-400 text-right max-w-[140px] leading-tight">
                        {meal.advice}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ③ バイタル・体重管理 */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-teal-500" />
              <p className="font-bold text-slate-800">バイタル・体重</p>
            </div>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => toggleForm("vitals")}
                className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition-all ${
                  openForm === "vitals"
                    ? "bg-teal-600 text-white border-teal-600"
                    : "text-teal-600 border-teal-200 active:bg-teal-50"
                }`}
              >
                バイタル
              </button>
              <button
                type="button"
                onClick={() => toggleForm("weight")}
                className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition-all ${
                  openForm === "weight"
                    ? "bg-teal-600 text-white border-teal-600"
                    : "text-teal-600 border-teal-200 active:bg-teal-50"
                }`}
              >
                <Scale size={11} className="inline mr-1" />体重
              </button>
            </div>
          </div>

          {/* サマリー表示 */}
          {openForm === null && (
            <div className="space-y-2">
              {(vitals.weight || vitals.bpSystolic || vitals.pulse) ? (
                <div className="grid grid-cols-3 gap-2 text-center">
                  {vitals.weight && (
                    <div className="bg-teal-50 rounded-xl py-2.5 border border-teal-100">
                      <p className="text-base font-bold text-teal-700 tabular-nums">{vitals.weight}</p>
                      <p className="text-xs text-teal-500">体重 kg</p>
                    </div>
                  )}
                  {vitals.bpSystolic && vitals.bpDiastolic && (
                    <div className="bg-teal-50 rounded-xl py-2.5 border border-teal-100">
                      <p className="text-sm font-bold text-teal-700 tabular-nums">
                        {vitals.bpSystolic}/{vitals.bpDiastolic}
                      </p>
                      <p className="text-xs text-teal-500">血圧</p>
                    </div>
                  )}
                  {vitals.pulse && (
                    <div className="bg-teal-50 rounded-xl py-2.5 border border-teal-100">
                      <p className="text-base font-bold text-teal-700 tabular-nums">{vitals.pulse}</p>
                      <p className="text-xs text-teal-500">脈拍</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Settings2 size={13} />
                  上のボタンから入力できます
                </p>
              )}

              {hasWeightData && weightGain !== null && weightRate !== null && (
                <div className="space-y-1.5">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 rounded-xl py-2.5 border border-slate-100">
                      <p className="text-base font-bold text-slate-600 tabular-nums">{dryWeight}</p>
                      <p className="text-xs text-slate-400">DW (kg)</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl py-2.5 border border-slate-100">
                      <p className="text-base font-bold text-slate-600 tabular-nums">{todayWeight}</p>
                      <p className="text-xs text-slate-400">今日 (kg)</p>
                    </div>
                    <div className={`rounded-xl py-2.5 border ${weightAdvice ? ADVICE_BG[weightAdvice.status] : "bg-slate-50 border-slate-100"}`}>
                      <p className="text-base font-bold tabular-nums">
                        {weightGain >= 0 ? "+" : ""}{weightGain}
                      </p>
                      <p className="text-xs opacity-70">
                        {weightRate >= 0 ? "+" : ""}{weightRate}%
                      </p>
                    </div>
                  </div>
                  {vitals.drinkWater != null && (
                    <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
                      <Droplets size={11} className="text-teal-400" />
                      飲水：{vitals.drinkWater} ml
                    </p>
                  )}
                  {weightAdvice && (
                    <div className={`flex items-start gap-2 text-xs rounded-xl px-3 py-2.5 border leading-relaxed ${ADVICE_BG[weightAdvice.status]}`}>
                      {ADVICE_ICON[weightAdvice.status]}
                      <span>{weightAdvice.message}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* バイタル入力フォーム */}
          {openForm === "vitals" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "体重 (kg)", key: "weight", type: "decimal", placeholder: "55.0",
                    val: editVitals.weight ?? "", onChange: (v: string) => setEditVitals(e => ({ ...e, weight: parseFloat(v) || undefined })) },
                  { label: "脈拍 (bpm)", key: "pulse", type: "numeric", placeholder: "72",
                    val: editVitals.pulse ?? "", onChange: (v: string) => setEditVitals(e => ({ ...e, pulse: parseInt(v) || undefined })) },
                  { label: "収縮期血圧", key: "bpS", type: "numeric", placeholder: "120",
                    val: editVitals.bpSystolic ?? "", onChange: (v: string) => setEditVitals(e => ({ ...e, bpSystolic: parseInt(v) || undefined })) },
                  { label: "拡張期血圧", key: "bpD", type: "numeric", placeholder: "80",
                    val: editVitals.bpDiastolic ?? "", onChange: (v: string) => setEditVitals(e => ({ ...e, bpDiastolic: parseInt(v) || undefined })) },
                ].map(({ label, key, type, placeholder, val, onChange }) => (
                  <label key={key} className="space-y-1">
                    <span className="text-xs font-medium text-slate-500">{label}</span>
                    <input type="number" inputMode={type as "decimal" | "numeric"}
                      step={type === "decimal" ? "0.1" : "1"}
                      value={String(val)}
                      onChange={(e) => onChange(e.target.value)}
                      className="w-full h-12 rounded-xl border border-slate-200 px-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                      placeholder={placeholder} />
                  </label>
                ))}
              </div>
              <button type="button" onClick={handleSaveVitals}
                className="w-full rounded-xl bg-teal-600 py-3 text-white text-base font-bold active:bg-teal-700 transition-colors">
                登録する
              </button>
            </div>
          )}

          {/* 体重・飲水フォーム */}
          {openForm === "weight" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "ドライウェイト (kg)", key: "dw", type: "decimal", placeholder: "55.0",
                    val: editDryWeight, onChange: setEditDryWeight },
                  { label: "今日の体重 (kg)", key: "w", type: "decimal", placeholder: "57.0",
                    val: String(editVitals.weight ?? ""),
                    onChange: (v: string) => setEditVitals(e => ({ ...e, weight: parseFloat(v) || undefined })) },
                  { label: "飲水量 (ml)", key: "dw2", type: "numeric", placeholder: "800",
                    val: editDrinkWater, onChange: setEditDrinkWater },
                ].map(({ label, key, type, placeholder, val, onChange }) => (
                  <label key={key} className="space-y-1">
                    <span className="text-xs font-medium text-slate-500">{label}</span>
                    <input type="number" inputMode={type as "decimal" | "numeric"}
                      step={type === "decimal" ? "0.1" : "1"}
                      value={val}
                      onChange={(e) => onChange(e.target.value)}
                      className="w-full h-12 rounded-xl border border-slate-200 px-3 text-base focus:outline-none focus:ring-2 focus:ring-teal-300"
                      placeholder={placeholder} />
                  </label>
                ))}
                <label className="space-y-1">
                  <span className="text-xs font-medium text-slate-500">透析間隔</span>
                  <select value={editInterval}
                    onChange={(e) => setEditInterval(e.target.value as "1" | "2")}
                    className="w-full h-12 rounded-xl border border-slate-200 px-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-300">
                    <option value="1">1日空き</option>
                    <option value="2">2日空き</option>
                  </select>
                </label>
              </div>
              <label className="space-y-1 block">
                <span className="text-xs font-medium text-slate-500">排便状況</span>
                <select value={bowelStatus}
                  onChange={(e) => setBowelStatus(e.target.value as "normal" | "constipated" | "none")}
                  className="w-full h-12 rounded-xl border border-slate-200 px-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-teal-300">
                  <option value="normal">あり（通常）</option>
                  <option value="constipated">便秘</option>
                  <option value="none">なし</option>
                </select>
              </label>
              <div className="flex gap-5 items-center pt-1">
                <label className="flex items-center gap-2 text-sm text-slate-600 min-h-[44px]">
                  <input type="checkbox" checked={edema} onChange={(e) => setEdema(e.target.checked)}
                    className="w-5 h-5 accent-teal-600 rounded" />
                  <Wind size={14} className="text-slate-400" />
                  むくみ
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-600 min-h-[44px]">
                  <input type="checkbox" checked={dyspnea} onChange={(e) => setDyspnea(e.target.checked)}
                    className="w-5 h-5 accent-teal-600 rounded" />
                  <Wind size={14} className="text-slate-400" />
                  息苦しさ
                </label>
              </div>
              <button type="button" onClick={handleSaveWeight}
                className="w-full rounded-xl bg-teal-600 py-3 text-white text-base font-bold active:bg-teal-700 transition-colors">
                登録する
              </button>
            </div>
          )}
        </section>

        {/* ④ プレミアム */}
        {!isPremium && (
          <div className="flex items-center justify-between rounded-2xl bg-teal-50 border border-teal-200 px-4 py-3">
            <p className="text-xs text-slate-500">より詳しい管理でさらに安心</p>
            <PremiumButton />
          </div>
        )}

      </div>

      {/* ── 区切り ── */}
      <div className="border-t-4 border-slate-200 mt-1">
        <div className="mx-auto max-w-md px-5 pt-3 pb-1 flex items-center gap-2">
          <Utensils size={15} className="text-teal-500" />
          <p className="text-sm font-bold text-slate-500">食事を記録する</p>
        </div>
      </div>

      {/* ── 食事記録エリア ── */}
      <MealRecorder stickyOffset={HOME_HEADER_HEIGHT} />

    </main>
  );
}
