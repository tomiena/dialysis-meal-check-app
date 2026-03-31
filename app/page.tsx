"use client";

import { useState, useEffect, useRef } from "react";
import { FOODS, getFoodRisk } from "../lib/foods";
import { MealItem, judgeMeal, JudgeResult } from "../lib/judge";
import { generateAdvice } from "../lib/advice";
import {
  toDateStr, parseDateLocal,
  getMealHistory, saveMealHistory, deleteMealById,
  getDailyStatsFromHistory, getRecentAverageFromHistory, getMealsBeforeDateFromHistory,
  getLabRecords, saveLabRecord,
  type Meal, type LabRecord,
} from "../lib/storage";

// ─── 型定義 ──────────────────────────────────────────────
type Portion  = { label: string; grams: number };
type FoodBtn  = { foodId: string; emoji: string; label: string; portions: Portion[] };
type Category = { name: string; items: FoodBtn[]; warning?: string; showRiskLegend?: boolean };

// ─── 定数 ────────────────────────────────────────────────
const FONT = '"Hiragino Sans", "Meiryo", "Yu Gothic", sans-serif';

const STATUS = {
  ok:      { bg: "#e8f5e9", border: "#66bb6a", text: "#1b5e20", icon: "✅", label: "良好"   },
  caution: { bg: "#fff8e1", border: "#ffb300", text: "#e65100", icon: "⚠️", label: "注意"   },
  ng:      { bg: "#ffebee", border: "#ef5350", text: "#b71c1c", icon: "🔴", label: "多すぎ" },
};

