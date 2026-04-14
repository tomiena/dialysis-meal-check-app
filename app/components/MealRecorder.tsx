"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FOODS, type Food, type FoodCategory, type Portion } from "@/lib/foods";
import { getMealHistory, saveMealHistory, toDateStr } from "@/lib/storage";
import { judgeMeal, calculateTotals, type MealItem } from "@/lib/judge";
import { generateDetailedAdvice } from "@/lib/advice";
import { getIsPremium } from "@/lib/premium";
import FoodCard from "@/app/components/FoodCard";
import FreeLimitNotice from "@/app/components/FreeLimitNotice";

const FREE_MEAL_LIMIT = 3;

// ─── カテゴリ ─────────────────────────────────────────────
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

// ─── カレンダー ───────────────────────────────────────────
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

// ─── 別名辞書 ─────────────────────────────────────────────
const FOOD_ALIASES: Record<string, string> = {
  "ご飯": "rice",        "白飯": "rice",        "ライス": "rice",
  "パスタ": "pasta",     "スパゲティ": "spaghetti",
  "うどん": "udon",      "そば": "soba",
  "お茶": "green_tea",   "緑茶": "green_tea",   "煎茶": "green_tea",
  "麦茶": "barley_tea",  "ほうじ茶": "barley_tea",
  "ウーロン茶": "oolong_tea",
  "コーヒー": "coffee",  "紅茶": "black_tea",
  "牛乳": "milk",        "コーラ": "cola",
  "トマト": "tomato",    "レタス": "lettuce",   "きゅうり": "cucumber",
  "キャベツ": "cabbage", "白菜": "napa_cabbage","ほうれん草": "spinach",
  "ブロッコリー": "broccoli", "大根": "daikon", "にんじん": "carrot",
  "玉ねぎ": "onion",     "なす": "eggplant",    "もやし": "bean_sprouts",
  "じゃがいも": "potato","さつまいも": "sweet_potato",
  "牛肉": "beef",        "豚肉": "pork",        "鶏肉": "chicken_thigh",
  "鶏胸肉": "chicken_breast", "えび": "shrimp", "いか": "squid",
  "サーモン": "salmon",  "まぐろ": "tuna",      "さば": "mackerel",
  "卵": "egg",           "たまご": "egg",       "豆腐": "tofu",
  "納豆": "natto",       "枝豆": "edamame",
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
  "みそ汁": "miso_soup", "味噌汁": "miso_soup", "とん汁": "tonjiru",
  "豚汁": "tonjiru",     "すまし汁": "clear_soup",
  "低脂肪乳": "low_fat_milk", "豆乳": "soy_milk",   "飲むヨーグルト": "drinking_yogurt",
  "スポーツドリンク": "sports_drink",              "炭酸水": "sparkling_water",
  "レモン水": "lemon_water",  "乳酸菌飲料": "lactic_drink", "ヤクルト": "lactic_drink",
  "ミルクティー": "milk_tea", "缶コーヒー": "canned_coffee","野菜スムージー": "veggie_smoothie",
  "スムージー": "veggie_smoothie",
  "鶏ささみ": "chicken_sasami", "ささみ": "chicken_sasami",
  "手羽先": "chicken_wing_tip", "手羽元": "chicken_wing_root",
  "鶏ひき肉": "ground_chicken",
  "豚こま": "pork_thin",        "豚バラ": "pork_belly",   "豚ロース": "pork_loin",
  "牛こま": "beef_thin",        "牛薄切り": "beef_sliced", "合いびき": "mixed_ground",
  "合いびき肉": "mixed_ground", "ベーコン": "bacon",       "ソーセージ": "sausage",
  "つくね": "tsukune",
  "焼き鮭": "grilled_salmon",  "塩鮭": "salted_salmon",  "塩さけ": "salted_salmon",
  "焼きさば": "grilled_mackerel",
  "あじ": "aji",               "ぶり": "buri",            "たら": "tara",
  "さんま": "sanma",           "ししゃも": "shishamo",    "しらす": "shirasu",
  "ツナ缶": "tuna_can",        "ツナ": "tuna_can",        "さば缶": "mackerel_can",
  "いわし缶": "sardine_can",   "たこ": "tako",
  "厚揚げ": "atsuage",         "きのこ": "mushroom",      "しめじ": "mushroom",
  "えのき": "mushroom",        "わかめ": "wakame",
  "減塩醤油": "reduced_salt_soy", "ポン酢": "ponzu",     "ソース": "worcester_sauce",
  "めんつゆ": "mentsuyu",
  "親子丼": "oyako_don", "牛丼": "gyudon",     "カツ丼": "katsudon",
  "天丼": "tendon",      "中華丼": "chuka_don", "そぼろ丼": "soboro_don",
  "海鮮丼": "kaisen_don",
  "おかゆ": "okayu",     "お粥": "okayu",       "雑炊": "zosui",
  "炊き込みご飯": "takikomi_gohan",              "ちらし寿司": "chirashi_sushi",
  "ちらし": "chirashi_sushi",                    "巻き寿司": "maki_sushi",
  "巻き寿": "maki_sushi",
  "照り焼きチキン": "teriyaki_chicken",          "照り焼き": "teriyaki_chicken",
  "焼き鳥": "yakitori",  "やきとり": "yakitori", "鶏の塩焼き": "shio_yaki_chicken",
  "塩焼き": "shio_yaki_chicken",                 "チキン南蛮": "chicken_nanban",
  "蒸し鶏": "mushi_chicken",                     "チキンカツ": "chicken_katsu",
  "親子煮": "oyako_ni",
  "ゆで卵": "boiled_egg",  "茹で卵": "boiled_egg",  "だし巻き卵": "dashi_maki_egg",
  "だし巻き": "dashi_maki_egg",                  "スクランブルエッグ": "scrambled_egg",
  "茶碗蒸し": "chawanmushi",                     "オムレツ": "omelet",
  "たくあん": "takuan",    "しば漬け": "shibazuke", "きゅうり漬け": "kyuri_tsuke",
  "白菜漬け": "hakusai_tsuke",                   "野沢菜": "nozawana",
  "梅干し": "umeboshi",    "キムチ": "kimchi",      "福神漬け": "fukujinzuke",
  "プリン": "pudding",     "ゼリー": "jelly",       "アイスクリーム": "ice_cream",
  "アイス": "ice_cream",   "シャーベット": "sherbet","カステラ": "castella",
  "どら焼き": "dorayaki",  "まんじゅう": "manju",   "ショートケーキ": "shortcake",
  "ケーキ": "shortcake",
};

