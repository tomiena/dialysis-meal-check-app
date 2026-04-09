"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FOODS } from "@/lib/foods";
import { judgeMeal, calculateTotals, type MealItem } from "@/lib/judge";
import { generateAdvice, generateProfessionalAdvice } from "@/lib/advice";
import { saveMealHistory, toDateStr } from "@/lib/storage";
import NutrientCard from "@/app/components/NutrientCard";
import AdviceCard from "@/app/components/AdviceCard";

// ─── 結果画面本体 ────────────────────────────────────────────
function ResultContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [saved, setSaved] = useState(false);

  // URL params: foods=rice:100,egg:100,natto:100
  const foodsParam = searchParams.get("foods") ?? "";

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
  const advice       = result ? generateAdvice(result)             : null;
  const proAdvice    = result ? generateProfessionalAdvice(result) : null;

  // 全体判定ラベル
  const overallLabel = result?.overall === "ng"      ? "要注意"
                     : result?.overall === "caution" ? "注意"
                     : "良好";
  const overallStyle = result?.overall === "ng"      ? "bg-red-50 border-red-200 text-red-700"
                     : result?.overall === "caution" ? "bg-yellow-50 border-yellow-200 text-yellow-700"
                     : "bg-teal-50 border-teal-200 text-teal-700";

  const handleSave = () => {
    if (!result || !totals || saved) return;
    saveMealHistory({
      date:    toDateStr(new Date()),
      items:   items.map((i) => ({ name: i.food.name, foodId: i.food.id, amount: i.amount })),
      total:   totals,
      overall: result.overall,
      advice:  proAdvice ?? undefined,
    });
    setSaved(true);
    setTimeout(() => router.push("/"), 800);
  };

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

  return (
    <main className="min-h-screen bg-gray-50 pb-32">

      {/* ── ヘッダー ──────────────────────────────────────────── */}
      <header className="bg-white border-b px-5 py-4 sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-md flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-2xl leading-none text-gray-500 hover:text-gray-700"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">栄養評価</h1>
            <p className="text-xs text-gray-400">今回の食事の結果です</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-md px-4 py-5 space-y-4">

        {/* ── 選択した食品 ────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-600 mb-2">選んだ食品</p>
          <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                {item.food.name}
              </span>
            ))}
          </div>
        </section>

        {/* ── 総合判定 ────────────────────────────────────────── */}
        {result && (
          <div className={`rounded-2xl border p-4 text-center ${overallStyle}`}>
            <p className="text-sm font-semibold mb-1">総合判定</p>
            <p className="text-3xl font-bold">{overallLabel}</p>
          </div>
        )}

        {/* ── 栄養カード ──────────────────────────────────────── */}
        {result && totals && (
          <div className="grid grid-cols-2 gap-3">
            <NutrientCard
              name="水分"
              value={totals.water}
              unit="ml"
              status={totals.water <= 1500 ? "ok" : totals.water <= 2000 ? "caution" : "ng"}
              maxDisplay={2000}
            />
            <NutrientCard
              name="塩分（ナトリウム）"
              value={result.sodium.value}
              unit="mg"
              status={result.sodium.status as "ok" | "caution" | "ng"}
              maxDisplay={1050}
            />
            <NutrientCard
              name="カリウム"
              value={result.potassium.value}
              unit="mg"
              status={result.potassium.status as "ok" | "caution" | "ng"}
              maxDisplay={825}
            />
            <NutrientCard
              name="リン"
              value={result.phosphorus.value}
              unit="mg"
              status={result.phosphorus.status as "ok" | "caution" | "ng"}
              maxDisplay={330}
            />
          </div>
        )}

        {/* ── アドバイス ───────────────────────────────────────── */}
        {advice && <AdviceCard advice={advice} />}
        {proAdvice && <AdviceCard advice={proAdvice} professional />}

        {/* ── 基準値の目安 ────────────────────────────────────── */}
        <section className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <p className="text-xs font-bold text-amber-700 mb-2">1食あたりの目安（透析患者）</p>
          <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
            <span>塩分：700mg以下が目標</span>
            <span>カリウム：550mg以下が目標</span>
            <span>リン：220mg以下が目標</span>
            <span>水分：食事内含め管理</span>
          </div>
        </section>

      </div>

      {/* ── 下部固定ボタン ────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 shadow-lg">
        <div className="mx-auto max-w-md flex gap-3">
          <button
            type="button"
            onClick={() => router.push("/meal")}
            className="rounded-2xl border border-gray-300 px-4 py-3 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            戻る
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saved}
            className={`flex-1 rounded-2xl py-4 text-white text-base font-bold shadow-md transition-all ${
              saved
                ? "bg-gray-400"
                : "bg-teal-600 hover:bg-teal-700 active:scale-98"
            }`}
          >
            {saved ? "✓ 保存しました" : "保存してホームへ"}
          </button>
        </div>
      </div>

    </main>
  );
}

// ─── Suspense ラッパー（useSearchParams 必須）───────────────
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
