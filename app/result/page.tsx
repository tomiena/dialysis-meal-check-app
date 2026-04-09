"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FOODS } from "@/lib/foods";
import { judgeMeal, calculateTotals, type MealItem } from "@/lib/judge";
import { generateAdvice, generateProfessionalAdvice } from "@/lib/advice";
import { getMealHistory, saveMealHistory, toDateStr } from "@/lib/storage";
import { getIsPremium } from "@/lib/premium";
import FreeLimitNotice from "@/app/components/FreeLimitNotice";

const FREE_MEAL_LIMIT = 3;

// ─── 判定ラベル・スタイル ────────────────────────────────
type Status = "ok" | "caution" | "ng";

const STATUS_LABEL: Record<Status, string> = {
  ok:      "良好",
  caution: "やや多め",
  ng:      "多すぎ",
};
const STATUS_BG: Record<Status, string> = {
  ok:      "bg-teal-50  text-teal-700  border-teal-200",
  caution: "bg-yellow-50 text-yellow-700 border-yellow-200",
  ng:      "bg-red-50   text-red-700   border-red-200",
};
const BAR_COLOR: Record<Status, string> = {
  ok:      "bg-teal-400",
  caution: "bg-yellow-400",
  ng:      "bg-red-400",
};
const VALUE_COLOR: Record<Status, string> = {
  ok:      "text-teal-600",
  caution: "text-yellow-600",
  ng:      "text-red-600",
};

// ─── 栄養素カード ────────────────────────────────────────
function NutrientRow({
  label,
  value,
  unit,
  max,
  status,
  thresholds,
}: {
  label: string;
  value: number;
  unit: string;
  max: number;
  status: Status;
  thresholds: [number, number]; // [ok, ng]
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${VALUE_COLOR[status]}`}>
            {value.toLocaleString()} {unit}
          </span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_BG[status]}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>
      </div>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
        <div
          className={`h-full rounded-full transition-all ${BAR_COLOR[status]}`}
          style={{ width: `${pct}%` }}
        />
        {/* 目安ライン */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gray-300"
          style={{ left: `${(thresholds[0] / max) * 100}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">
        目標 {thresholds[0].toLocaleString()}{unit}以下
        <span className="mx-1">／</span>
        上限 {thresholds[1].toLocaleString()}{unit}
      </p>
    </div>
  );
}