// ─── 自由入力パーサー ─────────────────────────────────────
function parseFreeInput(text: string): { matched: Food[]; unknown: string[] } {
  const tokens = text.split(/[,、，\s]+/).map((s) => s.trim()).filter(Boolean);
  const matched: Food[] = [];
  const unknown: string[] = [];
  for (const token of tokens) {
    const aliasId = FOOD_ALIASES[token];
    const food =
      (aliasId ? FOODS.find((f) => f.id === aliasId) : undefined) ??
      FOODS.find((f) => f.name === token) ??
      FOODS.find((f) => f.name.includes(token));
    if (food && !matched.find((m) => m.id === food.id)) {
      matched.push(food);
    } else if (!food && !unknown.includes(token)) {
      unknown.push(token);
    }
  }
  return { matched, unknown };
}

// ─── MealRecorder コンポーネント ──────────────────────────
export default function MealRecorder({ stickyOffset = 57 }: { stickyOffset?: number }) {
  const router = useRouter();
  const today  = toDateStr(new Date());

  const [mode, setMode]               = useState<Mode>("select");
  const [selectedDate, setSelectedDate] = useState(today);
  const [calYear,  setCalYear]  = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth() + 1);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [portionMap, setPortionMap] = useState<Map<string, number>>(new Map());
  const [modalFood, setModalFood] = useState<Food | null>(null);
  const [freeText, setFreeText] = useState("");
  const [showFreeLimit, setShowFreeLimit] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("mode") === "free") setMode("free");
  }, []);

  const history = getMealHistory();

  function dayStatus(dateStr: string) {
    const meals = history.filter((m) => m.date === dateStr);
    if (meals.length === 0) return "none";
    return meals.some((m) => m.overall === "ng") ? "ng"
      : meals.some((m) => m.overall === "caution") ? "caution"
      : "ok";
  }

  const handleBackToToday = () => {
    const t = new Date();
    setCalYear(t.getFullYear());
    setCalMonth(t.getMonth() + 1);
    setSelectedDate(today);
  };

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
      next.get(food.id) === amountG ? next.delete(food.id) : next.set(food.id, amountG);
      return next;
    });
    setModalFood(null);
  };

  const handleSaveSelect = () => {
    if (portionMap.size === 0) return;
    const isPremium = getIsPremium();
    const dayCount  = history.filter((m) => m.date === selectedDate).length;
    if (!isPremium && dayCount >= FREE_MEAL_LIMIT) { setShowFreeLimit(true); return; }

    // 保存はナビゲーション前に1回だけ行う
    const mealItems: MealItem[] = Array.from(portionMap.entries()).flatMap(([id, amount]) => {
      const food = FOODS.find((f) => f.id === id);
      return food ? [{ food, amount }] : [];
    });
    if (mealItems.length > 0) {
      const totals = calculateTotals(mealItems);
      const judged = judgeMeal(mealItems);
      const advice = generateDetailedAdvice(judged, mealItems);
      saveMealHistory({
        date:    selectedDate,
        items:   mealItems.map((i) => ({ name: i.food.name, foodId: i.food.id, amount: i.amount })),
        total:   totals,
        overall: judged.overall,
        advice:  advice.summary,
      });
    }

    const params = Array.from(portionMap.entries()).map(([id, amt]) => `${id}:${amt}`).join(",");
    router.push(`/result?foods=${params}&date=${selectedDate}`);
  };

  const parsedTokens = useMemo(() => parseFreeInput(freeText), [freeText]);

  const handleSaveFree = () => {
    const { matched, unknown } = parseFreeInput(freeText);
    if (matched.length === 0 && unknown.length === 0) return;
    const isPremium = getIsPremium();
    const dayCount  = history.filter((m) => m.date === selectedDate).length;
    if (!isPremium && dayCount >= FREE_MEAL_LIMIT) { setShowFreeLimit(true); return; }

    // 保存はナビゲーション前に1回だけ行う（マッチした食品がある場合のみ）
    if (matched.length > 0) {
      const mealItems: MealItem[] = matched.map((f) => ({ food: f, amount: 100 }));
      const totals = calculateTotals(mealItems);
      const judged = judgeMeal(mealItems);
      const advice = generateDetailedAdvice(judged, mealItems);
      saveMealHistory({
        date:    selectedDate,
        items:   [
          ...mealItems.map((i) => ({ name: i.food.name, foodId: i.food.id, amount: i.amount })),
          ...unknown.map((u) => ({ name: u })),
        ],
        total:   totals,
        overall: judged.overall,
        advice:  advice.summary,
      });
    }

    const foodsParam = matched.map((f) => `${f.id}:100`).join(",");
    let pushUrl = `/result?date=${selectedDate}`;
    if (foodsParam)         pushUrl += `&foods=${foodsParam}`;
    if (unknown.length > 0) pushUrl += `&unknown=${unknown.join(",")}`;
    router.push(pushUrl);
  };

  if (showFreeLimit) return <FreeLimitNotice />;

  return (
    <div className="pb-32">

      <div className="mx-auto max-w-md px-4 pt-4 space-y-4">

        {/* ── カレンダー ────────────────────────────────────── */}
        <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-bold text-gray-800 text-sm">記録する日を選ぶ</p>
            <span className="text-xs text-teal-600 font-semibold bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
              {formatDateJP(selectedDate)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <button type="button" onClick={prevMonth} aria-label="前の月"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl">
              ‹
            </button>
            <p className="font-bold text-gray-700">{calYear}年{calMonth}月</p>
            <div className="flex items-center gap-1">
              {(calYear !== new Date().getFullYear() || calMonth !== new Date().getMonth() + 1) && (
                <button type="button" onClick={handleBackToToday}
                  className="rounded-full border border-teal-400 px-3 py-0.5 text-xs text-teal-600 bg-white hover:bg-teal-50">
                  当日表示
                </button>
              )}
              <button type="button" onClick={nextMonth} aria-label="次の月"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 text-xl">
                ›
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center">
            {WEEKDAYS.map((d, i) => (
              <span key={d} className={`text-xs font-semibold pb-1 ${
                i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
              }`}>{d}</span>
            ))}
          </div>
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
          <div className="flex gap-4 justify-center text-xs text-gray-400 pt-1">
            {[{ color:"bg-teal-400",label:"良好"},{ color:"bg-yellow-400",label:"注意"},{ color:"bg-red-400",label:"多すぎ"}].map(({color,label}) => (
              <span key={label} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${color}`}/>{label}
              </span>
            ))}
          </div>
        </section>

        {/* ── モード切り替えタブ ──────────────────────────────── */}
        <div className="flex gap-1 p-1 bg-gray-100 rounded-xl">
          <button type="button" onClick={() => setMode("select")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              mode === "select" ? "bg-teal-600 text-white shadow-sm" : "bg-white border border-teal-500 text-teal-600"
            }`}>
            食材を選ぶ
          </button>
          <button type="button" onClick={() => setMode("free")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              mode === "free" ? "bg-teal-600 text-white shadow-sm" : "bg-white border border-teal-500 text-teal-600"
            }`}>
            自由入力する
          </button>
        </div>

        {/* ── 自由入力フォーム ──────────────────────────────── */}
        {mode === "free" && (
          <section className="bg-white rounded-2xl border shadow-sm p-4 space-y-3">
            <p className="text-sm font-bold text-gray-700">食べたものを入力してください</p>
            <p className="text-xs text-gray-400">カンマ・読点で区切ると複数入力できます</p>
            <p className="text-xs text-teal-600">「食材を選ぶ」タブからも食品を選べます</p>
            <textarea
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              placeholder="例：ラーメン、チャーハン、烏龍茶"
              rows={3}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-teal-300"
            />
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

        {/* ── 選択中食材チップ一覧 ──────────────────────────── */}
        {mode === "select" && portionMap.size > 0 && (
          <div className="flex flex-wrap gap-2 px-1">
            {Array.from(portionMap.entries()).map(([id, amount]) => {
              const food = FOODS.find((f) => f.id === id);
              if (!food) return null;
              const unit = food.category === "drink" || food.category === "soup" ? "ml" : "g";
              return (
                <span key={id} className="flex items-center gap-1 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold rounded-full px-3 py-1">
                  {food.name} {amount}{unit}
                  <button
                    type="button"
                    onClick={() => setPortionMap((prev) => { const next = new Map(prev); next.delete(id); return next; })}
                    className="ml-1 text-teal-400 hover:text-red-500 font-bold leading-none"
                    aria-label={`${food.name}を削除`}
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        )}

      </div>

      {/* ── カテゴリタブ sticky ──────────────────────────────── */}
      {mode === "select" && (
        <div className="sticky z-10 bg-white border-b mt-2" style={{ top: stickyOffset }}>
          <div className="mx-auto max-w-md overflow-x-auto flex gap-2 py-2">
            <div className="w-4 flex-shrink-0" aria-hidden="true" />
            {CATEGORIES.map(({ id, label }) => (
              <button key={id} type="button" onClick={() => setActiveCategory(id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                  activeCategory === id ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {label}
              </button>
            ))}
            <div className="w-4 flex-shrink-0" aria-hidden="true" />
          </div>
        </div>
      )}

      {/* ── 食品グリッド ─────────────────────────────────────── */}
      {mode === "select" && (
        <div className="mx-auto max-w-md px-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            {displayFoods.map((food) => (
              <FoodCard key={food.id} food={food}
                selected={portionMap.has(food.id)}
                onToggle={() => {
                  if (portionMap.has(food.id)) {
                    setPortionMap((prev) => { const next = new Map(prev); next.delete(food.id); return next; });
                  } else {
                    openModal(food);
                  }
                }} />
            ))}
          </div>
        </div>
      )}

      {/* ── 分量選択モーダル ──────────────────────────────────── */}
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
            <button
              type="button"
              onClick={() => {
                if (modalFood && portionMap.has(modalFood.id)) {
                  setPortionMap((prev) => { const next = new Map(prev); next.delete(modalFood.id); return next; });
                }
                setModalFood(null);
              }}
              className="w-full py-3 rounded-2xl border border-gray-200 text-gray-500 text-sm font-semibold hover:bg-gray-50 active:scale-95 transition-all"
            >
              {modalFood && portionMap.has(modalFood.id) ? "選択を解除" : "キャンセル"}
            </button>
          </div>
        </div>
      )}

      {/* ── 下部固定ボタン ────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 shadow-lg z-20">
        <div className="mx-auto max-w-md space-y-1.5">
          {mode === "select" ? (
            <>
              {portionMap.size > 0 && (
                <p className="text-center text-sm text-teal-600 font-medium">
                  {portionMap.size}品選択中
                </p>
              )}
              <button
                type="button"
                onClick={handleSaveSelect}
                disabled={portionMap.size === 0}
                className={`w-full rounded-2xl py-4 text-lg font-bold transition-all ${
                  portionMap.size > 0
                    ? "bg-teal-600 text-white shadow-md hover:bg-teal-700 active:scale-[0.98]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {portionMap.size === 0 ? "食材を選んでください" : "食事を保存する"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSaveFree}
              disabled={parsedTokens.matched.length === 0 && parsedTokens.unknown.length === 0}
              className="w-full rounded-2xl bg-teal-600 py-4 text-white text-lg font-bold shadow-md hover:bg-teal-700 active:scale-[0.98] transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {parsedTokens.matched.length === 0 && parsedTokens.unknown.length === 0
                ? "食材を入力してください"
                : "食事を保存する"}
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