// ─── カテゴリ定義 ─────────────────────────────────────────
const CATEGORIES: Category[] = [
  {
    name: "⭐ よく使う",
    items: [
      { foodId: "rice",      emoji: "🍚", label: "白米",    portions: [{ label:"1杯",   grams:150 },{ label:"半分",   grams:75  },{ label:"大盛",  grams:200 }] },
      { foodId: "miso_soup", emoji: "🥣", label: "みそ汁",  portions: [{ label:"1杯",   grams:150 },{ label:"半分",   grams:75  }] },
      { foodId: "egg",       emoji: "🥚", label: "卵",      portions: [{ label:"1個",   grams:60  },{ label:"2個",   grams:120 }] },
      { foodId: "tofu_m",    emoji: "⬜", label: "豆腐",    portions: [{ label:"半丁",  grams:150 },{ label:"1/4丁", grams:75  }] },
      { foodId: "chicken_b", emoji: "🍗", label: "鶏むね肉",portions: [{ label:"1切れ", grams:80  },{ label:"2切れ", grams:160 },{ label:"半分",  grams:40  }] },
      { foodId: "cabbage",   emoji: "🥬", label: "キャベツ",portions: [{ label:"1皿",   grams:80  },{ label:"たっぷり",grams:120 },{ label:"少量",  grams:40  }] },
      { foodId: "tomato",    emoji: "🍅", label: "トマト",  portions: [{ label:"1個",   grams:120 },{ label:"半分",   grams:60  }] },
      { foodId: "apple",     emoji: "🍎", label: "りんご",  portions: [{ label:"1/2個", grams:120 },{ label:"1/4個", grams:60  }] },
    ],
  },
  {
    name: "🍚 主食・麺",
    items: [
      { foodId: "rice",       emoji: "🍚", label: "白米",        portions: [{ label:"1杯",   grams:150 },{ label:"半分",  grams:75  },{ label:"大盛",  grams:200 }] },
      { foodId: "brown_rice", emoji: "🍚", label: "玄米",        portions: [{ label:"1杯",   grams:150 },{ label:"半分",  grams:75  }] },
      { foodId: "fried_rice", emoji: "🍳", label: "チャーハン",  portions: [{ label:"1杯",   grams:200 },{ label:"半分",  grams:100 }] },
      { foodId: "curry_rice", emoji: "🍛", label: "カレーライス",portions: [{ label:"1皿",   grams:250 },{ label:"半分",  grams:125 }] },
      { foodId: "bread",      emoji: "🍞", label: "食パン",      portions: [{ label:"1枚",   grams:60  },{ label:"2枚",   grams:120 }] },
      { foodId: "udon",       emoji: "🍜", label: "うどん",      portions: [{ label:"1杯",   grams:200 },{ label:"半分",  grams:100 }] },
      { foodId: "soba",       emoji: "🍝", label: "そば",        portions: [{ label:"1杯",   grams:200 },{ label:"半分",  grams:100 }] },
      { foodId: "ramen",      emoji: "🍜", label: "ラーメン",    portions: [{ label:"1杯",   grams:400 },{ label:"麺だけ",grams:200 }] },
      { foodId: "spaghetti",  emoji: "🍝", label: "スパゲティ",  portions: [{ label:"1人前", grams:200 },{ label:"半分",  grams:100 }] },
    ],
  },
  {
    name: "🥣 汁物",
    items: [
      { foodId: "miso_soup",    emoji: "🥣", label: "みそ汁",        portions: [{ label:"全部飲んだ",grams:150 },{ label:"半分",grams:75 },{ label:"残した",grams:20 }] },
      { foodId: "consomme",     emoji: "🍲", label: "コンソメスープ", portions: [{ label:"全部飲んだ",grams:150 },{ label:"半分",grams:75 },{ label:"残した",grams:20 }] },
      { foodId: "chinese_soup", emoji: "🍜", label: "中華スープ",     portions: [{ label:"全部飲んだ",grams:150 },{ label:"半分",grams:75 },{ label:"残した",grams:20 }] },
      { foodId: "potage",       emoji: "🥛", label: "ポタージュ",     portions: [{ label:"全部飲んだ",grams:150 },{ label:"半分",grams:75 },{ label:"残した",grams:20 }] },
      { foodId: "curry_liquid", emoji: "🍛", label: "カレー（汁）",   portions: [{ label:"全部",grams:150 },{ label:"半分",grams:75 },{ label:"少量",grams:40 }] },
      { foodId: "stew",         emoji: "🥘", label: "シチュー",       portions: [{ label:"全部",grams:150 },{ label:"半分",grams:75 },{ label:"少量",grams:40 }] },
    ],
    warning: "⚠️ カレー・シチューは塩分・脂質が多めです。飲む量を少なめにしましょう。",
    showRiskLegend: true,
  },
  {
    name: "🥤 飲み物",
    items: [
      { foodId: "water_drink", emoji: "💧", label: "水",        portions: [{ label:"コップ1杯",grams:200 },{ label:"半分",    grams:100 },{ label:"ペット小",grams:500 }] },
      { foodId: "green_tea",   emoji: "🍵", label: "お茶",      portions: [{ label:"コップ1杯",grams:200 },{ label:"半分",    grams:100 },{ label:"ペット小",grams:500 }] },
      { foodId: "coffee",      emoji: "☕", label: "コーヒー",  portions: [{ label:"1杯",      grams:150 },{ label:"大きめ",  grams:250 }] },
      { foodId: "beer",        emoji: "🍺", label: "アルコール",portions: [{ label:"中ジョッキ",grams:350 },{ label:"小",     grams:200 },{ label:"缶1本",  grams:350 }] },
    ],
  },
  {
    name: "🍖 肉類",
    items: [
      { foodId: "chicken_b",  emoji: "🍗", label: "鶏むね肉",portions: [{ label:"1切れ",  grams:80  },{ label:"2切れ",grams:160 },{ label:"半分",grams:40 }] },
      { foodId: "chicken_t",  emoji: "🍗", label: "鶏もも肉",portions: [{ label:"1切れ",  grams:80  },{ label:"2切れ",grams:160 }] },
      { foodId: "sasami",     emoji: "🍗", label: "鶏ささみ", portions: [{ label:"1本",    grams:60  },{ label:"2本",  grams:120 }] },
      { foodId: "pork_loin",  emoji: "🥩", label: "豚ロース", portions: [{ label:"1切れ",  grams:80  },{ label:"2切れ",grams:160 }] },
      { foodId: "pork_belly", emoji: "🥩", label: "豚バラ",   portions: [{ label:"1切れ",  grams:80  },{ label:"2切れ",grams:160 }] },
      { foodId: "beef",       emoji: "🥩", label: "牛もも肉", portions: [{ label:"1切れ",  grams:80  },{ label:"2切れ",grams:160 }] },
      { foodId: "beef_belly", emoji: "🥩", label: "牛バラ",   portions: [{ label:"1切れ",  grams:80  },{ label:"2切れ",grams:160 }] },
      { foodId: "minced",     emoji: "🥩", label: "ひき肉",   portions: [{ label:"大さじ3",grams:50  },{ label:"100g",grams:100 }] },
    ],
    showRiskLegend: true,
  },
  {
    name: "🐟 魚類",
    items: [
      { foodId: "salmon",      emoji: "🐟", label: "さけ（生）",portions: [{ label:"1切れ",grams:80  },{ label:"2切れ",grams:160 }] },
      { foodId: "salmon_salt", emoji: "🐟", label: "塩さけ",    portions: [{ label:"1切れ",grams:80  },{ label:"2切れ",grams:160 }] },
      { foodId: "mackerel",    emoji: "🐟", label: "さば",      portions: [{ label:"1切れ",grams:80  },{ label:"2切れ",grams:160 }] },
      { foodId: "aji",         emoji: "🐟", label: "あじ",      portions: [{ label:"1尾",  grams:80  },{ label:"2尾",  grams:160 }] },
      { foodId: "iwashi",      emoji: "🐟", label: "いわし",    portions: [{ label:"1尾",  grams:80  },{ label:"2尾",  grams:160 }] },
      { foodId: "tuna",        emoji: "🐠", label: "まぐろ",    portions: [{ label:"1切れ",grams:80  },{ label:"2切れ",grams:160 }] },
      { foodId: "buri",        emoji: "🐟", label: "ぶり",      portions: [{ label:"1切れ",grams:80  },{ label:"2切れ",grams:160 }] },
      { foodId: "tai",         emoji: "🐟", label: "たい",      portions: [{ label:"1切れ",grams:80  },{ label:"2切れ",grams:160 }] },
      { foodId: "shrimp",      emoji: "🦐", label: "えび",      portions: [{ label:"5尾",  grams:80  },{ label:"10尾", grams:160 }] },
    ],
    showRiskLegend: true,
  },
  {
    name: "🥚 卵・豆腐",
    items: [
      { foodId: "egg",    emoji: "🥚", label: "卵",     portions: [{ label:"1個",    grams:60  },{ label:"2個",    grams:120 }] },
      { foodId: "tofu_m", emoji: "⬜", label: "豆腐",   portions: [{ label:"半丁",   grams:150 },{ label:"1/4丁",  grams:75  }] },
      { foodId: "tofu_k", emoji: "⬜", label: "絹豆腐", portions: [{ label:"半丁",   grams:150 },{ label:"1/4丁",  grams:75  }] },
      { foodId: "natto",  emoji: "🫘", label: "納豆",   portions: [{ label:"1パック",grams:40  },{ label:"2パック",grams:80  }] },
    ],
  },
  {
    name: "🥦 野菜",
    items: [
      { foodId: "cabbage",      emoji: "🥬", label: "キャベツ",    portions: [{ label:"1皿",   grams:80  },{ label:"たっぷり",grams:120 },{ label:"少量",  grams:40  }] },
      { foodId: "cucumber",     emoji: "🥒", label: "きゅうり",    portions: [{ label:"1本",   grams:100 },{ label:"半分",    grams:50  }] },
      { foodId: "tomato",       emoji: "🍅", label: "トマト",      portions: [{ label:"1個",   grams:120 },{ label:"半分",    grams:60  }] },
      { foodId: "broccoli",     emoji: "🥦", label: "ブロッコリー",portions: [{ label:"1房",   grams:80  },{ label:"2房",     grams:160 }] },
      { foodId: "lettuce",      emoji: "🥗", label: "レタス",      portions: [{ label:"1枚",   grams:30  },{ label:"3枚",     grams:90  }] },
      { foodId: "moyashi",      emoji: "🌱", label: "もやし",      portions: [{ label:"1皿",   grams:80  },{ label:"半袋",    grams:100 }] },
      { foodId: "eggplant",     emoji: "🍆", label: "なす",        portions: [{ label:"1本",   grams:80  },{ label:"半分",    grams:40  }] },
      { foodId: "green_pepper", emoji: "🫑", label: "ピーマン",    portions: [{ label:"1個",   grams:35  },{ label:"2個",     grams:70  }] },
      { foodId: "daikon",       emoji: "🤍", label: "大根",        portions: [{ label:"1皿",   grams:80  },{ label:"厚切り",  grams:120 }] },
      { foodId: "onion",        emoji: "🧅", label: "玉ねぎ",      portions: [{ label:"1/2個", grams:80  },{ label:"1個",     grams:160 }] },
      { foodId: "shiitake",     emoji: "🍄", label: "しいたけ",    portions: [{ label:"2枚",   grams:40  },{ label:"4枚",     grams:80  }] },
      { foodId: "enoki",        emoji: "🍄", label: "えのき",      portions: [{ label:"1袋",   grams:100 },{ label:"半袋",    grams:50  }] },
      { foodId: "komatsuna",    emoji: "🌿", label: "小松菜",      portions: [{ label:"1皿",   grams:80  },{ label:"たっぷり",grams:120 }] },
      { foodId: "corn",         emoji: "🌽", label: "とうもろこし",portions: [{ label:"1/2本", grams:120 },{ label:"1本",     grams:240 }] },
      { foodId: "carrot",       emoji: "🥕", label: "にんじん",    portions: [{ label:"1/3本", grams:50  },{ label:"1/2本",   grams:80  }] },
      { foodId: "pumpkin",      emoji: "🎃", label: "かぼちゃ",    portions: [{ label:"1切れ", grams:80  },{ label:"2切れ",   grams:160 }] },
      { foodId: "potato",       emoji: "🥔", label: "じゃがいも",  portions: [{ label:"1個",   grams:100 },{ label:"半分",    grams:50  }] },
      { foodId: "spinach",      emoji: "🌿", label: "ほうれん草",  portions: [{ label:"1皿",   grams:80  },{ label:"たっぷり",grams:120 }] },
      { foodId: "sweet_potato", emoji: "🍠", label: "さつまいも",  portions: [{ label:"1/3本", grams:80  },{ label:"半分",    grams:120 }] },
    ],
    showRiskLegend: true,
  },
  {
    name: "🍎 果物",
    items: [
      { foodId: "apple",      emoji: "🍎", label: "りんご",  portions: [{ label:"1/2個",grams:120 },{ label:"1/4個",grams:60  }] },
      { foodId: "mikan",      emoji: "🍊", label: "みかん",  portions: [{ label:"1個",  grams:100 },{ label:"2個",  grams:200 }] },
      { foodId: "pear",       emoji: "🍐", label: "なし",    portions: [{ label:"1/2個",grams:100 },{ label:"1/4個",grams:50  }] },
      { foodId: "peach",      emoji: "🍑", label: "もも",    portions: [{ label:"1個",  grams:200 },{ label:"半分", grams:100 }] },
      { foodId: "watermelon", emoji: "🍉", label: "すいか",  portions: [{ label:"1切れ",grams:150 },{ label:"2切れ",grams:300 }] },
      { foodId: "strawberry", emoji: "🍓", label: "いちご",  portions: [{ label:"5粒",  grams:75  },{ label:"10粒", grams:150 }] },
      { foodId: "grape",      emoji: "🍇", label: "ぶどう",  portions: [{ label:"一房", grams:150 },{ label:"半房", grams:75  }] },
      { foodId: "banana",     emoji: "🍌", label: "バナナ",  portions: [{ label:"1本",  grams:100 },{ label:"半分", grams:50  }] },
      { foodId: "kiwi",       emoji: "🥝", label: "キウイ",  portions: [{ label:"1個",  grams:100 },{ label:"半分", grams:50  }] },
      { foodId: "melon",      emoji: "🍈", label: "メロン",  portions: [{ label:"1切れ",grams:100 },{ label:"2切れ",grams:200 }] },
    ],
    showRiskLegend: true,
  },
  {
    name: "🍱 調理済み",
    items: [
      { foodId: "karaage",    emoji: "🍗", label: "から揚げ",  portions: [{ label:"3個",  grams:90  },{ label:"5個",  grams:150 }] },
      { foodId: "yakizakana", emoji: "🐟", label: "焼き魚",    portions: [{ label:"1切れ",grams:80  },{ label:"2切れ",grams:160 }] },
      { foodId: "hamburger",  emoji: "🍔", label: "ハンバーグ",portions: [{ label:"1個",  grams:120 },{ label:"半分", grams:60  }] },
      { foodId: "tonkatsu",   emoji: "🥩", label: "とんかつ",  portions: [{ label:"1切れ",grams:100 },{ label:"2切れ",grams:200 }] },
      { foodId: "croquette",  emoji: "🥔", label: "コロッケ",  portions: [{ label:"1個",  grams:70  },{ label:"2個",  grams:140 }] },
    ],
    warning: "⚠️ 調理方法により塩分・脂質が増えることがあります。食べる量に気をつけましょう。",
    showRiskLegend: true,
  },
  {
    name: "🥫 加工食品",
    items: [
      { foodId: "ham",    emoji: "🍖", label: "ハム",      portions: [{ label:"1枚",grams:20 },{ label:"3枚",grams:60 }] },
      { foodId: "wiener", emoji: "🌭", label: "ウインナー",portions: [{ label:"1本",grams:20 },{ label:"3本",grams:60 }] },
      { foodId: "bacon",  emoji: "🥓", label: "ベーコン",  portions: [{ label:"1枚",grams:20 },{ label:"3枚",grams:60 }] },
    ],
    warning: "🔴 塩分がとても多い食品です。少量でも塩分が高くなります。食べすぎに注意してください。",
    showRiskLegend: true,
  },
  {
    name: "🧂 調味料",
    items: [
      { foodId: "soy_tbsp",  emoji: "🍶", label: "醤油",      portions: [{ label:"少々",   grams:5   },{ label:"小さじ1",grams:6  },{ label:"大さじ1",grams:18 }] },
      { foodId: "miso_tbsp", emoji: "🟤", label: "みそ",      portions: [{ label:"小さじ1",grams:6   },{ label:"大さじ1",grams:18 }] },
      { foodId: "salt_tsp",  emoji: "🧂", label: "塩",        portions: [{ label:"少々",   grams:1   },{ label:"小さじ1",grams:6  }] },
      { foodId: "milk",      emoji: "🥛", label: "牛乳",      portions: [{ label:"1杯",    grams:200 },{ label:"半分",   grams:100 }] },
      { foodId: "cheese",    emoji: "🧀", label: "チーズ",    portions: [{ label:"1枚",    grams:20  },{ label:"2枚",    grams:40  }] },
      { foodId: "yogurt",    emoji: "🫙", label: "ヨーグルト",portions: [{ label:"1個",    grams:100 },{ label:"半分",   grams:50  }] },
    ],
  },
];

