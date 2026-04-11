"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FOODS, type Food, type FoodCategory, type Portion } from "@/lib/foods";
import { getMealHistory, toDateStr } from "@/lib/storage";
import { getIsPremium } from "@/lib/premium";
import FoodCard from "@/app/components/FoodCard";
import FreeLimitNotice from "@/app/components/FreeLimitNotice";

const FREE_MEAL_LIMIT = 3;

// ─── カテゴリ ──────────────────────────────────────────────
type CategoryId = FoodCategory | "all" | "meat_fish";
type Mode = "select" | "free";

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
  ok: "bg-teal-400", caution: "bg-yellow-400", ng: "bg-red-400",
};

function formatDateJP(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("ja-JP", {
    month: "long", day: "numeric", weekday: "short",
  });
}

// ─── 自由入力 別名辞書（token → food id） ───────────────
// 名前ベースの照合に頼らず ID を直接引くことで確実に認識させる
const FOOD_ALIASES: Record<string, string> = {
  // 主食
  "ご飯": "rice",        "白飯": "rice",        "ライス": "rice",
  "パスタ": "pasta",     "スパゲティ": "spaghetti",
  "うどん": "udon",      "そば": "soba",
  // お茶・飲み物
  "お茶": "green_tea",   "緑茶": "green_tea",   "煎茶": "green_tea",
  "麦茶": "barley_tea",  "ほうじ茶": "barley_tea",
  "ウーロン茶": "oolong_tea",
  "コーヒー": "coffee",  "紅茶": "black_tea",
  "牛乳": "milk",        "コーラ": "cola",
  // 野菜・果物
  "トマト": "tomato",    "レタス": "lettuce",   "きゅうり": "cucumber",
  "キャベツ": "cabbage", "白菜": "napa_cabbage","ほうれん草": "spinach",
  "ブロッコリー": "broccoli", "大根": "daikon", "にんじん": "carrot",
  "玉ねぎ": "onion",     "なす": "eggplant",    "もやし": "bean_sprouts",
  "じゃがいも": "potato","さつまいも": "sweet_potato",
  // 肉・魚
  "牛肉": "beef",        "豚肉": "pork",        "鶏肉": "chicken_thigh",
  "鶏胸肉": "chicken_breast", "えび": "shrimp", "いか": "squid",
  "サーモン": "salmon",  "まぐろ": "tuna",      "さば": "mackerel",
  // 卵・大豆
  "卵": "egg",           "たまご": "egg",       "豆腐": "tofu",
  "納豆": "natto",       "枝豆": "edamame",
  // 調理済み（exact name があっても明示して確実認識）
  "コロッケ": "croquette",
  "エビフライ": "fried_shrimp",
  "カレーライス": "curry_rice",   "カレー": "curry_rice",
  "ポテトサラダ": "potato_salad",
  "野菜スープ": "vegetable_soup",
  "おでん": "oden",
  "ラーメン": "ramen",
  "チャーハン": "fried_rice",
  "から揚げ": "karaage", "唐揚げ": "karaage",  "鶏の唐揚げ": "karaage",
  "とんかつ": "tonkatsu","ハンバーグ": "hamburger_steak",
  "餃子": "gyoza",       "天ぷら": "tempura",   "春巻き": "spring_roll",
  "焼きそば": "yakisoba","オムライス": "omurice","サラダ": "salad",
  "サンドイッチ": "sandwich", "お弁当": "bento","ピザ": "pizza",
  "寿司": "sushi",       "焼き魚": "grilled_fish",
  // 汁物
  "みそ汁": "miso_soup", "味噌汁": "miso_soup", "とん汁": "tonjiru",
  "豚汁": "tonjiru",     "すまし汁": "clear_soup",
};

