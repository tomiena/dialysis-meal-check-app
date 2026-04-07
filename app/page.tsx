"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { FOODS, getFoodRisk, type FoodCategory } from "@/lib/foods";
import { MealItem, judgeMeal, calculateTotals } from "@/lib/judge";
import { generateAdvice, generateProfessionalAdvice } from "@/lib/advice";
import {
  toDateStr,
  parseDateLocal,
  getMealHistory,
  saveMealHistory,
  deleteMealById,
  getDailyStatsFromHistory,
  getRecentAverageFromHistory,
  getLabRecords,
  saveLabRecord,
  getDailyVitals,
  saveDailyVitals,
  type Meal,
  type LabRecord,
  type DailyVitals,
} from "@/lib/storage";

// ─── 型定義 ──────────────────────────────────────────────
type Portion = { label: string; grams: number };
type FoodBtn  = { foodId: string; label: string; portions: Portion[] };
type Category = { name: string; items: FoodBtn[]; warning?: string; showRiskLegend?: boolean };

// ─── 定数 ────────────────────────────────────────────────
const FONT = '"Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';

const STATUS = {
  ok:      { bg: "#e8f5e9", border: "#66bb6a", text: "#1b5e20", icon: "✅", label: "良好"   },
  caution: { bg: "#fff8e1", border: "#ffb300", text: "#e65100", icon: "⚠️", label: "注意"   },
  ng:      { bg: "#fff3f0", border: "#ff8a65", text: "#bf360c", icon: "⚠️", label: "多めです" },
};

// ─── カテゴリ定義（foods.ts を single source of truth とする） ────────────