// ─── 結果画面本体 ────────────────────────────────────────
function ResultContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const savedRef     = useRef(false);

  const [overLimit, setOverLimit] = useState(false);

  const foodsParam = searchParams.get("foods") ?? "";
  const dateParam  = searchParams.get("date")  ?? toDateStr(new Date());

  const items: MealItem[] = foodsParam
    .split(",")
    .filter(Boolean)
    .flatMap((segment) => {
      const [id, amountStr] = segment.split(":");
      const food   = FOODS.find((f) => f.id === id);
      const amount = parseInt(amountStr ?? "100", 10);
      return food ? [{ food, amount }] : [];
    });

  const totals = items.length > 0 ? calculateTotals(items) : null;
  const result = items.length > 0 ? judgeMeal(items)      : null;
  const advice    = result ? generateAdvice(result)             : null;
  const proAdvice = result ? generateProfessionalAdvice(result) : null;

  const overallLabel = result?.overall === "ng"      ? "要注意"
                     : result?.overall === "caution" ? "注意"
                     : "良好";
  const overallStyle = result?.overall === "ng"
    ? "bg-red-50 border-red-300 text-red-700"
    : result?.overall === "caution"
      ? "bg-yellow-50 border-yellow-300 text-yellow-700"
      : "bg-teal-50 border-teal-300 text-teal-700";

  // 自動保存 + 無料制限チェック
  useEffect(() => {
    if (savedRef.current || !result || !totals || items.length === 0) return;
    savedRef.current = true;

    const history    = getMealHistory();
    const todayCount = history.filter((m) => m.date === dateParam).length;
    const isPremium  = getIsPremium();

    saveMealHistory({
      date:    dateParam,
      items:   items.map((i) => ({ name: i.food.name, foodId: i.food.id, amount: i.amount })),
      total:   totals,
      overall: result.overall,
      advice:  proAdvice ?? undefined,
    });

    if (!isPremium && todayCount >= FREE_MEAL_LIMIT) {
      setOverLimit(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-500">食品データが見つかりません</p>
        <button
          type="button"
          onClick={() => router.push("/meal")}
          className="rounded-xl bg-teal-600 px-6 py-3 text-white font-semibold"
        >
          食事選択に戻る
        </button>
      </div>
    );
  }

  if (overLimit) return <FreeLimitNotice />;

  return (
    <main className="min-h-screen bg-gray-50 pb-32">

      {/* ── ヘッダー ──────────────────────────────────────── */}
      <header className="bg-white border-b px-5 py-4 sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-md flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-2xl leading-none text-gray-500 hover:text-gray-700"
            aria-label="戻る"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">栄養評価</h1>
            <p className="text-xs text-gray-400">{new Date(dateParam).toLocaleDateString("ja-JP", { month: "long", day: "numeric" })} の記録</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-md px-4 py-5 space-y-4">

        {/* ── 選んだ食品 ────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-600 mb-2">選んだ食品</p>
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <span
                key={i}
                className="inline-flex items-center bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
              >
                {item.food.name}
              </span>
            ))}
          </div>
        </section>

        {/* ── 総合判定 ──────────────────────────────────────── */}
        {result && (
          <div className={`rounded-2xl border-2 p-5 text-center ${overallStyle}`}>
            <p className="text-sm font-semibold mb-1 opacity-70">総合判定</p>
            <p className="text-4xl font-bold tracking-wide">{overallLabel}</p>
          </div>
        )}

        {/* ── 栄養素 詳細 ───────────────────────────────────── */}
        {result && totals && (
          <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-4">
            <p className="font-bold text-gray-800">栄養素の内訳</p>

            <NutrientRow
              label="水分"
              value={totals.water}
              unit="ml"
              max={2000}
              status={totals.water <= 1500 ? "ok" : totals.water <= 2000 ? "caution" : "ng"}
              thresholds={[1500, 2000]}
            />
            <NutrientRow
              label="ナトリウム（塩分）"
              value={result.sodium.value}
              unit="mg"
              max={1050}
              status={result.sodium.status as Status}
              thresholds={[700, 1050]}
            />
            <NutrientRow
              label="カリウム"
              value={result.potassium.value}
              unit="mg"
              max={825}
              status={result.potassium.status as Status}
              thresholds={[550, 825]}
            />
            <NutrientRow
              label="リン"
              value={result.phosphorus.value}
              unit="mg"
              max={330}
              status={result.phosphorus.status as Status}
              thresholds={[220, 330]}
            />
          </section>
        )}

        {/* ── アドバイス ────────────────────────────────────── */}
        {advice && (
          <section className="bg-white rounded-2xl border shadow-sm p-4 flex gap-3 items-start">
            <span className="text-2xl flex-shrink-0 mt-0.5">💬</span>
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1">アドバイス</p>
              <p className="text-sm text-gray-700 leading-relaxed">{advice}</p>
            </div>
          </section>
        )}

        {/* ── 専門アドバイス ────────────────────────────────── */}
        {proAdvice && (
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 items-start">
            <span className="text-2xl flex-shrink-0 mt-0.5">👩‍⚕️</span>
            <div>
              <p className="text-xs font-bold text-amber-700 mb-1">看護師からのアドバイス</p>
              <p className="text-sm text-gray-700 leading-relaxed">{proAdvice}</p>
            </div>
          </section>
        )}

        {/* ── 基準値の目安 ──────────────────────────────────── */}
        <section className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <p className="text-xs font-bold text-gray-500 mb-2">1食あたりの目安（透析患者）</p>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-gray-600">
            <span>水分：1500ml以下が目標</span>
            <span>塩分：700mg以下が目標</span>
            <span>カリウム：550mg以下が目標</span>
            <span>リン：220mg以下が目標</span>
          </div>
        </section>

      </div>

      {/* ── 下部ボタン ────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 shadow-lg">
        <div className="mx-auto max-w-md flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/meal")}
            className="rounded-2xl border border-gray-300 px-5 py-3 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            食事選択
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex-1 rounded-2xl bg-teal-600 py-4 text-white text-base font-bold shadow-md hover:bg-teal-700 active:scale-[0.98] transition-all"
          >
            ホームへ戻る
          </button>
        </div>
      </div>

    </main>
  );
}

// ─── Suspense ラッパー ───────────────────────────────────
export default function ResultPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">読み込み中...</p>
      </div>
    }>
      <ResultContent />
    </Suspense>
  );
}