// ─── ユーティリティ ───────────────────────────────────────

/** "YYYY-MM-DD" → 表示用の日付文字列 */
function formatDateLabel(dateStr: string, todayStr: string): string {
  const d = parseDateLocal(dateStr);
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
  const dow = dayNames[d.getDay()];
  const yesterday = toDateStr(new Date(new Date().setDate(new Date().getDate() - 1)));
  if (dateStr === todayStr)    return `今日（${dow}）`;
  if (dateStr === yesterday)   return `昨日（${dow}）`;
  return `${d.getMonth() + 1}月${d.getDate()}日（${dow}）`;
}

// ─── FoodButton ───────────────────────────────────────────
function FoodButton({ btn, onTap }: { btn: FoodBtn; onTap: () => void }) {
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
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={onTap}
      style={{
        position: "relative",
        background: "#fff",
        border: `2px solid ${borderColor}`,
        borderRadius: 14,
        padding: "16px 8px 12px",
        cursor: "pointer",
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
      <span style={{ fontSize: 44, lineHeight: 1 }}>{btn.emoji}</span>
      <span style={{ fontSize: 15, fontWeight: "bold", color: "#3d2010", textAlign: "center", lineHeight: 1.3 }}>
        {btn.label}
      </span>
      <span style={{ fontSize: 12, color: "#c0b0a0" }}>{btn.portions[0].label}〜</span>
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
          <div style={{ fontSize: 52 }}>{btn.emoji}</div>
          <div style={{ fontSize: 20, fontWeight: "bold", color: "#3d2010", marginTop: 6 }}>{btn.label}</div>
          {(risk.sodium || risk.potassium) && (
            <div style={{
              display: "inline-block", marginTop: 6, fontSize: 13,
              color: risk.sodium ? "#e53935" : "#e65100",
              background: risk.sodium ? "#ffebee" : "#fff3e0",
              padding: "3px 10px", borderRadius: 8,
            }}>
              {risk.sodium ? "⚠️ 塩分が多め" : "⚠️ カリウムが多め"}
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
                padding: "16px 8px",
                background: "#fdf5eb",
                border: "2px solid #e8c898",
                borderRadius: 12,
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              <div style={{ fontSize: 17, fontWeight: "bold", color: "#3d2010" }}>{p.label}</div>
              <div style={{ fontSize: 13, color: "#aaa", marginTop: 2 }}>{p.grams}g</div>
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          style={{
            width: "100%", padding: "13px",
            background: "transparent", border: "none",
            fontSize: 16, color: "#aaa",
            cursor: "pointer", fontFamily: FONT,
          }}
        >
          キャンセル
        </button>
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
      padding: "14px 16px", marginBottom: 10,
      background: s.bg, border: `1.5px solid ${s.border}`, borderRadius: 10,
    }}>
      <span style={{ fontSize: 17, color: "#333", fontFamily: FONT }}>{icon} {name}</span>
      <span style={{ fontSize: 16, fontWeight: "bold", color: s.text, fontFamily: FONT }}>
        {value}mg　{s.icon} {s.label}
      </span>
    </div>
  );
}

// ─── メインコンポーネント ─────────────────────────────────
export default function Home() {
  const [tab,    setTab]    = useState(0);
  const [items,  setItems]  = useState<MealItem[]>([]);
  const [picker, setPicker] = useState<FoodBtn | null>(null);
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [advice, setAdvice] = useState("");
  const [toast,  setToast]  = useState("");

  const resultRef = useRef<HTMLDivElement>(null);
  const today = toDateStr();

  // 記録日（デフォルト：今日）
  const [selectedDate, setSelectedDate] = useState<string>(today);

  // 食事履歴（新形式）
  const [mealHistory,  setMealHistory]  = useState<Meal[]>([]);
  // 検査データ
  const [labRecords,   setLabRecords]   = useState<LabRecord[]>([]);
  const [showLabForm,  setShowLabForm]  = useState(false);
  const [labInput,     setLabInput]     = useState({ date: today, potassium: "", phosphorus: "" });

  // 課金状態（'free' | 'active'）
  const [subscriptionStatus, setSubscriptionStatus] = useState<"free" | "active">("free");
  // 制限モーダル表示フラグ
  const [showLimitModal, setShowLimitModal] = useState(false);

  // ─ 初回ロード ─
  function loadData() {
    setMealHistory(getMealHistory());
    setLabRecords(getLabRecords().slice().reverse().slice(0, 3));
  }
  useEffect(() => { loadData(); }, []);

  // ─ 派生計算（mealHistoryから算出） ─
  const todayStats = getDailyStatsFromHistory(selectedDate, mealHistory);
  const avg3       = getRecentAverageFromHistory(3, mealHistory);
  const avg7       = getRecentAverageFromHistory(7, mealHistory);

  // ─ トースト ─
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  // ─ 食品追加 ─
  const handlePortionSelect = (grams: number, portionLabel: string) => {
    if (!picker) return;
    const food = FOODS.find((f) => f.id === picker.foodId);
    if (!food) return;
    setItems((prev) => [...prev, { food, amount: grams }]);
    setResult(null);
    setAdvice("");
    showToast(`${picker.label}（${portionLabel}）を追加しました`);
    setPicker(null);
  };

  const removeItem = (i: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
    setResult(null);
    setAdvice("");
  };

  const handleReset = () => {
    setItems([]);
    setResult(null);
    setAdvice("");
    setTab(0);
  };

  const cat = CATEGORIES[tab];

  // ─ リアルタイム水分・塩分計算 ─
  const totalWater = Math.round(
    items.reduce((sum, item) => sum + item.food.water * item.amount / 100, 0)
  );
  const totalSalt = Math.round(
    items.reduce((sum, item) => sum + item.food.sodium * item.amount / 100 * 2.54 / 1000 * 10, 0)
  ) / 10;

  // 有料かどうか
  const isPremium = subscriptionStatus === "active";
  // 選択日の保存済み食事数（無料制限チェック用）
  const selectedDateMealCount = mealHistory.filter((m) => m.date === selectedDate).length;

  // ─ 判定・保存 ─
  const handleJudge = () => {
    if (items.length === 0) return;
    const r = judgeMeal(items);
    setResult(r);
    setAdvice(generateAdvice(r));

    // 無料ユーザーが1日3食を超える場合は保存しない
    if (!isPremium && selectedDateMealCount >= 3) {
      setShowLimitModal(true);
    } else {
      // 新形式で保存（items: Food[]、amount は含まない）
      saveMealHistory({
        date: selectedDate,
        items: items.map((i) => i.food),
        total: {
          water:      totalWater,
          salt:       totalSalt,
          potassium:  r.potassium.value,
          phosphorus: r.phosphorus.value,
        },
      });
      setMealHistory(getMealHistory());
    }
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  // ─ 履歴削除 ─
  const handleDeleteMeal = (id: string) => {
    deleteMealById(id);
    setMealHistory((prev) => prev.filter((m) => m.id !== id));
  };

  // ─ 水分・塩分ステータス ─
  const waterStatus = totalWater >= 1500 ? "ok" : totalWater >= 1000 ? "caution" : "low";
  const saltStatus  = totalSalt  <= 6    ? "ok" : totalSalt  <= 8    ? "caution" : "high";

  const waterColor = waterStatus === "ok" ? "#1b5e20" : waterStatus === "caution" ? "#e65100" : "#b71c1c";
  const saltColor  = saltStatus  === "ok" ? "#1b5e20" : saltStatus  === "caution" ? "#e65100" : "#b71c1c";

  // ─ 相関コメント ─
  function getCorrelationComment(): { text: string; color: string } | null {
    if (items.length === 0) return null;
    if (waterStatus === "ok" && saltStatus === "high")
      return { text: "塩分が原因で水分が増えている可能性があります", color: "#c62828" };
    if (waterStatus === "low" && saltStatus !== "ok")
      return { text: "脱水＋高塩分のリスクがあります。水分補給にも注意を", color: "#c62828" };
    if (saltStatus !== "ok")
      return { text: "塩分が多く、水分が増えやすい状態です", color: "#e65100" };
    if (waterStatus !== "low" && saltStatus === "ok")
      return { text: "バランス良好です", color: "#2e7d32" };
    return null;
  }
  const correlation = getCorrelationComment();

  // ─ 履歴：日付ごとグループ化（新しい順） ─
  const historyByDate = mealHistory
    .slice()
    .reverse()
    .reduce<Record<string, Meal[]>>((acc, meal) => {
      if (!acc[meal.date]) acc[meal.date] = [];
      acc[meal.date].push(meal);
      return acc;
    }, {});
  const sortedDates = Object.keys(historyByDate).sort((a, b) => b.localeCompare(a));

  return (
    <main style={{ maxWidth: 500, margin: "0 auto", fontFamily: FONT, background: "#fdf8f0", minHeight: "100vh" }}>

      {/* ─── 固定ヘッダー ─── */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #f0e8d8",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ textAlign: "center", padding: "14px 16px 8px" }}>
          <h1 style={{ fontSize: 20, fontWeight: "bold", color: "#3d2010" }}>🍱 食事チェック</h1>
          <p style={{ fontSize: 12, color: "#bbb", marginTop: 1 }}>食べたものをタップして選んでください</p>
        </div>

        {/* 水分・塩分サマリーバー */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 16,
          padding: "8px 16px 10px",
          borderTop: "1px solid #f5ede0",
        }}>
          <div style={{
            flex: 1, maxWidth: 200, textAlign: "center", padding: "8px 12px",
            background: waterStatus === "ok" ? "#e8f5e9" : waterStatus === "caution" ? "#fff8e1" : "#ffebee",
            border: `1.5px solid ${waterStatus === "ok" ? "#81c784" : waterStatus === "caution" ? "#ffb300" : "#ef9a9a"}`,
            borderRadius: 10,
          }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>💧 今回の水分</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: waterColor, lineHeight: 1 }}>
              {totalWater}<span style={{ fontSize: 13, fontWeight: "normal" }}>ml</span>
            </div>
            <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>
              {waterStatus === "ok" ? "適正" : waterStatus === "caution" ? "やや少ない" : "少なめ"}
            </div>
          </div>
          <div style={{
            flex: 1, maxWidth: 200, textAlign: "center", padding: "8px 12px",
            background: saltStatus === "ok" ? "#e8f5e9" : saltStatus === "caution" ? "#fff8e1" : "#ffebee",
            border: `1.5px solid ${saltStatus === "ok" ? "#81c784" : saltStatus === "caution" ? "#ffb300" : "#ef9a9a"}`,
            borderRadius: 10,
          }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>🧂 今回の塩分</div>
            <div style={{ fontSize: 22, fontWeight: "bold", color: saltColor, lineHeight: 1 }}>
              {totalSalt.toFixed(1)}<span style={{ fontSize: 13, fontWeight: "normal" }}>g</span>
            </div>
            <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>
              {saltStatus === "ok" ? "適正（6g以下）" : saltStatus === "caution" ? "やや多い" : "多すぎ"}
            </div>
          </div>
        </div>

        {/* 相関コメント */}
        {correlation && (
          <div style={{
            padding: "6px 16px 10px",
            textAlign: "center",
            fontSize: 12,
            color: correlation.color,
            fontWeight: "bold",
          }}>
            {correlation.text}
          </div>
        )}
      </div>

      {/* ─── カテゴリタブ ─── */}
      <div style={{
        display: "flex",
        overflowX: "auto",
        background: "#fff",
        borderBottom: "2px solid #f0e8d8",
        position: "sticky",
        top: correlation ? 142 : 118,
        zIndex: 9,
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none",
      }}>
        {CATEGORIES.map((c, i) => (
          <button
            key={i}
            onClick={() => setTab(i)}
            style={{
              flex: "0 0 auto",
              padding: "11px 16px",
              fontSize: 15,
              fontWeight: tab === i ? "bold" : "normal",
              color: tab === i ? "#c17a3a" : "#888",
              background: "transparent",
              border: "none",
              borderBottom: tab === i ? "3px solid #c17a3a" : "3px solid transparent",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontFamily: FONT,
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* ─── コンテンツエリア ─── */}
      <div style={{ padding: "14px 12px 120px" }}>

        {/* ① 課金導線（上部・常設・無料ユーザーのみ） */}
        {!isPremium && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            padding: "11px 14px",
            marginBottom: 14,
            background: "#fffbf0",
            border: "1px solid #f0ddb0",
            borderRadius: 12,
          }}>
            <p style={{ fontSize: 12, color: "#8a6020", lineHeight: 1.5, margin: 0, flex: 1 }}>
              記録を続けると、<br />体調の変化に気づけます
            </p>
            <button
              onClick={async () => {
  const res = await fetch("/api/checkout", { method: "POST" });
  const data = await res.json();
  window.location.href = data.url;
}}
              style={{
                flexShrink: 0,
                padding: "8px 12px",
                fontSize: 11,
                fontWeight: "bold",
                background: "#c17a3a",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: FONT,
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              有料プラン<br />月額500円
            </button>
          </div>
        )}

        {/* カテゴリ注意メッセージ */}
        {cat.warning && (
          <div style={{
            marginBottom: 12,
            padding: "12px 14px",
            background: cat.warning.startsWith("🔴") ? "#fff0f0" : "#fff8e8",
            border: `1.5px solid ${cat.warning.startsWith("🔴") ? "#ffb3b3" : "#f0d080"}`,
            borderRadius: 10,
            fontSize: 13,
            color: "#5c3010",
            lineHeight: 1.6,
          }}>
            {cat.warning}
          </div>
        )}

        {/* リスク凡例 */}
        {cat.showRiskLegend && (
          <div style={{
            display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap",
            padding: "10px 12px",
            background: "#fffbf5",
            borderRadius: 10,
            border: "1px solid #f0e0c8",
          }}>
            <span style={{ fontSize: 12, color: "#888" }}>色の意味：</span>
            <span style={{ fontSize: 12, color: "#e53935", background: "#ffebee", padding: "2px 8px", borderRadius: 6 }}>塩分↑</span>
            <span style={{ fontSize: 12, color: "#e65100", background: "#fff3e0", padding: "2px 8px", borderRadius: 6 }}>K↑ カリウム多め</span>
            <span style={{ fontSize: 12, color: "#666" }}>　= 量に気をつけて</span>
          </div>
        )}

        {/* 食品ボタングリッド */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          {cat.items.map((btn, i) => (
            <FoodButton key={`${btn.foodId}-${i}`} btn={btn} onTap={() => setPicker(btn)} />
          ))}
        </div>

        {/* ─── 日付選択 ─── */}
        <div style={{
          background: "#fff",
          borderRadius: 14,
          padding: "12px 16px",
          marginBottom: 14,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}>
          <span style={{ fontSize: 13, fontWeight: "bold", color: "#5c3d1e", whiteSpace: "nowrap" }}>
            📅 記録日
          </span>
          <input
            type="date"
            value={selectedDate}
            max={today}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(e.target.value);
            }}
            style={{
              flex: 1,
              minWidth: 140,
              padding: "7px 10px",
              fontSize: 15,
              border: "1.5px solid #e8ddd0",
              borderRadius: 8,
              fontFamily: FONT,
              color: "#3d2010",
              background: "#fdf8f0",
            }}
          />
          {selectedDate !== today && (
            <button
              onClick={() => setSelectedDate(today)}
              style={{
                padding: "7px 14px",
                fontSize: 13,
                background: "#fdf5eb",
                border: "1.5px solid #e8c898",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: FONT,
                color: "#c17a3a",
                whiteSpace: "nowrap",
              }}
            >
              今日に戻す
            </button>
          )}
        </div>

        {/* 追加済み食品リスト */}
        {items.length > 0 && (
          <div style={{
            background: "#fff",
            borderRadius: 14,
            padding: "18px 16px",
            marginBottom: 14,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            <h2 style={{ fontSize: 16, fontWeight: "bold", color: "#5c3d1e", marginBottom: 14 }}>
              今回の食事　<span style={{ fontWeight: "normal", color: "#bbb", fontSize: 14 }}>{items.length}品</span>
            </h2>
            {items.map((item, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "11px 0",
                borderBottom: i < items.length - 1 ? "1px solid #f5ede0" : "none",
              }}>
                <span style={{ fontSize: 16, color: "#333" }}>{item.food.name}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 14, color: "#aaa" }}>{item.amount}g</span>
                  <button
                    onClick={() => removeItem(i)}
                    style={{
                      width: 32, height: 32,
                      borderRadius: "50%",
                      background: "#fff0f0",
                      border: "none",
                      fontSize: 18,
                      color: "#e07070",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >×</button>
                </div>
              </div>
            ))}
            <button
              onClick={handleJudge}
              style={{
                width: "100%", padding: "15px",
                fontSize: 18, fontWeight: "bold",
                background: "#2e7d32", color: "#fff",
                border: "none", borderRadius: 10,
                cursor: "pointer", marginTop: 16,
                fontFamily: FONT,
              }}
            >
              🔍　この食事を判定する
            </button>
          </div>
        )}

        {/* 空の状態 */}
        {items.length === 0 && !result && (
          <div style={{ textAlign: "center", padding: "28px 0", color: "#ccc" }}>
            <div style={{ fontSize: 52, marginBottom: 10 }}>👆</div>
            <p style={{ fontSize: 15, lineHeight: 1.9 }}>
              上のボタンをタップして<br />食べたものを選んでください
            </p>
          </div>
        )}

        {/* 判定結果 */}
        {result && (
          <div id="result" ref={resultRef} style={{
            background: "#fff",
            borderRadius: 14,
            padding: "20px 16px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            <div style={{
              textAlign: "center", padding: "18px", borderRadius: 12, marginBottom: 18,
              background: STATUS[result.overall].bg,
              border: `2px solid ${STATUS[result.overall].border}`,
            }}>
              <div style={{ fontSize: 44 }}>{STATUS[result.overall].icon}</div>
              <div style={{ fontSize: 21, fontWeight: "bold", color: STATUS[result.overall].text, marginTop: 6 }}>
                {result.overall === "ok"
                  ? "この食事はOKです！"
                  : result.overall === "caution"
                  ? "少し気をつけましょう"
                  : "調整が必要です"}
              </div>
            </div>
            <h3 style={{ fontSize: 14, color: "#aaa", marginBottom: 10 }}>栄養素ごとの結果</h3>
            <NutrientRow icon="🧂" name="塩分"    value={result.sodium.value}     status={result.sodium.status}     />
            <NutrientRow icon="🥦" name="カリウム" value={result.potassium.value}  status={result.potassium.status}  />
            <NutrientRow icon="🦴" name="リン"     value={result.phosphorus.value} status={result.phosphorus.status} />
            <div style={{
              marginTop: 18, padding: "16px 18px",
              background: "#fdf5eb",
              borderLeft: "4px solid #c17a3a",
              borderRadius: "0 10px 10px 0",
            }}>
              <div style={{ fontSize: 14, color: "#7a4420", fontWeight: "bold", marginBottom: 6 }}>💬 アドバイス</div>
              <p style={{ fontSize: 16, color: "#5c3d1e", lineHeight: 1.85, whiteSpace: "pre-line", margin: 0 }}>
                {advice}
              </p>
            </div>
            <p style={{ fontSize: 12, color: "#ccc", lineHeight: 1.7, marginTop: 14 }}>
              📌 1食の目安：塩分700mg以下 / カリウム550mg以下 / リン220mg以下<br />
              ※生活サポート情報です。詳細は担当医・管理栄養士にご確認ください
            </p>
            <button
              onClick={handleReset}
              style={{
                width: "100%", marginTop: 14, padding: "13px",
                fontSize: 16, fontWeight: "bold",
                background: "transparent", color: "#c17a3a",
                border: "2px solid #c17a3a", borderRadius: 10,
                cursor: "pointer", fontFamily: FONT,
              }}
            >
              🔄　最初からやり直す
            </button>

            {/* ② 課金導線（判定結果直後・無料ユーザーのみ） */}
            {!isPremium && (
              <div style={{
                marginTop: 16,
                padding: "18px 16px",
                background: "linear-gradient(135deg, #fffbf0 0%, #ffefd8 100%)",
                border: "2px solid #e8b870",
                borderRadius: 12,
              }}>
                <p style={{ fontSize: 14, fontWeight: "bold", color: "#7a4420", margin: "0 0 4px" }}>
                  ここから先は記録が残りません
                </p>
                <p style={{ fontSize: 13, color: "#a0632a", lineHeight: 1.6, margin: "0 0 14px" }}>
                  続けると体調の変化に気づけます
                </p>
                <button
                  onClick={async () => {
  const res = await fetch("/api/checkout", { method: "POST" });
  const data = await res.json();
  window.location.href = data.url;
}}
                  style={{
                    width: "100%",
                    padding: "14px",
                    fontSize: 15,
                    fontWeight: "bold",
                    background: "#c17a3a",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontFamily: FONT,
                  }}
                >
                  続きを記録する（月額500円）
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── 統計セクション ─── */}
        <div style={{ marginTop: 24 }}>

          {/* 選択日の合計（履歴データから再計算） */}
          <div style={{
            background: "#fff", borderRadius: 14,
            padding: "16px", marginBottom: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize: 13, fontWeight: "bold", color: "#5c3d1e", marginBottom: 10 }}>
              📅 {selectedDate === today ? "本日の合計" : `${formatDateLabel(selectedDate, today)}の合計`}
              {todayStats.mealCount > 0 && (
                <span style={{ fontWeight: "normal", fontSize: 12, color: "#bbb", marginLeft: 8 }}>
                  （{todayStats.mealCount}食分の記録）
                </span>
              )}
            </div>
            {todayStats.mealCount === 0 ? (
              <p style={{ fontSize: 13, color: "#ccc", textAlign: "center", padding: "8px 0" }}>
                まだ記録がありません
              </p>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{
                  flex: 1, textAlign: "center", padding: "10px 8px",
                  background: todayStats.totalWater >= 1500 ? "#e8f5e9" : todayStats.totalWater >= 1000 ? "#fff8e1" : "#ffebee",
                  borderRadius: 10,
                }}>
                  <div style={{ fontSize: 11, color: "#888" }}>💧 水分</div>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: "#1565c0" }}>
                    {todayStats.totalWater}<span style={{ fontSize: 12, fontWeight: "normal" }}>ml</span>
                  </div>
                </div>
                <div style={{
                  flex: 1, textAlign: "center", padding: "10px 8px",
                  background: todayStats.totalSalt <= 6 ? "#e8f5e9" : todayStats.totalSalt <= 8 ? "#fff8e1" : "#ffebee",
                  borderRadius: 10,
                }}>
                  <div style={{ fontSize: 11, color: "#888" }}>🧂 塩分</div>
                  <div style={{ fontSize: 20, fontWeight: "bold", color: "#5c3d1e" }}>
                    {todayStats.totalSalt.toFixed(1)}<span style={{ fontSize: 12, fontWeight: "normal" }}>g</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 直近平均 */}
          {(avg3.totalSalt > 0 || avg7.totalSalt > 0) && (
            <div style={{
              background: "#fff", borderRadius: 14,
              padding: "16px", marginBottom: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <div style={{ fontSize: 13, fontWeight: "bold", color: "#5c3d1e", marginBottom: 10 }}>
                📊 直近の平均（1日あたり）
              </div>
              {[{ label: "直近3日", data: avg3 }, { label: "直近7日", data: avg7 }].map(({ label, data }) => (
                <div
                  key={label}
                  style={{
                    display: "flex", alignItems: "center", padding: "8px 0",
                    borderBottom: label === "直近3日" ? "1px solid #f5ede0" : "none",
                  }}
                >
                  <span style={{ width: 70, fontSize: 13, color: "#888" }}>{label}</span>
                  <span style={{ flex: 1, fontSize: 14, color: "#1565c0" }}>💧 {data.totalWater}ml</span>
                  <span style={{ flex: 1, fontSize: 14, color: "#5c3d1e" }}>🧂 {data.totalSalt.toFixed(1)}g</span>
                </div>
              ))}
            </div>
          )}

          {/* 検査データ */}
          <div style={{
            background: "#fff", borderRadius: 14,
            padding: "16px", marginBottom: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            <button
              onClick={() => {
                setShowLabForm((v) => !v);
                setLabInput({ date: today, potassium: "", phosphorus: "" });
              }}
              style={{
                width: "100%",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "none", border: "none",
                cursor: "pointer", padding: 0,
                fontFamily: FONT,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: "bold", color: "#5c3d1e" }}>🔬 検査データを記録する</span>
              <span style={{ fontSize: 18, color: "#bbb" }}>{showLabForm ? "▲" : "▼"}</span>
            </button>

            {showLabForm && (
              <div style={{ marginTop: 14 }}>
                {[
                  { key: "date",       label: "検査日",              type: "date",   placeholder: "" },
                  { key: "potassium",  label: "カリウム K（mEq/L）", type: "number", placeholder: "例: 5.2" },
                  { key: "phosphorus", label: "リン P（mg/dL）",     type: "number", placeholder: "例: 5.8" },
                ].map(({ key, label, type, placeholder }) => (
                  <div key={key} style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>{label}</label>
                    <input
                      type={type}
                      value={labInput[key as keyof typeof labInput]}
                      onChange={(e) => setLabInput((prev) => ({ ...prev, [key]: e.target.value }))}
                      placeholder={placeholder}
                      style={{
                        width: "100%", padding: "10px 12px", fontSize: 16,
                        border: "1.5px solid #e8ddd0", borderRadius: 8,
                        fontFamily: FONT, boxSizing: "border-box",
                      }}
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
                    setLabRecords(getLabRecords().slice().reverse().slice(0, 3));
                    showToast("検査データを保存しました");
                  }}
                  style={{
                    width: "100%", padding: "13px",
                    fontSize: 16, fontWeight: "bold",
                    background: "#1565c0", color: "#fff",
                    border: "none", borderRadius: 10,
                    cursor: "pointer", fontFamily: FONT,
                  }}
                >
                  保存する
                </button>
              </div>
            )}

            {/* 検査×食事 相関（新形式履歴から算出） */}
            {labRecords.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>直近の検査結果と食事の関係</div>
                {labRecords.map((lab) => {
                  const pre = getMealsBeforeDateFromHistory(lab.date, 3, mealHistory);
                  return (
                    <div key={lab.id} style={{
                      padding: "12px",
                      background: "#f8f4ff",
                      borderRadius: 10,
                      marginBottom: 8,
                      border: "1px solid #e8ddf8",
                    }}>
                      <div style={{ fontSize: 13, fontWeight: "bold", color: "#5c3d1e", marginBottom: 6 }}>
                        🗓 {lab.date}　K:{" "}
                        <span style={{ color: lab.potassium > 5.0 ? "#c62828" : "#2e7d32" }}>
                          {lab.potassium}
                        </span>
                        　P:{" "}
                        <span style={{ color: lab.phosphorus > 6.0 ? "#c62828" : "#2e7d32" }}>
                          {lab.phosphorus}
                        </span>
                      </div>
                      {pre.hasData ? (
                        <div style={{ fontSize: 12, color: "#666" }}>
                          検査前3日の食事平均　💧 {pre.totalWater}ml　🧂 {pre.totalSalt.toFixed(1)}g
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: "#bbb" }}>検査前3日の食事データなし</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* ─── 食事履歴セクション ─── */}
        {sortedDates.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 14, fontWeight: "bold", color: "#5c3d1e", marginBottom: 12 }}>
              📋 食事履歴
            </div>

            {sortedDates.map((dateStr) => (
              <div key={dateStr} style={{ marginBottom: 20 }}>
                {/* 日付ヘッダー */}
                <div style={{
                  fontSize: 13, fontWeight: "bold", color: "#888",
                  padding: "6px 4px",
                  borderBottom: "1px solid #f0e8d8",
                  marginBottom: 8,
                }}>
                  {formatDateLabel(dateStr, today)}
                </div>

                {/* その日の食事カード（新しい順） */}
                {historyByDate[dateStr].map((meal) => (
                  <div key={meal.id} style={{
                    background: "#fff",
                    borderRadius: 12,
                    padding: "14px 14px 12px",
                    marginBottom: 8,
                    boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                    border: "1px solid #f0e8d8",
                  }}>
                    {/* 食品名行 + 削除ボタン */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                      <p style={{
                        fontSize: 14, color: "#3d2010", lineHeight: 1.6, margin: 0, flex: 1,
                      }}>
                        {meal.items.map((f) => f.name).join("、")}
                      </p>
                      <button
                        onClick={() => handleDeleteMeal(meal.id)}
                        style={{
                          flexShrink: 0,
                          width: 28, height: 28,
                          borderRadius: "50%",
                          background: "#fff0f0",
                          border: "1px solid #ffd0d0",
                          fontSize: 14, color: "#e07070",
                          cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          lineHeight: 1,
                        }}
                        aria-label="削除"
                      >
                        ×
                      </button>
                    </div>

                    {/* 合計値 */}
                    <div style={{
                      display: "flex", gap: 12, flexWrap: "wrap",
                      marginTop: 10, paddingTop: 10,
                      borderTop: "1px solid #f5ede0",
                    }}>
                      <span style={{ fontSize: 12, color: "#1565c0" }}>
                        💧 {meal.total.water}ml
                      </span>
                      <span style={{ fontSize: 12, color: "#5c3d1e" }}>
                        🧂 {meal.total.salt.toFixed(1)}g
                      </span>
                      <span style={{ fontSize: 12, color: "#388e3c" }}>
                        K {meal.total.potassium}mg
                      </span>
                      <span style={{ fontSize: 12, color: "#7b1fa2" }}>
                        P {meal.total.phosphorus}mg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ③ 制限モーダル（4食目以降・無料ユーザーのみ） */}
      {showLimitModal && (
        <>
          <div
            onClick={() => setShowLimitModal(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200 }}
          />
          <div style={{
            position: "fixed",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: 500,
            background: "#fff",
            borderRadius: "20px 20px 0 0",
            padding: "28px 24px 44px",
            zIndex: 201,
            boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
            fontFamily: FONT,
          }}>
            <div style={{ width: 40, height: 4, background: "#ddd", borderRadius: 2, margin: "0 auto 24px" }} />
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
              <p style={{ fontSize: 17, fontWeight: "bold", color: "#3d2010", margin: "0 0 8px" }}>
                無料は1日3食までです
              </p>
              <p style={{ fontSize: 14, color: "#888", margin: 0, lineHeight: 1.6 }}>
                これ以上は保存されません
              </p>
            </div>
            <button
              onClick={async () => {
  const res = await fetch("/api/checkout", { method: "POST" });
  const data = await res.json();
  window.location.href = data.url;
}}
              style={{
                width: "100%",
                padding: "15px",
                fontSize: 16,
                fontWeight: "bold",
                background: "#c17a3a",
                color: "#fff",
                border: "none",
                borderRadius: 12,
                cursor: "pointer",
                fontFamily: FONT,
                marginBottom: 10,
              }}
            >
              制限を解除する（月額500円）
            </button>
            <button
              onClick={() => setShowLimitModal(false)}
              style={{
                width: "100%",
                padding: "12px",
                fontSize: 15,
                background: "transparent",
                color: "#aaa",
                border: "none",
                cursor: "pointer",
                fontFamily: FONT,
              }}
            >
              閉じる
            </button>
          </div>
        </>
      )}

      {/* ─── ポーションピッカー ─── */}
      {picker && (
        <PortionPicker
          btn={picker}
          onSelect={handlePortionSelect}
          onClose={() => setPicker(null)}
        />
      )}

      {/* ─── トースト通知 ─── */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          background: "rgba(45, 125, 45, 0.92)", color: "#fff",
          fontSize: 15, padding: "12px 22px", borderRadius: 28,
          boxShadow: "0 4px 16px rgba(0,0,0,0.18)",
          whiteSpace: "nowrap", zIndex: 200, pointerEvents: "none",
        }}>
          ✅ {toast}
        </div>
      )}

    </main>
  );
}