// Per-food portion sizes (UI presentation data)
const PORTIONS: Record<string, Portion[]> = {
  // grain
  rice:            [{ label:"1杯",        grams:150 },{ label:"半分",      grams:75  },{ label:"大盛",    grams:200 }],
  brown_rice:      [{ label:"1杯",        grams:150 },{ label:"半分",      grams:75  }],
  onigiri:         [{ label:"1個",        grams:100 },{ label:"2個",       grams:200 }],
  rice_porridge:   [{ label:"1杯",        grams:200 },{ label:"半分",      grams:100 }],
  bread:           [{ label:"1枚",        grams:60  },{ label:"2枚",       grams:120 }],
  croissant:       [{ label:"1個",        grams:50  },{ label:"2個",       grams:100 }],
  pancake:         [{ label:"1枚",        grams:80  },{ label:"2枚",       grams:160 }],
  udon:            [{ label:"1杯",        grams:200 },{ label:"半分",      grams:100 }],
  soba:            [{ label:"1杯",        grams:200 },{ label:"半分",      grams:100 }],
  spaghetti:       [{ label:"1人前",      grams:200 },{ label:"半分",      grams:100 }],
  // soup
  miso_soup:       [{ label:"全部飲んだ", grams:150 },{ label:"半分",      grams:75  },{ label:"残した",  grams:20  }],
  tonjiru:         [{ label:"全部飲んだ", grams:150 },{ label:"半分",      grams:75  },{ label:"残した",  grams:20  }],
  consomme:        [{ label:"全部飲んだ", grams:150 },{ label:"半分",      grams:75  },{ label:"残した",  grams:20  }],
  chinese_soup:    [{ label:"全部飲んだ", grams:150 },{ label:"半分",      grams:75  },{ label:"残した",  grams:20  }],
  tomato_soup:     [{ label:"全部飲んだ", grams:150 },{ label:"半分",      grams:75  },{ label:"残した",  grams:20  }],
  potage:          [{ label:"全部飲んだ", grams:150 },{ label:"半分",      grams:75  },{ label:"残した",  grams:20  }],
  corn_potage:     [{ label:"全部飲んだ", grams:150 },{ label:"半分",      grams:75  },{ label:"残した",  grams:20  }],
  stew:            [{ label:"全部",       grams:150 },{ label:"半分",      grams:75  },{ label:"少量",    grams:40  }],
  nabe:            [{ label:"1杯分",      grams:200 },{ label:"半分",      grams:100 }],
  curry_liquid:    [{ label:"1皿",        grams:200 },{ label:"半分",      grams:100 }],
  // drink
  water_drink:     [{ label:"コップ1杯",  grams:200 },{ label:"半分",      grams:100 },{ label:"ペット小",grams:500 }],
  green_tea:       [{ label:"コップ1杯",  grams:200 },{ label:"半分",      grams:100 }],
  barley_tea:      [{ label:"コップ1杯",  grams:200 },{ label:"半分",      grams:100 }],
  black_tea:       [{ label:"コップ1杯",  grams:200 },{ label:"半分",      grams:100 }],
  coffee:          [{ label:"1杯",        grams:150 },{ label:"大きめ",    grams:250 }],
  milk_latte:      [{ label:"1杯",        grams:250 },{ label:"小さめ",    grams:150 }],
  cocoa:           [{ label:"1杯",        grams:200 },{ label:"小さめ",    grams:150 }],
  soy_milk:        [{ label:"1パック",    grams:200 },{ label:"半分",      grams:100 }],
  orange_juice:    [{ label:"1杯",        grams:200 },{ label:"小さめ",    grams:100 }],
  fruit_juice:     [{ label:"1杯",        grams:200 },{ label:"小さめ",    grams:100 }],
  vegetable_juice: [{ label:"1本",        grams:200 },{ label:"半分",      grams:100 }],
  sports_drink:    [{ label:"1本",        grams:500 },{ label:"半分",      grams:250 }],
  cola:            [{ label:"缶1本",      grams:350 },{ label:"コップ1杯", grams:200 }],
  carbonated_juice:[{ label:"缶1本",      grams:350 },{ label:"コップ1杯", grams:200 }],
  beer:            [{ label:"中ジョッキ", grams:350 },{ label:"缶1本",     grams:350 },{ label:"小",      grams:200 }],
  sake:            [{ label:"1合",        grams:180 },{ label:"半合",      grams:90  }],
  shochu:          [{ label:"1杯（水割り）",grams:100},{ label:"ロック",   grams:60  }],
  wine_red:        [{ label:"1杯",        grams:120 },{ label:"半分",      grams:60  }],
  wine_white:      [{ label:"1杯",        grams:120 },{ label:"半分",      grams:60  }],
  whisky:          [{ label:"シングル",   grams:30  },{ label:"ダブル",    grams:60  }],
  // meat
  chicken_b:       [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 },{ label:"半分",    grams:40  }],
  chicken_t:       [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  sasami:          [{ label:"1本",        grams:60  },{ label:"2本",       grams:120 }],
  chicken_wing:    [{ label:"2本",        grams:80  },{ label:"4本",       grams:160 }],
  liver_chicken:   [{ label:"50g",        grams:50  },{ label:"100g",      grams:100 }],
  duck:            [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  pork_loin:       [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  pork_belly:      [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  pork_shoulder:   [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  liver_pork:      [{ label:"50g",        grams:50  },{ label:"100g",      grams:100 }],
  beef:            [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  beef_belly:      [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  minced:          [{ label:"大さじ3",    grams:50  },{ label:"100g",      grams:100 }],
  lamb:            [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  // fish
  salmon:          [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  salmon_salt:     [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  tuna:            [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  mackerel:        [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  aji:             [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  iwashi:          [{ label:"1匹",        grams:80  },{ label:"2匹",       grams:160 }],
  buri:            [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  tai:             [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  cod:             [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  flatfish:        [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  shrimp:          [{ label:"5尾",        grams:80  },{ label:"10尾",      grams:160 }],
  squid:           [{ label:"1/2杯",      grams:80  },{ label:"1杯",       grams:160 }],
  octopus:         [{ label:"50g",        grams:50  },{ label:"100g",      grams:100 }],
  oyster:          [{ label:"3個",        grams:60  },{ label:"6個",       grams:120 }],
  scallop:         [{ label:"2個",        grams:80  },{ label:"4個",       grams:160 }],
  canned_mackerel: [{ label:"1/2缶",      grams:95  },{ label:"1缶",       grams:190 }],
  canned_tuna:     [{ label:"1/2缶",      grams:70  },{ label:"1缶",       grams:140 }],
  dried_fish:      [{ label:"1枚",        grams:80  },{ label:"2枚",       grams:160 }],
  // dairy_egg_soy
  egg:             [{ label:"1個",        grams:60  },{ label:"2個",       grams:120 }],
  tofu_m:          [{ label:"半丁",       grams:150 },{ label:"1/4丁",     grams:75  }],
  tofu_k:          [{ label:"半丁",       grams:150 },{ label:"1/4丁",     grams:75  }],
  natto:           [{ label:"1パック",    grams:40  },{ label:"2パック",   grams:80  }],
  abura_age:       [{ label:"1枚",        grams:30  },{ label:"2枚",       grams:60  }],
  atsuage:         [{ label:"1/2個",      grams:100 },{ label:"1個",       grams:200 }],
  ganmodoki:       [{ label:"1個",        grams:80  },{ label:"2個",       grams:160 }],
  edamame:         [{ label:"ひとつまみ", grams:50  },{ label:"多め",      grams:100 }],
  soy_beans:       [{ label:"大さじ2",    grams:30  },{ label:"50g",       grams:50  }],
  milk:            [{ label:"1杯",        grams:200 },{ label:"半分",      grams:100 }],
  cheese:          [{ label:"1枚",        grams:20  },{ label:"2枚",       grams:40  }],
  yogurt:          [{ label:"1個",        grams:100 },{ label:"半分",      grams:50  }],
  // vegetable & fruit
  cabbage:         [{ label:"1皿",        grams:80  },{ label:"たっぷり",  grams:120 },{ label:"少量",    grams:40  }],
  cucumber:        [{ label:"1本",        grams:100 },{ label:"半分",      grams:50  }],
  tomato:          [{ label:"1個",        grams:120 },{ label:"半分",      grams:60  }],
  broccoli:        [{ label:"1房",        grams:80  },{ label:"2房",       grams:160 }],
  lettuce:         [{ label:"1枚",        grams:30  },{ label:"3枚",       grams:90  }],
  moyashi:         [{ label:"1皿",        grams:80  },{ label:"半袋",      grams:100 }],
  eggplant:        [{ label:"1本",        grams:80  },{ label:"半分",      grams:40  }],
  green_pepper:    [{ label:"1個",        grams:30  },{ label:"2個",       grams:60  }],
  daikon:          [{ label:"1皿",        grams:80  },{ label:"厚切り",    grams:120 }],
  onion:           [{ label:"1/2個",      grams:80  },{ label:"1個",       grams:160 }],
  carrot:          [{ label:"1/3本",      grams:50  },{ label:"1/2本",     grams:80  }],
  pumpkin:         [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  potato:          [{ label:"1個",        grams:100 },{ label:"半分",      grams:50  }],
  sweet_potato:    [{ label:"1/3本",      grams:80  },{ label:"半分",      grams:120 }],
  spinach:         [{ label:"1皿",        grams:80  },{ label:"たっぷり",  grams:120 }],
  komatsuna:       [{ label:"1皿",        grams:80  },{ label:"たっぷり",  grams:120 }],
  chinese_cabbage: [{ label:"1皿",        grams:80  },{ label:"たっぷり",  grams:150 }],
  shiitake:        [{ label:"2枚",        grams:40  },{ label:"4枚",       grams:80  }],
  enoki:           [{ label:"1袋",        grams:100 },{ label:"半袋",      grams:50  }],
  corn:            [{ label:"1/2本",      grams:120 },{ label:"1本",       grams:240 }],
  asparagus:       [{ label:"3本",        grams:60  },{ label:"5本",       grams:100 }],
  celery:          [{ label:"1本",        grams:80  },{ label:"2本",       grams:160 }],
  burdock:         [{ label:"1/3本",      grams:50  },{ label:"1/2本",     grams:80  }],
  lotus_root:      [{ label:"1節",        grams:80  },{ label:"半分",      grams:40  }],
  chives:          [{ label:"1皿",        grams:60  },{ label:"たっぷり",  grams:100 }],
  bamboo_shoot:    [{ label:"50g",        grams:50  },{ label:"100g",      grams:100 }],
  okra:            [{ label:"3本",        grams:30  },{ label:"5本",       grams:50  }],
  green_beans:     [{ label:"1皿",        grams:60  },{ label:"たっぷり",  grams:100 }],
  shungiku:        [{ label:"1皿",        grams:80  },{ label:"たっぷり",  grams:120 }],
  taro:            [{ label:"2個",        grams:80  },{ label:"4個",       grams:160 }],
  apple:           [{ label:"1/2個",      grams:120 },{ label:"1/4個",     grams:60  }],
  mikan:           [{ label:"1個",        grams:100 },{ label:"2個",       grams:200 }],
  pear:            [{ label:"1/2個",      grams:100 },{ label:"1/4個",     grams:50  }],
  peach:           [{ label:"1個",        grams:200 },{ label:"半分",      grams:100 }],
  watermelon:      [{ label:"1切れ",      grams:150 },{ label:"2切れ",     grams:300 }],
  strawberry:      [{ label:"5粒",        grams:75  },{ label:"10粒",      grams:150 }],
  grape:           [{ label:"一房",       grams:150 },{ label:"半房",      grams:75  }],
  banana:          [{ label:"1本",        grams:100 },{ label:"半分",      grams:50  }],
  kiwi:            [{ label:"1個",        grams:100 },{ label:"半分",      grams:50  }],
  melon:           [{ label:"1切れ",      grams:150 },{ label:"2切れ",     grams:300 }],
  pineapple:       [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  mango:           [{ label:"1/2個",      grams:100 },{ label:"1個",       grams:200 }],
  grapefruit:      [{ label:"1/2個",      grams:150 },{ label:"1個",       grams:300 }],
  fig:             [{ label:"1個",        grams:60  },{ label:"2個",       grams:120 }],
  persimmon:       [{ label:"1個",        grams:160 },{ label:"半分",      grams:80  }],
  lemon:           [{ label:"1/4個",      grams:25  },{ label:"1/2個",     grams:50  }],
  // seasoning
  soy_tbsp:        [{ label:"少々",       grams:5   },{ label:"小さじ1",   grams:6   },{ label:"大さじ1", grams:18  }],
  miso_tbsp:       [{ label:"小さじ1",    grams:6   },{ label:"大さじ1",   grams:18  }],
  salt_tsp:        [{ label:"少々",       grams:1   },{ label:"小さじ1",   grams:6   }],
  mayonnaise:      [{ label:"小さじ1",    grams:5   },{ label:"大さじ1",   grams:15  }],
  ketchup:         [{ label:"小さじ1",    grams:5   },{ label:"大さじ1",   grams:15  }],
  worcestershire:  [{ label:"小さじ1",    grams:5   },{ label:"大さじ1",   grams:15  }],
  vinegar:         [{ label:"小さじ1",    grams:5   },{ label:"大さじ1",   grams:15  }],
  butter:          [{ label:"5g",         grams:5   },{ label:"10g",       grams:10  }],
  dressing:        [{ label:"小さじ2",    grams:10  },{ label:"大さじ1",   grams:15  }],
  cream:           [{ label:"大さじ1",    grams:15  },{ label:"大さじ3",   grams:45  }],
  // prepared_food
  karaage:         [{ label:"3個",        grams:90  },{ label:"5個",       grams:150 }],
  yakizakana:      [{ label:"1切れ",      grams:80  },{ label:"2切れ",     grams:160 }],
  hamburger:       [{ label:"1個",        grams:120 },{ label:"半分",      grams:60  }],
  tonkatsu:        [{ label:"1切れ",      grams:100 },{ label:"2切れ",     grams:200 }],
  croquette:       [{ label:"1個",        grams:70  },{ label:"2個",       grams:140 }],
  tamagoyaki:      [{ label:"1切れ",      grams:50  },{ label:"2切れ",     grams:100 }],
  tempura_shrimp:  [{ label:"2本",        grams:70  },{ label:"3本",       grams:105 }],
  tempura_veg:     [{ label:"2個",        grams:80  },{ label:"4個",       grams:160 }],
  yakitori:        [{ label:"2本",        grams:60  },{ label:"4本",       grams:120 }],
  niku_jaga:       [{ label:"1皿",        grams:150 },{ label:"半分",      grams:75  }],
  nikujaga:        [{ label:"1皿",        grams:150 },{ label:"半分",      grams:75  }],
  chawanmushi:     [{ label:"1個",        grams:150 },{ label:"半分",      grams:75  }],
  gyudon:          [{ label:"1杯",        grams:300 },{ label:"半分",      grams:150 }],
  oyakodon:        [{ label:"1杯",        grams:300 },{ label:"半分",      grams:150 }],
  sushi_nigiri:    [{ label:"2貫",        grams:60  },{ label:"5貫",       grams:150 }],
  mapo_tofu:       [{ label:"1皿",        grams:150 },{ label:"半分",      grams:75  }],
  fried_rice:      [{ label:"1杯",        grams:200 },{ label:"半分",      grams:100 }],
  curry_rice:      [{ label:"1皿",        grams:250 },{ label:"半分",      grams:125 }],
  ramen:           [{ label:"1杯",        grams:400 },{ label:"麺だけ",    grams:200 }],
  yakisoba:        [{ label:"1皿",        grams:200 },{ label:"半分",      grams:100 }],
  okonomiyaki:     [{ label:"1枚",        grams:200 },{ label:"半分",      grams:100 }],
  gyoza_fried:     [{ label:"5個",        grams:80  },{ label:"10個",      grams:160 }],
  pizza:           [{ label:"1切れ",      grams:100 },{ label:"2切れ",     grams:200 }],
  zosui:           [{ label:"1杯",        grams:200 },{ label:"半分",      grams:100 }],
  ham:             [{ label:"1枚",        grams:20  },{ label:"3枚",       grams:60  }],
  wiener:          [{ label:"1本",        grams:20  },{ label:"3本",       grams:60  }],
  sausage:         [{ label:"1本",        grams:30  },{ label:"2本",       grams:60  }],
  bacon:           [{ label:"1枚",        grams:20  },{ label:"3枚",       grams:60  }],
  kamaboko:        [{ label:"2切れ",      grams:40  },{ label:"4切れ",     grams:80  }],
  chikuwa:         [{ label:"1本",        grams:30  },{ label:"2本",       grams:60  }],
  hanpen:          [{ label:"1/2枚",      grams:55  },{ label:"1枚",       grams:110 }],
  satsuma_age:     [{ label:"1枚",        grams:60  },{ label:"2枚",       grams:120 }],
  instant_noodles: [{ label:"1袋",        grams:100 }],
};

const DEFAULT_PORTIONS: Portion[] = [{ label: "100g", grams: 100 }, { label: "50g", grams: 50 }];

// Category display order and metadata
const CATEGORY_ORDER: FoodCategory[] = [
  "grain", "soup", "drink", "meat", "fish", "dairy_egg_soy", "vegetable", "seasoning", "prepared_food",
];

const CATEGORY_META: Record<FoodCategory, { name: string; warning?: string; showRiskLegend?: boolean }> = {
  grain:         { name: "🍚 主食・麺" },
  soup:          { name: "🥣 汁物",          warning: "⚠️ 汁物は塩分が多めです。飲む量を少なめにすると体が楽になります。", showRiskLegend: true },
  drink:         { name: "🥤 飲み物" },
  meat:          { name: "🍖 肉類",          showRiskLegend: true },
  fish:          { name: "🐟 魚介",          showRiskLegend: true },
  dairy_egg_soy: { name: "🥚 卵・大豆・乳製品" },
  vegetable:     { name: "🥦 野菜・果物",    showRiskLegend: true },
  seasoning:     { name: "🧂 調味料" },
  prepared_food: { name: "🍱 調理済み・惣菜", warning: "⚠️ 調理品は塩分・脂質が多めのことがあります。量で調整してみてください。", showRiskLegend: true },
};

// Dynamically built from FOODS — no manual list maintenance needed
const CATEGORIES: Category[] = CATEGORY_ORDER.map((cat) => ({
  ...CATEGORY_META[cat],
  items: FOODS
    .filter((f) => f.category === cat)
    .map((f) => ({
      foodId:   f.id,
      label:    f.name,
      portions: PORTIONS[f.id] ?? DEFAULT_PORTIONS,
    })),
}));

// ─── ユーティリティ ───────────────────────────────────────

function formatDateLabel(dateStr: string, todayStr: string): string {
  const d = parseDateLocal(dateStr);
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  const dow = dayNames[d.getDay()];
  const yesterday = toDateStr(new Date(new Date().setDate(new Date().getDate() - 1)));
  if (dateStr === todayStr)  return `今日（${dow}）`;
  if (dateStr === yesterday) return `昨日（${dow}）`;
  return `${d.getMonth() + 1}月${d.getDate()}日（${dow}）`;
}

// ─── FoodButton ───────────────────────────────────────────
function FoodButton({ btn, onTap, disabled }: { btn: FoodBtn; onTap: () => void; disabled?: boolean }) {
  const food = FOODS.find((f) => f.id === btn.foodId);
  const risk = food ? getFoodRisk(food) : { sodium: false, potassium: false };
  const [pressed, setPressed] = useState(false);

  const borderColor = risk.sodium ? "#ffb3b3" : risk.potassium ? "#ffd0a0" : "#e8ddd0";
  const riskBadge   = risk.sodium
    ? { label: "塩分↑", color: "#e53935", bg: "#ffebee" }
    : risk.potassium
    ? { label: "K↑",    color: "#e65100", bg: "#fff3e0" }
    : null;

  return (
    <button
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={disabled ? undefined : onTap}
      style={{
        position: "relative",
        background: "#fff",
        border: `2px solid ${borderColor}`,
        borderRadius: 14,
        padding: "14px 8px 12px",
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 5,
        boxShadow: pressed ? "0 1px 3px rgba(0,0,0,0.08)" : "0 2px 8px rgba(0,0,0,0.06)",
        transform: pressed ? "scale(0.94)" : "scale(1)",
        transition: "transform 0.1s, box-shadow 0.1s",
        WebkitTapHighlightColor: "transparent",
        fontFamily: FONT,
        width: "100%",
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {riskBadge && (
        <span style={{
          position: "absolute", top: 6, right: 6,
          fontSize: 10, fontWeight: "bold",
          color: riskBadge.color, background: riskBadge.bg,
          padding: "1px 5px", borderRadius: 6,
        }}>
          {riskBadge.label}
        </span>
      )}
      <div style={{ width: 64, height: 64, marginBottom: 8, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {food?.image
          ? <img src={food.image} alt={btn.label} width={64} height={64} style={{ objectFit: "contain", display: "block" }} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
          : <div style={{ width: 64, height: 64, background: "#f0ebe5", borderRadius: 8 }} />
        }
      </div>
      <span style={{ fontSize: 14, fontWeight: "bold", color: "#3d2010", textAlign: "center", lineHeight: 1.3, width: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {btn.label}
      </span>
      <span style={{ fontSize: 11, color: "#c0b0a0" }}>{btn.portions[0].label}〜</span>
    </button>
  );
}

// ─── PortionPicker ────────────────────────────────────────
function PortionPicker({
  btn, onSelect, onClose,
}: {
  btn: FoodBtn;
  onSelect: (grams: number, label: string) => void;
  onClose: () => void;
}) {
  const food = FOODS.find((f) => f.id === btn.foodId);
  const risk = food ? getFoodRisk(food) : { sodium: false, potassium: false };

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 100 }}
      />
      <div style={{
        position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
        width: "100%", maxWidth: 500,
        background: "#fff",
        borderRadius: "20px 20px 0 0",
        padding: "24px 20px 36px",
        zIndex: 101,
        boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
        fontFamily: FONT,
      }}>
        <div style={{ width: 40, height: 4, background: "#ddd", borderRadius: 2, margin: "0 auto 20px" }} />
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img src={food?.image ?? ""} alt={btn.label} width={64} height={64} style={{ objectFit: "contain", display: "block", margin: "0 auto" }} />
          <div style={{ fontSize: 20, fontWeight: "bold", color: "#3d2010", marginTop: 6 }}>{btn.label}</div>
          {(risk.sodium || risk.potassium) && (
            <div style={{
              display: "inline-block", marginTop: 8, fontSize: 13,
              color: risk.sodium ? "#bf360c" : "#e65100",
              background: risk.sodium ? "#fff3f0" : "#fff3e0",
              padding: "4px 12px", borderRadius: 8,
            }}>
              {risk.sodium ? "⚠️ 塩分が多め — 量に気をつけて" : "⚠️ カリウムが多め — 量に気をつけて"}
            </div>
          )}
        </div>
        <p style={{ fontSize: 14, color: "#aaa", textAlign: "center", marginBottom: 14 }}>量を選んでください</p>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${Math.min(btn.portions.length, 3)}, 1fr)`,
          gap: 10,
          marginBottom: 16,
        }}>
          {btn.portions.map((p) => (
            <button
              key={p.label}
              onClick={() => onSelect(p.grams, p.label)}
              style={{
                padding: "14px 8px",
                background: "#fdf8f0",
                border: "2px solid #e8ddd0",
                borderRadius: 12,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              <div style={{ fontSize: 15, fontWeight: "bold", color: "#3d2010" }}>{p.label}</div>
              <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>{p.grams}g</div>
            </button>
          ))}
        </div>
        {food && (
          <div style={{ fontSize: 12, color: "#bbb", textAlign: "center" }}>
            100gあたり：水分{food.water}ml / Na {food.sodium}mg / K {food.potassium}mg / P {food.phosphorus}mg
          </div>
        )}
      </div>
    </>
  );
}

// ─── NutrientRow ──────────────────────────────────────────
function NutrientRow({ icon, name, value, status }: {
  icon: string; name: string; value: number; status: "ok" | "caution" | "ng";
}) {
  const s = STATUS[status];
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "13px 16px", marginBottom: 10,
      background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 10,
    }}>
      <span style={{ fontSize: 16, color: "#333", fontFamily: FONT }}>{icon} {name}</span>
      <span style={{ fontSize: 15, fontWeight: "bold", color: s.text, fontFamily: FONT }}>
        {value}mg　{s.icon} {s.label}
      </span>
    </div>
  );
}

// ─── PastHistoryList ──────────────────────────────────────
function PastHistoryList({
  sortedDates,
  historyByDate,
  today,
  onSelectDate,
}: {
  sortedDates: string[];
  historyByDate: Record<string, Meal[]>;
  today: string;
  onSelectDate: (date: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 16 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "#fff", border: "1px solid #f0e8d8", borderRadius: 12,
          padding: "12px 16px", cursor: "pointer", fontFamily: FONT,
          boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: "bold", color: "#5c3d1e" }}>
          📋 過去の食事履歴（{sortedDates.length}日分）
        </span>
        <span style={{ fontSize: 16, color: "#bbb" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ marginTop: 8 }}>
          {sortedDates.map((dateStr) => {
            const meals = historyByDate[dateStr];
            const totalK = meals.reduce((s, m) => s + (m.total.potassium ?? 0), 0);
            const totalP = meals.reduce((s, m) => s + (m.total.phosphorus ?? 0), 0);
            const totalW = meals.reduce((s, m) => s + (m.total.water ?? 0), 0);
            const totalS = meals.reduce((s, m) => s + (m.total.sodium ?? 0), 0);
            const overalls = meals.map(m => m.overall).filter(Boolean);
            const worstOverall = overalls.includes("ng") ? "ng" : overalls.includes("caution") ? "caution" : overalls.length > 0 ? "ok" : null;
            return (
              <button
                key={dateStr}
                onClick={() => onSelectDate(dateStr)}
                style={{
                  width: "100%", textAlign: "left", background: "#fff",
                  border: "1px solid #f0e8d8", borderRadius: 10,
                  padding: "12px 14px", marginBottom: 6, cursor: "pointer",
                  fontFamily: FONT, boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: "bold", color: "#5c3d1e" }}>
                    {formatDateLabel(dateStr, today)}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {worstOverall && (
                      <span style={{
                        fontSize: 11, fontWeight: "bold", padding: "2px 6px", borderRadius: 5,
                        color: STATUS[worstOverall as StatusKey].text,
                        background: STATUS[worstOverall as StatusKey].bg,
                        border: `1px solid ${STATUS[worstOverall as StatusKey].border}`,
                      }}>
                        {STATUS[worstOverall as StatusKey].icon}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: "#bbb" }}>{meals.length}食 ›</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 5, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, color: "#1565c0" }}>💧 {totalW}ml</span>
                  <span style={{ fontSize: 11, color: "#5c3d1e" }}>🧂 {totalS}mg</span>
                  <span style={{ fontSize: 11, color: totalK > 1650 ? "#bf360c" : "#388e3c" }}>K {totalK}mg</span>
                  <span style={{ fontSize: 11, color: totalP > 660 ? "#bf360c" : "#7b1fa2" }}>P {totalP}mg</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── CalendarPicker ───────────────────────────────────────
function CalendarPicker({
  selectedDate,
  today,
  mealHistory,
  labRecords,
  onSelectDate,
}: {
  selectedDate: string;
  today: string;
  mealHistory: Meal[];
  labRecords: LabRecord[];
  onSelectDate: (date: string) => void;
}) {
  const selectedYM = selectedDate.slice(0, 7);
  const [viewYear,  setViewYear]  = useState(() => parseInt(selectedDate.slice(0, 4)));
  const [viewMonth, setViewMonth] = useState(() => parseInt(selectedDate.slice(5, 7)) - 1);

  useEffect(() => {
    setViewYear(parseInt(selectedYM.slice(0, 4)));
    setViewMonth(parseInt(selectedYM.slice(5, 7)) - 1);
  }, [selectedYM]);

  const mealDates = useMemo(() => new Set(mealHistory.map((m) => m.date)), [mealHistory]);
  const labDates  = useMemo(() => new Set(labRecords.map((l) => l.date)),  [labRecords]);

  const todayY = parseInt(today.slice(0, 4));
  const todayM = parseInt(today.slice(5, 7)) - 1;
  const canGoNext = viewYear < todayY || (viewYear === todayY && viewMonth < todayM);

  const goBack = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goNext = () => {
    if (!canGoNext) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const firstDow    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "14px 12px", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <button onClick={goBack} style={{ width: 34, height: 34, border: "1.5px solid #e8ddd0", borderRadius: 8, background: "#fdf8f0", cursor: "pointer", fontSize: 20, color: "#c17a3a", fontFamily: FONT, lineHeight: 1 }}>‹</button>
        <span style={{ fontSize: 15, fontWeight: "bold", color: "#3d2010", fontFamily: FONT }}>{viewYear}年{viewMonth + 1}月</span>
        <button onClick={goNext} disabled={!canGoNext} style={{ width: 34, height: 34, border: "1.5px solid #e8ddd0", borderRadius: 8, background: canGoNext ? "#fdf8f0" : "#f5f0ea", cursor: canGoNext ? "pointer" : "default", fontSize: 20, color: canGoNext ? "#c17a3a" : "#ddd", fontFamily: FONT, lineHeight: 1 }}>›</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 2 }}>
        {["日","月","火","水","木","金","土"].map((d, i) => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, color: i === 0 ? "#e57373" : i === 6 ? "#64b5f6" : "#aaa", paddingBottom: 3 }}>{d}</div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} style={{ height: 44 }} />;
          const mm      = String(viewMonth + 1).padStart(2, "0");
          const dd      = String(day).padStart(2, "0");
          const dateStr = `${viewYear}-${mm}-${dd}`;
          const isToday    = dateStr === today;
          const isSelected = dateStr === selectedDate;
          const isFuture   = dateStr > today;
          const hasMeal    = mealDates.has(dateStr);
          const hasLab     = labDates.has(dateStr);
          const dow = (firstDow + day - 1) % 7;
          return (
            <button
              key={dateStr}
              onClick={() => !isFuture && onSelectDate(dateStr)}
              disabled={isFuture}
              style={{
                height: 44, padding: 0,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                background: isSelected ? "#c17a3a" : isToday ? "#fdf5eb" : "transparent",
                border: isSelected ? "none" : isToday ? "1.5px solid #c17a3a" : "none",
                borderRadius: 8,
                cursor: isFuture ? "default" : "pointer",
                opacity: isFuture ? 0.25 : 1,
                fontFamily: FONT,
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: 14, lineHeight: 1, fontWeight: isToday || isSelected ? "bold" : "normal", color: isSelected ? "#fff" : dow === 0 ? "#e57373" : dow === 6 ? "#64b5f6" : "#3d2010" }}>
                {day}
              </span>
              <div style={{ display: "flex", gap: 2, height: 6, alignItems: "center" }}>
                {hasMeal && <span style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? "#fff" : "#c17a3a", display: "inline-block" }} />}
                {hasLab  && <span style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? "#ffe0b2" : "#1565c0", display: "inline-block" }} />}
              </div>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontSize: 11, color: "#888" }}>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#c17a3a", verticalAlign: "middle", marginRight: 3 }} />食事
          </span>
          <span style={{ fontSize: 11, color: "#888" }}>
            <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: "#1565c0", verticalAlign: "middle", marginRight: 3 }} />検査
          </span>
        </div>
        {selectedDate !== today && (
          <button onClick={() => onSelectDate(today)} style={{ fontSize: 12, color: "#c17a3a", background: "#fdf5eb", border: "1px solid #e8c898", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: FONT }}>
            今日に戻す
          </button>
        )}
      </div>
    </div>
  );
}

// ─── 旧データ移行 ─────────────────────────────────────────
function migrateMeal(meal: Meal): Meal {
  const raw = meal.total as any;
  let water      = raw.water      ?? 0;
  let sodium     = raw.sodium     !== undefined
    ? raw.sodium
    : raw.salt !== undefined
      ? Math.round(raw.salt / 2.54 * 1000)
      : 0;
  let potassium  = raw.potassium  ?? 0;
  let phosphorus = raw.phosphorus ?? 0;

  if (water > 0 || sodium > 0 || potassium > 0 || phosphorus > 0) {
    return { ...meal, total: { water, sodium, potassium, phosphorus } };
  }

  for (const item of meal.items) {
    const food = item.foodId
      ? FOODS.find((f) => f.id === item.foodId)
      : FOODS.find((f) => f.name === item.name);
    const amount = item.amount ?? 100;
    if (food) {
      water      += food.water      * amount / 100;
      sodium     += food.sodium     * amount / 100;
      potassium  += food.potassium  * amount / 100;
      phosphorus += food.phosphorus * amount / 100;
    }
  }
  return {
    ...meal,
    total: {
      water:      Math.round(water),
      sodium:     Math.round(sodium),
      potassium:  Math.round(potassium),
      phosphorus: Math.round(phosphorus),
    },
  };
}

// ─── メインコンポーネント ─────────────────────────────────
type StatusKey = "ok" | "caution" | "ng";

export default function Home() {
  const today = toDateStr(new Date());

  const [tab,    setTab]    = useState(0);
  const [items,  setItems]  = useState<MealItem[]>([]);
  const [picker, setPicker] = useState<FoodBtn | null>(null);
  const [result, setResult] = useState<ReturnType<typeof judgeMeal> | null>(null);
  const [advice, setAdvice] = useState("");
  const [proAdvice, setProAdvice] = useState("");
  const [toast,  setToast]  = useState("");

  const [selectedDate, setSelectedDate] = useState(today);
  const [mealHistory,  setMealHistory]  = useState<Meal[]>([]);
  const [labRecords,   setLabRecords]   = useState<LabRecord[]>([]);
  const [showLabForm,  setShowLabForm]  = useState(false);
  const [labInput,     setLabInput]     = useState({ date: today, potassium: "", phosphorus: "" });
  const [subscriptionStatus, setSubscriptionStatus] = useState<"free" | "active">("free");
  const [showPremiumActivated, setShowPremiumActivated] = useState(false);
  const [mealSavedForCurrentJudge, setMealSavedForCurrentJudge] = useState(false);
  const [showAllLabRecords, setShowAllLabRecords] = useState(false);
  const [drinkWater, setDrinkWater] = useState(0);
  const [showRecorder, setShowRecorder] = useState(false);
  const [vitalsInput, setVitalsInput] = useState({ weight: "", bpSys: "", bpDia: "", pulse: "" });

  const resultRef = useRef<HTMLDivElement>(null);

  // ─ ロード ─
  useEffect(() => {
    setMealHistory(getMealHistory().map(migrateMeal));
    setLabRecords(getLabRecords().slice().reverse());

    const params = new URLSearchParams(window.location.search);
    if (params.get("paid") === "success" && document.referrer.includes("stripe.com")) {
      if (localStorage.getItem("isPaidUser") !== "true") {
        localStorage.setItem("isPaidUser", "true");
        setShowPremiumActivated(true);
      }
      params.delete("paid");
      const clean = params.toString();
      window.history.replaceState({}, "", clean ? `?${clean}` : window.location.pathname);
    }

    if (localStorage.getItem("isPaidUser") === "true") {
      setSubscriptionStatus("active");
    }
  }, []);

  useEffect(() => {
    const v = getDailyVitals(selectedDate);
    setVitalsInput({
      weight: v.weight?.toString() ?? "",
      bpSys:  v.bpSystolic?.toString()  ?? "",
      bpDia:  v.bpDiastolic?.toString() ?? "",
      pulse:  v.pulse?.toString()       ?? "",
    });
  }, [selectedDate]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  // ─ 派生値 ─
  const todayStats = getDailyStatsFromHistory(selectedDate, mealHistory);
  const avg3 = getRecentAverageFromHistory(3, mealHistory);
  const avg7 = getRecentAverageFromHistory(7, mealHistory);
  const isPremium = subscriptionStatus === "active";
  const isInputLocked = !isPremium && selectedDate !== today;
  const selectedDateMealCount = todayStats.mealCount;

  // 単一の計算ソース (live recording)
  const liveTotals = calculateTotals(items, drinkWater);

  // ─ 今日のひとこと ─
  function getDailyComment(): string {
    if (selectedDateMealCount === 0) {
      return "今日の記録はまだありません。\n最初の食事を記録してみましょう！";
    }
    const sodiumOk = todayStats.totalSodium <= 2100;
    const kOk = todayStats.totalPotassium <= 1650;
    const pOk = todayStats.totalPhosphorus <= 660;
    if (sodiumOk && kOk && pOk) {
      return `${selectedDateMealCount}食の記録ができています。\n今日の栄養バランスは良好です。この調子で続けましょう。`;
    }
    if (!sodiumOk) return "今日は塩分が少し多めでした。\n次の食事では汁物を少し控えると、体が楽になりますよ。";
    if (!kOk)      return "カリウムが多めの1日でした。\n野菜は茹でこぼしをするだけで大幅に減らせます。";
    return "今日も記録できています。\n継続することが、体調管理の一番の力になります。";
  }

  // ─ ハンドラー ─
  const handleSelectDate = (d: string) => {
    setSelectedDate(d);
    setItems([]);
    setResult(null);
    setAdvice("");
    setProAdvice("");
    setMealSavedForCurrentJudge(false);
    setDrinkWater(0);
    setShowRecorder(false);
  };

  const handleReset = () => {
    setItems([]);
    setResult(null);
    setAdvice("");
    setProAdvice("");
    setMealSavedForCurrentJudge(false);
    setDrinkWater(0);
    setTab(0);
  };

  const handlePortionSelect = (grams: number, portionLabel: string) => {
    const food = FOODS.find((f) => f.id === picker!.foodId)!;
    setItems((prev) => [...prev, { food, amount: grams }]);
    setResult(null);
    setAdvice("");
    setProAdvice("");
    setMealSavedForCurrentJudge(false);
    showToast(`${picker!.label}（${portionLabel}）を追加しました`);
    setPicker(null);
  };

  const removeItem = (i: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
    setResult(null);
    setAdvice("");
    setProAdvice("");
  };

  const handleJudge = () => {
    if (items.length === 0) return;
    const r = judgeMeal(items);
    const adviceText = generateAdvice(r);
    const proAdviceText = generateProfessionalAdvice(r);
    setResult(r);
    setAdvice(adviceText);
    setProAdvice(proAdviceText);

    const willSave = isPremium || selectedDateMealCount < 3;
    if (willSave) {
      saveMealHistory({
        date: selectedDate,
        items: items.map((i) => ({ name: i.food.name, foodId: i.food.id, amount: i.amount })),
        total: {
          water:      liveTotals.water,
          sodium:     r.sodium.value,
          potassium:  r.potassium.value,
          phosphorus: r.phosphorus.value,
        },
        overall: r.overall,
        advice:  adviceText,
      });
      setMealHistory(getMealHistory().map(migrateMeal));
    }
    setMealSavedForCurrentJudge(willSave);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleDeleteMeal = (id: string) => {
    deleteMealById(id);
    setMealHistory((prev) => prev.filter((m) => m.id !== id).map(migrateMeal));
  };

  const handleVitalsSave = () => {
    const w   = parseFloat(vitalsInput.weight);
    const sys = parseInt(vitalsInput.bpSys);
    const dia = parseInt(vitalsInput.bpDia);
    const pls = parseInt(vitalsInput.pulse);
    saveDailyVitals({
      date:        selectedDate,
      weight:      isNaN(w)   ? undefined : w,
      bpSystolic:  isNaN(sys) ? undefined : sys,
      bpDiastolic: isNaN(dia) ? undefined : dia,
      pulse:       isNaN(pls) ? undefined : pls,
    });
  };

  const goCheckout = () => {
    window.location.href = "https://buy.stripe.com/dRmaEZ63n67N46g6znefC00";
  };

  const unlockPremium = () => {
    localStorage.setItem("isPaidUser", "true");
    setSubscriptionStatus("active");
  };

  const historyByDate = mealHistory
    .slice().reverse()
    .reduce<Record<string, Meal[]>>((acc, meal) => {
      if (!acc[meal.date]) acc[meal.date] = [];
      acc[meal.date].push(meal);
      return acc;
    }, {});
  const sortedDates = Object.keys(historyByDate).sort((a, b) => b.localeCompare(a));
  const cat = CATEGORIES[tab];

  return (
    <main style={{ width: "100%", maxWidth: 500, margin: "0 auto", fontFamily: FONT, background: "#fdf8f0", minHeight: "100vh" }}>

      {/* ─── Sticky Header ─── */}
      <div style={{ position: "sticky", top: 0, zIndex: 10 }}>
        {showRecorder ? (
          <div style={{ background: "#fff", borderBottom: "1px solid #f0e8d8" }}>
            {/* Recording mode toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px 8px" }}>
              <button
                onClick={() => { setShowRecorder(false); handleReset(); }}
                style={{ padding: "6px 12px", fontSize: 13, background: "#f5ede0", color: "#5c3d1e", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: FONT, flexShrink: 0 }}
              >
                ← 戻る
              </button>
              <span style={{ flex: 1, textAlign: "center", fontSize: 16, fontWeight: "bold", color: "#3d2010" }}>
                食事を記録
              </span>
              {items.length > 0 && (
                <div style={{ fontSize: 11, color: "#888", flexShrink: 0, textAlign: "right" }}>
                  <span style={{ color: "#1565c0" }}>💧{liveTotals.water}</span>
                  <span style={{ color: "#888" }}>ml　</span>
                  <span style={{ color: "#5c3d1e" }}>🧂{liveTotals.sodium}</span>
                  <span style={{ color: "#888" }}>mg</span>
                </div>
              )}
            </div>
            {/* Category tabs */}
            <div style={{ display: "flex", overflowX: "auto", background: "#fff", borderBottom: "2px solid #f0e8d8", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
              {CATEGORIES.map((c, i) => (
                <button
                  key={i}
                  onClick={() => setTab(i)}
                  style={{
                    flex: "0 0 auto", padding: "10px 14px", fontSize: 14,
                    fontWeight: tab === i ? "bold" : "normal",
                    color: tab === i ? "#c17a3a" : "#888",
                    background: "transparent", border: "none",
                    borderBottom: tab === i ? "2.5px solid #c17a3a" : "2.5px solid transparent",
                    cursor: "pointer", fontFamily: FONT, whiteSpace: "nowrap", marginBottom: -2,
                  }}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Home mode header — minimal */
          <div style={{ background: "#fff", borderBottom: "1px solid #f5ede0", padding: "13px 16px 11px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1 style={{ fontSize: 18, fontWeight: "bold", color: "#3d2010", margin: 0 }}>🍱 食事チェック</h1>
            <span style={{ fontSize: 13, color: "#c17a3a", fontWeight: "bold" }}>
              {formatDateLabel(selectedDate, today)}
            </span>
          </div>
        )}
      </div>

      {/* ─── Main Content ─── */}
      <div style={{ padding: "14px 12px 120px" }}>

        {showRecorder ? (
          /* ═══ 記録モード ═══ */
          <>
            {/* Live summary */}
            {items.length > 0 && (
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <div style={{
                  flex: 1, textAlign: "center", padding: "8px 10px",
                  background: "#f0f7ff", border: "1.5px solid #90caf9", borderRadius: 10,
                }}>
                  <div style={{ fontSize: 11, color: "#888" }}>💧 水分</div>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: "#1565c0" }}>
                    {liveTotals.water}<span style={{ fontSize: 12, fontWeight: "normal" }}>ml</span>
                  </div>
                </div>
                <div style={{
                  flex: 1, textAlign: "center", padding: "8px 10px",
                  background: liveTotals.sodium <= 700 ? "#e8f5e9" : liveTotals.sodium <= 1050 ? "#fff8e1" : "#fff3f0",
                  border: `1.5px solid ${liveTotals.sodium <= 700 ? "#81c784" : liveTotals.sodium <= 1050 ? "#ffb300" : "#ff8a65"}`,
                  borderRadius: 10,
                }}>
                  <div style={{ fontSize: 11, color: "#888" }}>🧂 ナトリウム</div>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: liveTotals.sodium <= 700 ? "#1b5e20" : liveTotals.sodium <= 1050 ? "#e65100" : "#bf360c" }}>
                    {liveTotals.sodium}<span style={{ fontSize: 12, fontWeight: "normal" }}>mg</span>
                  </div>
                </div>
              </div>
            )}

            {/* Drink water */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: "#888" }}>🥤 飲み水を追加</span>
              <button onClick={() => setDrinkWater(w => Math.max(0, w - 50))} style={{ width: 28, height: 28, borderRadius: 14, border: "1px solid #d0b080", background: "#fff8ee", fontSize: 16, cursor: "pointer", color: "#8b5e2a", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <span style={{ fontSize: 13, fontWeight: "bold", color: "#5c3d1e", minWidth: 56, textAlign: "center" }}>{drinkWater}ml</span>
              <button onClick={() => setDrinkWater(w => w + 50)} style={{ width: 28, height: 28, borderRadius: 14, border: "1px solid #d0b080", background: "#fff8ee", fontSize: 16, cursor: "pointer", color: "#8b5e2a", display: "flex", alignItems: "center", justifyContent: "center" }}>＋</button>
            </div>

            {/* Category warning */}
            {cat.warning && (
              <div style={{ marginBottom: 12, padding: "10px 14px", background: "#fffbee", border: "1.5px solid #f0d080", borderRadius: 10, fontSize: 13, color: "#5c3010", lineHeight: 1.6 }}>
                {cat.warning}
              </div>
            )}

            {/* Risk legend */}
            {cat.showRiskLegend && (
              <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap", padding: "8px 12px", background: "#fffbf5", borderRadius: 10, border: "1px solid #f0e0c8" }}>
                <span style={{ fontSize: 12, color: "#888" }}>色の目安：</span>
                <span style={{ fontSize: 12, color: "#e53935", background: "#ffebee", padding: "2px 8px", borderRadius: 6 }}>塩分↑</span>
                <span style={{ fontSize: 12, color: "#e65100", background: "#fff3e0", padding: "2px 8px", borderRadius: 6 }}>K↑ カリウム多め</span>
              </div>
            )}

            {/* Food grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
              {cat.items.map((btn, i) => (
                <FoodButton key={`${btn.foodId}-${i}`} btn={btn} onTap={() => setPicker(btn)} disabled={isInputLocked} />
              ))}
            </div>

            {/* Lock banner */}
            {isInputLocked && (
              <div style={{ marginBottom: 14, padding: "16px", background: "#f8f4ff", border: "1.5px solid #ce93d8", borderRadius: 12, textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>🔒</div>
                <p style={{ fontSize: 14, color: "#6a1b9a", fontWeight: "bold", margin: "0 0 4px", lineHeight: 1.6 }}>過去日の記録は有料プランでご利用いただけます。</p>
                <p style={{ fontSize: 13, color: "#8e24aa", margin: "0 0 12px", lineHeight: 1.6 }}>継続的な振り返りに役立ちます。</p>
                <button onClick={goCheckout} style={{ padding: "10px 24px", fontSize: 14, fontWeight: "bold", background: "#8e24aa", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: FONT }}>有料プランを見る</button>
              </div>
            )}

            {/* Selected items */}
            {items.length > 0 && (
              <div style={{ background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <h2 style={{ fontSize: 15, fontWeight: "bold", color: "#5c3d1e", marginBottom: 12 }}>
                  選んだ食材　<span style={{ fontWeight: "normal", color: "#bbb", fontSize: 13 }}>{items.length}品</span>
                </h2>
                {items.map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < items.length - 1 ? "1px solid #f5ede0" : "none" }}>
                    <span style={{ fontSize: 15, color: "#333" }}>{item.food.name}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, color: "#aaa" }}>{item.amount}g</span>
                      <button onClick={() => removeItem(i)} style={{ width: 30, height: 30, borderRadius: "50%", background: "#fff0f0", border: "none", fontSize: 16, color: "#e07070", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={handleJudge}
                  style={{ width: "100%", padding: "14px", fontSize: 17, fontWeight: "bold", background: "#2e7d32", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", marginTop: 14, fontFamily: FONT }}
                >
                  この食事を判定する
                </button>
              </div>
            )}

            {/* Empty state */}
            {items.length === 0 && !result && (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#ccc" }}>
                <div style={{ fontSize: 44, marginBottom: 8 }}>👆</div>
                <p style={{ fontSize: 14, lineHeight: 1.9 }}>上のボタンをタップして<br />食べたものを選んでください</p>
              </div>
            )}

            {/* Result panel */}
            {result && (
              <div ref={resultRef} style={{ background: "#fff", borderRadius: 14, padding: "20px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ textAlign: "center", padding: "16px", borderRadius: 12, marginBottom: 16, background: STATUS[result.overall as StatusKey].bg, border: `2px solid ${STATUS[result.overall as StatusKey].border}` }}>
                  <div style={{ fontSize: 40 }}>{STATUS[result.overall as StatusKey].icon}</div>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: STATUS[result.overall as StatusKey].text, marginTop: 6 }}>
                    {result.overall === "ok" ? "この食事は良好です" : result.overall === "caution" ? "少し気をつけましょう" : "調整が必要です"}
                  </div>
                </div>
                <h3 style={{ fontSize: 13, color: "#aaa", marginBottom: 10 }}>栄養素ごとの結果</h3>
                <NutrientRow icon="🧂" name="ナトリウム" value={result.sodium.value}     status={result.sodium.status as StatusKey}     />
                <NutrientRow icon="🥦" name="カリウム"   value={result.potassium.value}  status={result.potassium.status as StatusKey}  />
                <NutrientRow icon="🦴" name="リン"       value={result.phosphorus.value} status={result.phosphorus.status as StatusKey} />
                <div style={{ marginTop: 16, padding: "14px 16px", background: "#fdf5eb", borderLeft: "4px solid #c17a3a", borderRadius: "0 10px 10px 0" }}>
                  <div style={{ fontSize: 13, color: "#7a4420", fontWeight: "bold", marginBottom: 6 }}>💬 アドバイス</div>
                  <p style={{ fontSize: 15, color: "#5c3d1e", lineHeight: 1.85, whiteSpace: "pre-line", margin: 0 }}>{advice}</p>
                  {proAdvice && (
                    <p style={{ fontSize: 12, color: "#7a5c3a", lineHeight: 1.75, marginTop: 10, marginBottom: 0, paddingTop: 10, borderTop: "1px solid #e8d5b7" }}>{proAdvice}</p>
                  )}
                </div>
                <p style={{ fontSize: 11, color: "#ccc", lineHeight: 1.7, marginTop: 12 }}>
                  1食の目安：Na 700mg以下 / K 550mg以下 / P 220mg以下<br />
                  ※生活サポート情報です。詳細は担当医・管理栄養士にご確認ください
                </p>
                {mealSavedForCurrentJudge && (
                  <p style={{ fontSize: 13, color: "#2e7d32", textAlign: "center", marginTop: 8 }}>✅ 記録しました</p>
                )}
                <button
                  onClick={() => { handleReset(); setShowRecorder(false); }}
                  style={{ width: "100%", marginTop: 12, padding: "14px", fontSize: 16, fontWeight: "bold", background: "#2e7d32", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: FONT }}
                >
                  記録を完了して戻る
                </button>
                {!isPremium && !mealSavedForCurrentJudge && (
                  <div style={{ marginTop: 14, padding: "16px", background: "linear-gradient(135deg, #fffbf0, #ffefd8)", border: "2px solid #e8b870", borderRadius: 12 }}>
                    <p style={{ fontSize: 14, fontWeight: "bold", color: "#7a4420", margin: "0 0 4px" }}>この食事は記録されていません</p>
                    <p style={{ fontSize: 13, color: "#a0632a", lineHeight: 1.6, margin: "0 0 12px" }}>記録を続けると、体調の変化に気づきやすくなります。</p>
                    <button onClick={goCheckout} style={{ width: "100%", padding: "12px", fontSize: 14, fontWeight: "bold", background: "#c17a3a", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: FONT }}>
                      続きを記録する（月額500円）
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* ═══ ホーム画面 ═══ */
          <>
            {/* ① 今日の状態 */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "16px", marginBottom: 12, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: "bold", color: "#5c3d1e" }}>
                  今日の状態
                </span>
                <span style={{ fontSize: 12, color: "#bbb" }}>
                  {selectedDateMealCount > 0 ? `${selectedDateMealCount}食分` : "まだ記録なし"}
                </span>
              </div>

              {/* Nutrient grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                <div style={{ textAlign: "center", padding: "10px 8px", background: "#f0f7ff", borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: "#888" }}>💧 水分</div>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: "#1565c0" }}>
                    {todayStats.totalWater}<span style={{ fontSize: 12, fontWeight: "normal" }}>ml</span>
                  </div>
                </div>
                <div style={{
                  textAlign: "center", padding: "10px 8px",
                  background: todayStats.totalSodium <= 2100 ? "#e8f5e9" : todayStats.totalSodium <= 3150 ? "#fff8e1" : "#fff3f0",
                  borderRadius: 10,
                }}>
                  <div style={{ fontSize: 11, color: "#888" }}>🧂 ナトリウム</div>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: todayStats.totalSodium <= 2100 ? "#1b5e20" : todayStats.totalSodium <= 3150 ? "#e65100" : "#bf360c" }}>
                    {todayStats.totalSodium}<span style={{ fontSize: 12, fontWeight: "normal" }}>mg</span>
                  </div>
                </div>
                <div style={{
                  textAlign: "center", padding: "10px 8px",
                  background: todayStats.totalPotassium <= 1200 ? "#e8f5e9" : todayStats.totalPotassium <= 1650 ? "#fff8e1" : "#fff3f0",
                  borderRadius: 10,
                }}>
                  <div style={{ fontSize: 11, color: "#888" }}>🥦 カリウム</div>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: todayStats.totalPotassium <= 1200 ? "#388e3c" : todayStats.totalPotassium <= 1650 ? "#e65100" : "#bf360c" }}>
                    {todayStats.totalPotassium}<span style={{ fontSize: 12, fontWeight: "normal" }}>mg</span>
                  </div>
                </div>
                <div style={{
                  textAlign: "center", padding: "10px 8px",
                  background: todayStats.totalPhosphorus <= 500 ? "#f8f0ff" : todayStats.totalPhosphorus <= 660 ? "#fff8e1" : "#fff3f0",
                  borderRadius: 10,
                }}>
                  <div style={{ fontSize: 11, color: "#888" }}>🦴 リン</div>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: todayStats.totalPhosphorus <= 500 ? "#7b1fa2" : todayStats.totalPhosphorus <= 660 ? "#e65100" : "#bf360c" }}>
                    {todayStats.totalPhosphorus}<span style={{ fontSize: 12, fontWeight: "normal" }}>mg</span>
                  </div>
                </div>
              </div>

              {/* Vitals */}
              {(selectedDate === today || isPremium) && (
                <div style={{ borderTop: "1px solid #f5ede0", paddingTop: 12 }}>
                  <div style={{ fontSize: 12, color: "#aaa", marginBottom: 8 }}>バイタル（任意）</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <label style={{ fontSize: 11, color: "#aaa", display: "block", marginBottom: 3 }}>体重 (kg)</label>
                      <input type="number" inputMode="decimal" step="0.1" placeholder="58.5"
                        value={vitalsInput.weight}
                        onChange={(e) => setVitalsInput(v => ({ ...v, weight: e.target.value }))}
                        onBlur={handleVitalsSave}
                        style={{ width: "100%", padding: "8px 10px", fontSize: 15, border: "1.5px solid #e8ddd0", borderRadius: 8, fontFamily: FONT, boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "#aaa", display: "block", marginBottom: 3 }}>脈拍 (bpm)</label>
                      <input type="number" inputMode="numeric" placeholder="72"
                        value={vitalsInput.pulse}
                        onChange={(e) => setVitalsInput(v => ({ ...v, pulse: e.target.value }))}
                        onBlur={handleVitalsSave}
                        style={{ width: "100%", padding: "8px 10px", fontSize: 15, border: "1.5px solid #e8ddd0", borderRadius: 8, fontFamily: FONT, boxSizing: "border-box" }}
                      />
                    </div>
                    <div style={{ gridColumn: "span 2" }}>
                      <label style={{ fontSize: 11, color: "#aaa", display: "block", marginBottom: 3 }}>血圧 (mmHg)</label>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input type="number" inputMode="numeric" placeholder="上 130"
                          value={vitalsInput.bpSys}
                          onChange={(e) => setVitalsInput(v => ({ ...v, bpSys: e.target.value }))}
                          onBlur={handleVitalsSave}
                          style={{ flex: 1, padding: "8px 10px", fontSize: 15, border: "1.5px solid #e8ddd0", borderRadius: 8, fontFamily: FONT }}
                        />
                        <span style={{ fontSize: 14, color: "#aaa" }}>/</span>
                        <input type="number" inputMode="numeric" placeholder="下 80"
                          value={vitalsInput.bpDia}
                          onChange={(e) => setVitalsInput(v => ({ ...v, bpDia: e.target.value }))}
                          onBlur={handleVitalsSave}
                          style={{ flex: 1, padding: "8px 10px", fontSize: 15, border: "1.5px solid #e8ddd0", borderRadius: 8, fontFamily: FONT }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ② 今日のひとこと */}
            <div style={{ background: "#fdf5eb", borderRadius: 14, padding: "14px 16px", marginBottom: 14, border: "1px solid #f0ddb0" }}>
              <div style={{ fontSize: 12, color: "#c17a3a", fontWeight: "bold", marginBottom: 6 }}>💬 今日のひとこと</div>
              <p style={{ fontSize: 15, color: "#5c3d1e", lineHeight: 1.85, margin: 0, whiteSpace: "pre-line" }}>
                {getDailyComment()}
              </p>
            </div>

            {/* ③ CTA */}
            {!isInputLocked ? (
              

              
  {!isInputLocked ? (
  <div>
    <div style={{ marginBottom: "12px" }}>
      <button
        onClick={() => alert("自由入力はこれから作ります")}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          background: "#fff",
          cursor: "pointer"
        }}
      >
        自由入力で追加
      </button>
    </div>

    <button
      onClick={() => setShowRecorder(true)}
      style={{
        width: "100%",
        padding: "18px",
        fontSize: 18,
        fontWeight: "bold",
        background: "linear-gradient(135deg, #22c55e, #16a34a)",
        color: "#fff",
        border: "none",
        borderRadius: 12,
        cursor: "pointer",
        marginBottom: 16,
        boxShadow: "0 4px 14px rgba(46,125,50,0.28)",
      }}
    >
      ＋ 食事を記録する
    </button>
  </div>
    
            ) : (
              <div style={{ textAlign: "center", padding: "12px 0 16px", color: "#aaa", fontSize: 13 }}>
                🔒 この日の記録は有料プランでご利用いただけます
              </div>
            )}

            {/* Upsell banner */}
            {showPremiumActivated && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, padding: "10px 14px", marginBottom: 14, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 12 }}>
                <p style={{ fontSize: 13, color: "#166534", fontWeight: "bold", margin: 0 }}>✓ プレミアムプランが有効になりました</p>
                <button onClick={() => setShowPremiumActivated(false)} style={{ fontSize: 16, color: "#166534", background: "none", border: "none", cursor: "pointer", lineHeight: 1, padding: 0 }}>×</button>
              </div>
            )}
            {!isPremium && (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", marginBottom: 6, background: "#fffbf0", border: "1px solid #f0ddb0", borderRadius: 12 }}>
                  <p style={{ fontSize: 12, color: "#8a6020", lineHeight: 1.5, margin: 0, flex: 1 }}>
                    無理なく続けられる<br />記録を応援します
                  </p>
                  <button onClick={goCheckout} style={{ flexShrink: 0, padding: "8px 12px", fontSize: 11, fontWeight: "bold", background: "#c17a3a", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontFamily: FONT, lineHeight: 1.5 }}>
                    有料プランを見る
                  </button>
                </div>
                <div style={{ textAlign: "right", marginBottom: 14 }}>
                  <button onClick={unlockPremium} style={{ fontSize: 11, color: "#aaa", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: FONT }}>
                    購入済みの方はこちら
                  </button>
                </div>
              </>
            )}
            {isPremium && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "10px 14px", marginBottom: 14, background: "#fffbf0", border: "1px solid #f0ddb0", borderRadius: 12 }}>
                <p style={{ fontSize: 12, color: "#8a6020", lineHeight: 1.5, margin: 0, flex: 1 }}>
                  無理なく続けられる<br />記録を応援します
                </p>
                <button disabled style={{ flexShrink: 0, padding: "8px 12px", fontSize: 11, fontWeight: "bold", background: "#a0c8a0", color: "#fff", border: "none", borderRadius: 8, cursor: "default", fontFamily: FONT, lineHeight: 1.5 }}>
                  プレミアム利用中
                </button>
              </div>
            )}

            {/* ④ 今日の食事一覧 */}
            {historyByDate[selectedDate] && historyByDate[selectedDate].length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 14, fontWeight: "bold", color: "#5c3d1e", marginBottom: 10 }}>
                  🍽 {formatDateLabel(selectedDate, today)}の食事記録
                </div>
                {historyByDate[selectedDate].map((meal) => (
                  <div key={meal.id} style={{ background: "#fff", borderRadius: 12, padding: "14px", marginBottom: 8, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", border: "1px solid #f0e8d8" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <p style={{ fontSize: 14, color: "#3d2010", lineHeight: 1.6, margin: 0, flex: 1 }}>
                        {meal.items.map((f: any) => f.name).join("、")}
                      </p>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        style={{ flexShrink: 0, width: 28, height: 28, borderRadius: "50%", background: "#fff0f0", border: "1px solid #ffd0d0", fontSize: 14, color: "#e07070", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        aria-label="削除"
                      >×</button>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10, paddingTop: 10, borderTop: "1px solid #f5ede0" }}>
                      <div style={{ background: "#f0f7ff", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#888" }}>💧 水分</div>
                        <div style={{ fontSize: 15, fontWeight: "bold", color: "#1565c0" }}>{meal.total.water}<span style={{ fontSize: 11, fontWeight: "normal" }}>ml</span></div>
                      </div>
                      <div style={{ background: "#fff8e8", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#888" }}>🧂 ナトリウム</div>
                        <div style={{ fontSize: 15, fontWeight: "bold", color: "#5c3d1e" }}>{meal.total.sodium}<span style={{ fontSize: 11, fontWeight: "normal" }}>mg</span></div>
                      </div>
                      <div style={{ background: meal.total.potassium > 550 ? "#fff3e0" : "#f1f8e9", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#888" }}>🥦 カリウム</div>
                        <div style={{ fontSize: 15, fontWeight: "bold", color: meal.total.potassium > 550 ? "#e65100" : "#388e3c" }}>{meal.total.potassium}<span style={{ fontSize: 11, fontWeight: "normal" }}>mg</span></div>
                      </div>
                      <div style={{ background: meal.total.phosphorus > 220 ? "#fff3e0" : "#f8f0ff", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#888" }}>🦴 リン</div>
                        <div style={{ fontSize: 15, fontWeight: "bold", color: meal.total.phosphorus > 220 ? "#e65100" : "#7b1fa2" }}>{meal.total.phosphorus}<span style={{ fontSize: 11, fontWeight: "normal" }}>mg</span></div>
                      </div>
                    </div>
                    {meal.overall && (
                      <div style={{ marginTop: 10 }}>
                        <span style={{ display: "inline-block", fontSize: 12, fontWeight: "bold", color: STATUS[meal.overall].text, background: STATUS[meal.overall].bg, border: `1px solid ${STATUS[meal.overall].border}`, padding: "3px 10px", borderRadius: 6 }}>
                          {STATUS[meal.overall].icon} {STATUS[meal.overall].label}
                        </span>
                        {meal.advice && (
                          <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6, margin: "6px 0 0" }}>{meal.advice}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ⑤ カレンダー */}
            <CalendarPicker
              selectedDate={selectedDate}
              today={today}
              mealHistory={mealHistory}
              labRecords={labRecords}
              onSelectDate={handleSelectDate}
            />

            {/* 直近平均 */}
            {(avg3.totalSodium > 0 || avg7.totalSodium > 0) && (
              <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 13, fontWeight: "bold", color: "#5c3d1e", marginBottom: 10 }}>📊 直近の平均（1日あたり）</div>
                {[{ label: "直近3日", data: avg3 }, { label: "直近7日", data: avg7 }].map(({ label, data }) => (
                  <div key={label} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 10px", padding: "8px 0", borderBottom: label === "直近3日" ? "1px solid #f5ede0" : "none" }}>
                    <span style={{ width: 60, fontSize: 13, color: "#888", flexShrink: 0 }}>{label}</span>
                    <span style={{ fontSize: 13, color: "#1565c0" }}>💧 {data.totalWater}ml</span>
                    <span style={{ fontSize: 13, color: "#5c3d1e" }}>🧂 {data.totalSodium}mg</span>
                    <span style={{ fontSize: 13, color: "#388e3c" }}>K {data.totalPotassium}mg</span>
                    <span style={{ fontSize: 13, color: "#7b1fa2" }}>P {data.totalPhosphorus}mg</span>
                  </div>
                ))}
              </div>
            )}

            {/* 検査データ */}
            <div style={{ background: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
              <button
                onClick={() => { setShowLabForm(v => !v); setLabInput({ date: today, potassium: "", phosphorus: "" }); }}
                style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: FONT }}
              >
                <span style={{ fontSize: 13, fontWeight: "bold", color: "#5c3d1e" }}>🔬 検査データを記録する</span>
                <span style={{ fontSize: 18, color: "#bbb" }}>{showLabForm ? "▲" : "▼"}</span>
              </button>
              {showLabForm && (
                <div style={{ marginTop: 12 }}>
                  {[
                    { key: "date",       label: "検査日",              type: "date",   placeholder: "" },
                    { key: "potassium",  label: "カリウム K（mEq/L）", type: "number", placeholder: "例: 5.2" },
                    { key: "phosphorus", label: "リン P（mg/dL）",     type: "number", placeholder: "例: 5.8" },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key} style={{ marginBottom: 10 }}>
                      <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>{label}</label>
                      <input
                        type={type}
                        value={labInput[key as keyof typeof labInput]}
                        onChange={(e) => setLabInput(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={placeholder}
                        style={{ width: "100%", padding: "10px 12px", fontSize: 16, border: "1.5px solid #e8ddd0", borderRadius: 8, fontFamily: FONT, boxSizing: "border-box" }}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const k = parseFloat(labInput.potassium);
                      const p = parseFloat(labInput.phosphorus);
                      if (!labInput.date || isNaN(k) || isNaN(p)) return;
                      saveLabRecord({ date: labInput.date, potassium: k, phosphorus: p });
                      setShowLabForm(false);
                      setLabRecords(getLabRecords().slice().reverse());
                      showToast("検査データを保存しました");
                    }}
                    style={{ width: "100%", padding: "12px", fontSize: 15, fontWeight: "bold", background: "#1565c0", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontFamily: FONT }}
                  >
                    保存する
                  </button>
                </div>
              )}
              {labRecords.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>検査結果の記録</div>
                  {(showAllLabRecords ? labRecords : labRecords.slice(0, 3)).map((lab) => (
                    <div key={lab.id} style={{ padding: "10px 12px", background: "#f8f4ff", borderRadius: 10, marginBottom: 6, border: "1px solid #e8ddf8" }}>
                      <div style={{ fontSize: 13, fontWeight: "bold", color: "#5c3d1e" }}>
                        🗓 {lab.date}　K: <span style={{ color: lab.potassium > 5.0 ? "#bf360c" : "#2e7d32" }}>{lab.potassium}</span>　P: <span style={{ color: lab.phosphorus > 6.0 ? "#bf360c" : "#2e7d32" }}>{lab.phosphorus}</span>
                      </div>
                    </div>
                  ))}
                  {labRecords.length > 3 && (
                    <button
                      onClick={() => setShowAllLabRecords(v => !v)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#aaa", padding: "4px 0", fontFamily: FONT, width: "100%", textAlign: "center" }}
                    >
                      {showAllLabRecords ? "折りたたむ ▲" : `過去の記録をすべて見る（${labRecords.length - 3}件） ▼`}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* 過去の履歴 */}
            {sortedDates.filter(d => d !== selectedDate).length > 0 && (
              <PastHistoryList
                sortedDates={sortedDates.filter(d => d !== selectedDate)}
                historyByDate={historyByDate}
                today={today}
                onSelectDate={handleSelectDate}
              />
            )}
          </>
        )}
      </div>

      {/* Portion picker */}
      {picker && (
        <PortionPicker btn={picker} onSelect={handlePortionSelect} onClose={() => setPicker(null)} />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)", background: "rgba(45,125,45,0.92)", color: "#fff", fontSize: 15, padding: "12px 22px", borderRadius: 28, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", whiteSpace: "nowrap", zIndex: 200, pointerEvents: "none" }}>
          ✅ {toast}
        </div>
      )}

    </main>
  );
}
