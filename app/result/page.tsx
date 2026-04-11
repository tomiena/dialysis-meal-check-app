"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FOODS } from "@/lib/foods";
import { judgeMeal, calculateTotals, type MealItem } from "@/lib/judge";
import { generateDetailedAdvice } from "@/lib/advice";
import { toDateStr } from "@/lib/storage";

// ─── 判定スタイル ─────────────────────────────────────────
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
const OVERALL_STYLE: Record<Status, string> = {
  ok:      "bg-teal-50   border-teal-300   text-teal-800",
  caution: "bg-yellow-50 border-yellow-300 text-yellow-800",
  ng:      "bg-red-50    border-red-300    text-red-800",
};
const OVERALL_LABEL: Record<Status, string> = {
  ok:      "よいバランスです",
  caution: "少し調整できると安心です",
  ng:      "気をつけたい内容です",
};

// ─── 栄養素バー ───────────────────────────────────────────
function NutrientRow({
  label, value, unit, max, status, thresholds,
}: {
  label: string;
  value: number;
  unit: string;
  max: number;
  status: Status;
  thresholds: [number, number];
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
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-gray-300"
          style={{ left: `${(thresholds[0] / max) * 100}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">
        目標 {thresholds[0].toLocaleString()}{unit}以下
        <span className="mx-1">/</span>
        上限 {thresholds[1].toLocaleString()}{unit}
      </p>
    </div>
  );
}

// ─── 日付フォーマット ─────────────────────────────────────
function localDateLabel(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("ja-JP", {
    month: "long", day: "numeric",
  });
}

// ─── 結果画面本体 ─────────────────────────────────────────
function ResultContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const foodsParam   = decodeURIComponent(searchParams.get("foods")   ?? "");
  const dateParam    =                    searchParams.get("date")    ?? toDateStr(new Date());
  const unknownParam = decodeURIComponent(searchParams.get("unknown") ?? "");
  const unknownFoods = unknownParam.split(",").filter(Boolean);

  const items: MealItem[] = foodsParam
    .split(",")
    .filter(Boolean)
    .flatMap((segment) => {
      const [id, amountStr] = segment.split(":");
      const food   = FOODS.find((f) => f.id === id);
      const amount = parseInt(amountStr ?? "100", 10);
      return food ? [{ food, amount }] : [];
    });

  const totals         = items.length > 0 ? calculateTotals(items) : null;
  const result         = items.length > 0 ? judgeMeal(items)        : null;
  const detailedAdvice = result ? generateDetailedAdvice(result, items) : null;

  const overall = result?.overall ?? "ok";

  if (items.length === 0 && unknownFoods.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-gray-500">食品データが見つかりません</p>
        <button type="button" onClick={() => router.push("/meal")}
          className="rounded-xl bg-teal-600 px-6 py-3 text-white font-semibold">
          食事選択に戻る
        </button>
      </div>
    );
  }

  const hasNutrientComments = detailedAdvice
    ? Object.values(detailedAdvice.nutrients).some(Boolean)
    : false;
  const hasAdviceContent = hasNutrientComments
    || (detailedAdvice?.combinations.length ?? 0) > 0
    || (detailedAdvice?.nextSteps.length    ?? 0) > 0;

  return (
    <main className="min-h-screen bg-gray-50 pb-32">

      {/* ── ヘッダー ──────────────────────────────────────── */}
      <header className="bg-white border-b px-5 py-4 sticky top-0 z-10 shadow-sm">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-xl font-bold text-gray-800">栄養評価</h1>
          <p className="text-sm text-gray-500">{localDateLabel(dateParam)} の記録</p>
        </div>
      </header>

      <div className="mx-auto max-w-md px-4 py-5 space-y-4">

        {/* ── 選んだ食品 ──────────────────────────────────── */}
        <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-2">
          {items.length > 0 && (
            <>
              <p className="text-sm font-semibold text-gray-600">選んだ食品</p>
              <div className="flex flex-wrap gap-2">
                {items.map((item, i) => (
                  <span key={i} className="inline-flex items-center bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                    {item.food.name}
                    {item.amount !== 100 && (
                      <span className="ml-1 text-gray-400 text-xs">{item.amount}g</span>
                    )}
                  </span>
                ))}
              </div>
            </>
          )}

          {unknownFoods.length > 0 && (
            <div className={items.length > 0 ? "pt-2 border-t" : ""}>
              <p className="text-xs font-semibold text-gray-400 mb-1.5">
                未登録の食品（栄養計算に含まれていません）
              </p>
              <div className="flex flex-wrap gap-1.5">
                {unknownFoods.map((u) => (
                  <span key={u} className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                    {u}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* ── 総合評価 ────────────────────────────────────── */}
        {result && detailedAdvice && (
          <div className={`rounded-2xl border-2 p-5 ${OVERALL_STYLE[overall as Status]}`}>
            <p className="text-xs font-semibold mb-1 opacity-60">総合評価</p>
            <p className="text-xl font-bold mb-2">{OVERALL_LABEL[overall as Status]}</p>
            <p className="text-sm leading-relaxed">{detailedAdvice.summary}</p>
          </div>
        )}

        {/* ── 栄養素の内訳 ─────────────────────────────────── */}
        {result && totals && (
          <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-4">
            <p className="font-bold text-gray-800">栄養素の内訳</p>
            <NutrientRow
              label="水分"
              value={totals.water}
              unit="ml"
              max={2000}
              status={result.water.status as Status}
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

        {/* ── コメント・次の一歩 ────────────────────────────── */}
        {detailedAdvice && hasAdviceContent && (
          <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-5">
            <p className="font-bold text-gray-800">詳しいコメント</p>

            {/* 栄養素ごとのコメント */}
            {hasNutrientComments && (
              <div className="space-y-4">
                {detailedAdvice.nutrients.sodium && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500">塩分について</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{detailedAdvice.nutrients.sodium}</p>
                  </div>
                )}
                {detailedAdvice.nutrients.potassium && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500">カリウムについて</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{detailedAdvice.nutrients.potassium}</p>
                  </div>
                )}
                {detailedAdvice.nutrients.phosphorus && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500">リンについて</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{detailedAdvice.nutrients.phosphorus}</p>
                  </div>
                )}
                {detailedAdvice.nutrients.water && (
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500">水分について</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{detailedAdvice.nutrients.water}</p>
                  </div>
                )}
              </div>
            )}

            {/* 組み合わせに注意 */}
            {detailedAdvice.combinations.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 space-y-2">
                <p className="text-xs font-bold text-amber-700">この食事の組み合わせについて</p>
                {detailedAdvice.combinations.map((c, i) => (
                  <p key={i} className="text-sm text-gray-700 leading-relaxed">{c}</p>
                ))}
              </div>
            )}

            {/* 次の一歩 */}
            {detailedAdvice.nextSteps.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-teal-700">次の食事での一歩</p>
                <ul className="space-y-2">
                  {detailedAdvice.nextSteps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700 leading-relaxed">
                      <span className="text-teal-400 flex-shrink-0 mt-0.5">-</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* ── 食事量が少ない場合の注意 ─────────────────────── */}
        {detailedAdvice?.lowIntakeNote && (
          <section className="bg-blue-50 border border-blue-200 rounded-2xl p-4 space-y-1">
            <p className="text-xs font-bold text-blue-700">食事量について</p>
            <p className="text-sm text-gray-700 leading-relaxed">{detailedAdvice.lowIntakeNote}</p>
          </section>
        )}

        {/* ── 基準値の目安 + 免責 ──────────────────────────── */}
        <section className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3">
          <p className="text-xs font-bold text-gray-500">1食あたりの目安（透析患者）</p>
          <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs text-gray-600">
            <span>水分：1500ml以下が目標</span>
            <span>塩分：700mg以下が目標</span>
            <span>カリウム：550mg以下が目標</span>
            <span>リン：220mg以下が目標</span>
          </div>
          {detailedAdvice && (
            <p className="text-xs text-gray-400 border-t border-gray-200 pt-3">
              {detailedAdvice.disclaimer}
            </p>
          )}
        </section>

      </div>

      {/* ── 下部ボタン ────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 shadow-lg">
        <div className="mx-auto max-w-md">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="w-full rounded-2xl bg-teal-600 py-4 text-white text-base font-bold shadow-md hover:bg-teal-700 active:scale-[0.98] transition-all"
          >
            食事選択へ戻る
          </button>
        </div>
      </div>

    </main>
  );
}

// ─── Suspense ラッパー ────────────────────────────────────
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