// ─── 自由入力パーサー ────────────────────────────────────
function parseFreeInput(text: string): { matched: Food[]; unknown: string[] } {
  const tokens = text
    .split(/[,、，\s]+/)   // スペース区切りも許容
    .map((s) => s.trim())
    .filter(Boolean);

  const matched: Food[] = [];
  const unknown: string[] = [];

  for (const token of tokens) {
    // 1. 別名辞書でIDを直接引く（最優先・確実）
    const aliasId = FOOD_ALIASES[token];
    const food =
      (aliasId ? FOODS.find((f) => f.id === aliasId) : undefined) ??
      // 2. 食品名との完全一致
      FOODS.find((f) => f.name === token) ??
      // 3. 食品名がトークンを含む（部分一致）
      FOODS.find((f) => f.name.includes(token));

    if (food && !matched.find((m) => m.id === food.id)) {
      matched.push(food);
    } else if (!food && !unknown.includes(token)) {
      unknown.push(token);
    }
  }
  return { matched, unknown };
}

// ─── メインコンポーネント ────────────────────────────────
export default function MealPage() {
  const router = useRouter();
  const today  = toDateStr(new Date());

  // ── 状態 ──────────────────────────────────────────────
  const [mode, setMode]               = useState<Mode>("select");
  const [selectedDate, setSelectedDate] = useState(today);
  const [calYear,  setCalYear]  = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth() + 1);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [portionMap, setPortionMap] = useState<Map<string, number>>(new Map());
  const [modalFood, setModalFood] = useState<Food | null>(null);
  const [freeText, setFreeText] = useState("");
  const [showFreeLimit, setShowFreeLimit] = useState(false);

  // URLパラムからモード初期化（?mode=free）
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("mode") === "free") setMode("free");
  }, []);

  // 過去記録（カレンダードット用）
  const history = getMealHistory();

  function dayStatus(dateStr: string) {
    const meals = history.filter((m) => m.date === dateStr);
    if (meals.length === 0) return "none";
    return meals.some((m) => m.overall === "ng") ? "ng"
      : meals.some((m) => m.overall === "caution") ? "caution"
      : "ok";
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

  // ── 食材選択モード ─────────────────────────────────────
  const displayFoods = activeCategory === "all"
    ? FOODS
    : activeCategory === "meat_fish"
      ? FOODS.filter((f) => f.category === "meat" || f.category === "fish")
      : FOODS.filter((f) => f.category === activeCategory);

  function getDefaultPortions(food: Food): Portion[] {
    if (food.portions && food.portions.length > 0) return food.portions;
    if (food.category === "drink") {
      return [
        { label: "少量(100ml)", amountG: 100 },
        { label: "コップ1杯(200ml)", amountG: 200 },
        { label: "多め(350ml)", amountG: 350 },
      ];
    }
    if (food.category === "soup") {
      return [
        { label: "少しだけ(50ml)", amountG: 50 },
        { label: "半分(80ml)", amountG: 80 },
        { label: "全部飲んだ(150ml)", amountG: 150 },
      ];
    }
    return [
      { label: "少なめ(70g)", amountG: 70 },
      { label: "普通(100g)", amountG: 100 },
      { label: "多め(150g)", amountG: 150 },
    ];
  }

  const openModal = (food: Food) => setModalFood(food);

  const selectPortion = (food: Food, amountG: number) => {
    setPortionMap((prev) => {
      const next = new Map(prev);
      if (next.get(food.id) === amountG) {
        next.delete(food.id);
      } else {
        next.set(food.id, amountG);
      }
      return next;
    });
    setModalFood(null);
  };

  const handleSaveSelect = () => {
    if (portionMap.size === 0) return;
    const isPremium = getIsPremium();
    const dayCount  = history.filter((m) => m.date === selectedDate).length;
    if (!isPremium && dayCount >= FREE_MEAL_LIMIT) { setShowFreeLimit(true); return; }
    const params = Array.from(portionMap.entries()).map(([id, amt]) => `${id}:${amt}`).join(",");
    router.push(`/result?foods=${params}&date=${selectedDate}`);
  };

  // ── 自由入力モード ─────────────────────────────────────
  const parsedTokens = useMemo(() => parseFreeInput(freeText), [freeText]);

  const handleSaveFree = () => {
    // parsedTokens (useMemo) may be stale on fast submit; recompute fresh
    const { matched, unknown } = parseFreeInput(freeText);
    if (matched.length === 0 && unknown.length === 0) return;
    const isPremium = getIsPremium();
    const dayCount  = history.filter((m) => m.date === selectedDate).length;
    if (!isPremium && dayCount >= FREE_MEAL_LIMIT) { setShowFreeLimit(true); return; }

    // Food IDs are ASCII alphanumeric+underscore; amounts are numbers.
    // `:` and `,` are valid query-string characters — skip encodeURIComponent
    // so the result page can split(",") and split(":") on literal chars.
    const foodsParam = matched.map((f) => `${f.id}:100`).join(",");
    let pushUrl = `/result?date=${selectedDate}`;
    if (foodsParam)         pushUrl += `&foods=${foodsParam}`;
    if (unknown.length > 0) pushUrl += `&unknown=${unknown.join(",")}`;
    router.push(pushUrl);
  };

  // ── 制限画面 ───────────────────────────────────────────
  if (showFreeLimit) return <FreeLimitNotice />;

  // ─────────────────────────────────────────────────────
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
            <button type="button" onClick={prevMonth} aria-label="前の月"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl">
              ‹
            </button>
            <p className="font-bold text-gray-700">{calYear}年{calMonth}月</p>
            <button type="button" onClick={nextMonth} aria-label="次の月"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl">
              ›
            </button>
          </div>

          {/* 曜日 */}
          <div className="grid grid-cols-7 text-center">
            {WEEKDAYS.map((d, i) => (
              <span key={d} className={`text-xs font-semibold pb-1 ${
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
              }`}>{d}</span>
            ))}
          </div>

          {/* 日付グリッド */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`b-${idx}`} className="h-10" />;
              const dateStr  = `${calYear}-${String(calMonth).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
              const st       = dayStatus(dateStr);
              const isToday    = dateStr === today;
              const isSelected = dateStr === selectedDate;
              const colIdx  = idx % 7;
              return (
                <button key={dateStr} type="button" onClick={() => setSelectedDate(dateStr)}
                  className={`flex flex-col items-center justify-center h-10 rounded-xl transition-colors ${
                    isSelected ? "bg-teal-500" : isToday ? "bg-teal-50 ring-2 ring-teal-400" : "hover:bg-gray-50"
                  }`}>
                  <span className={`text-xs font-semibold ${
                    isSelected ? "text-white"
                      : colIdx === 0 ? "text-red-400"
                      : colIdx === 6 ? "text-blue-400"
                      : "text-gray-700"
                  }`}>{day}</span>
                  {st !== "none" && (
                    <div className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? "bg-white" : DOT[st]}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* 凡例 */}
          <div className="flex gap-4 justify-center text-xs text-gray-400 pt-1">
            {[{ color:"bg-teal-400",label:"良好"},{ color:"bg-yellow-400",label:"注意"},{ color:"bg-red-400",label:"多すぎ"}].map(({color,label}) => (
              <span key={label} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${color}`}/>{label}
              </span>
            ))}
          </div>
        </section>

        {/* ── モード切り替えタブ ───────────────────────────── */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setMode("select")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              mode === "select"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white border border-teal-500 text-teal-600"
            }`}
          >
            食材を選ぶ
          </button>
          <button
            type="button"
            onClick={() => setMode("free")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              mode === "free"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white border border-teal-500 text-teal-600"
            }`}
          >
            自由入力する
          </button>
        </div>

        {/* ── 自由入力フォーム ─────────────────────────────── */}
        {mode === "free" && (
          <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
            <p className="text-sm font-bold text-gray-700">食べたものを入力してください</p>
            <p className="text-xs text-gray-400">カンマ・読点で区切ると複数入力できます</p>
            <p className="text-xs text-teal-600">「食材を選ぶ」タブからも食品を選べます</p>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder={"例：ラーメン、チャーハン、烏龍茶"}
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-teal-300"
            />

            {/* 認識できた食品 */}
            {parsedTokens.matched.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-teal-600">認識できた食品（栄養計算に反映）</p>
                <div className="flex flex-wrap gap-1.5">
                  {parsedTokens.matched.map((f) => (
                    <span key={f.id} className="text-xs bg-teal-50 border border-teal-200 text-teal-700 font-semibold px-3 py-1 rounded-full">
                      {f.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 未登録食品 */}
            {parsedTokens.unknown.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-gray-400">未登録の食品（結果画面に表示のみ）</p>
                <div className="flex flex-wrap gap-1.5">
                  {parsedTokens.unknown.map((u) => (
                    <span key={u} className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* select モードのセクションヘッダー */}
        {mode === "select" && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-base font-bold text-gray-800">食材を選ぶ</span>
            {portionMap.size > 0 && (
              <span className="text-xs bg-teal-100 text-teal-700 font-bold rounded-full px-2 py-0.5">
                {portionMap.size}品選択中
              </span>
            )}
          </div>
        )}

      </div>

      {/* ── カテゴリタブ（select モードのみ sticky）──────────── */}
      {mode === "select" && (
        <div className="sticky top-[57px] z-10 bg-white border-b mt-2">
          <div className="mx-auto max-w-md overflow-x-auto flex gap-2 px-4 py-2">
            {CATEGORIES.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => setActiveCategory(id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  activeCategory === id ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 食品グリッド（select モードのみ）────────────────── */}
      {mode === "select" && (
        <div className="mx-auto max-w-md px-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            {displayFoods.map((food) => (
              <FoodCard key={food.id} food={food}
                selected={portionMap.has(food.id)} onToggle={() => openModal(food)} />
            ))}
          </div>
        </div>
      )}

      {/* ── 分量選択モーダル ─────────────────────────────── */}
      {modalFood && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={() => setModalFood(null)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 食品名 */}
            <div className="flex items-center gap-3 mb-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={modalFood.image}
                alt={modalFood.name}
                className="w-14 h-14 object-cover rounded-xl border border-gray-100"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
              <div>
                <p className="font-bold text-gray-800 text-base">{modalFood.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">分量を選んでください</p>
              </div>
            </div>

            {/* 分量ボタン */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {getDefaultPortions(modalFood).map((portion) => (
                <button
                  key={portion.label}
                  type="button"
                  onClick={() => selectPortion(modalFood, portion.amountG)}
                  className="flex flex-col items-center justify-center py-3 px-2 rounded-2xl border-2 border-teal-200 bg-teal-50 hover:bg-teal-100 active:scale-95 transition-all"
                >
                  <span className="text-sm font-bold text-teal-700">{portion.label}</span>
                </button>
              ))}
            </div>

            {/* キャンセル */}
            <button
              type="button"
              onClick={() => setModalFood(null)}
              className="w-full py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {/* ── 下部固定ボタン ───────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-4 shadow-lg z-20">
        <div className="mx-auto max-w-md">

          {mode === "select" ? (
            portionMap.size > 0 ? (
              <button type="button" onClick={handleSaveSelect}
                className="w-full rounded-2xl bg-teal-600 py-4 text-white text-lg font-bold shadow-md hover:bg-teal-700 active:scale-[0.98] transition-all">
                {portionMap.size}品を選択 → 保存する
              </button>
            ) : (
              <p className="text-center text-gray-400 text-sm py-3">食品をタップして選んでください</p>
            )
          ) : (
            <button type="button" onClick={handleSaveFree}
              disabled={parsedTokens.matched.length === 0 && parsedTokens.unknown.length === 0}
              className="w-full rounded-2xl bg-teal-600 py-4 text-white text-lg font-bold shadow-md hover:bg-teal-700 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              保存する
            </button>
          )}

        </div>
      </div>

    </main>
  );
}
