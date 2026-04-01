"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { FOODS, getFoodRisk } from "@/lib/foods";
import { MealItem, judgeMeal } from "@/lib/judge";
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
  type Meal,
  type LabRecord,
} from "@/lib/storage";

// ─── 型定義 ──────────────────────────────────────────────
type Portion = { label: string; grams: number };
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
        padding: "16px 8px 12px",
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
    <div style={{ marginTop: 24 }}>
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
                  <span style={{ fontSize: 11, color: "#5c3d1e" }}>🧂 {(totalS * 2.54 / 1000).toFixed(1)}g</span>
                  <span style={{ fontSize: 11, color: totalK > 1650 ? "#e65100" : "#388e3c" }}>K {totalK}mg</span>
                  <span style={{ fontSize: 11, color: totalP > 660 ? "#e65100" : "#7b1fa2" }}>P {totalP}mg</span>
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

  // Sync calendar view when selected date's month changes externally
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
      {/* Month navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <button
          onClick={goBack}
          style={{ width: 34, height: 34, border: "1.5px solid #e8ddd0", borderRadius: 8, background: "#fdf8f0", cursor: "pointer", fontSize: 20, color: "#c17a3a", fontFamily: FONT, lineHeight: 1 }}
        >‹</button>
        <span style={{ fontSize: 15, fontWeight: "bold", color: "#3d2010", fontFamily: FONT }}>
          {viewYear}年{viewMonth + 1}月
        </span>
        <button
          onClick={goNext}
          disabled={!canGoNext}
          style={{ width: 34, height: 34, border: "1.5px solid #e8ddd0", borderRadius: 8, background: canGoNext ? "#fdf8f0" : "#f5f0ea", cursor: canGoNext ? "pointer" : "default", fontSize: 20, color: canGoNext ? "#c17a3a" : "#ddd", fontFamily: FONT, lineHeight: 1 }}
        >›</button>
      </div>
      {/* Day-of-week headers */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 2 }}>
        {["日","月","火","水","木","金","土"].map((d, i) => (
          <div key={d} style={{ textAlign: "center", fontSize: 11, color: i === 0 ? "#e57373" : i === 6 ? "#64b5f6" : "#aaa", paddingBottom: 3 }}>{d}</div>
        ))}
      </div>
      {/* Date cells */}
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
              <span style={{
                fontSize: 14, lineHeight: 1,
                fontWeight: isToday || isSelected ? "bold" : "normal",
                color: isSelected ? "#fff" : dow === 0 ? "#e57373" : dow === 6 ? "#64b5f6" : "#3d2010",
              }}>
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
      {/* Legend + Today button */}
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
          <button
            onClick={() => onSelectDate(today)}
            style={{ fontSize: 12, color: "#c17a3a", background: "#fdf5eb", border: "1px solid #e8c898", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: FONT }}
          >
            今日に戻す
          </button>
        )}
      </div>
    </div>
  );
}

// ─── 旧データ移行（salt→sodium, zero→再計算） ────────────
function migrateMeal(meal: Meal): Meal {
  const raw = meal.total as any;

  // Normalize: read whichever field exists (new: sodium mg; old: salt NaCl grams)
  let water      = raw.water      ?? 0;
  let sodium     = raw.sodium     !== undefined
    ? raw.sodium                           // already in mg
    : raw.salt !== undefined
      ? Math.round(raw.salt / 2.54 * 1000) // convert NaCl grams → sodium mg
      : 0;
  let potassium  = raw.potassium  ?? 0;
  let phosphorus = raw.phosphorus ?? 0;

  // If any field has real data after normalisation, return the migrated meal
  if (water > 0 || sodium > 0 || potassium > 0 || phosphorus > 0) {
    return { ...meal, total: { water, sodium, potassium, phosphorus } };
  }

  // All zeros — recompute from stored items (foodId+amount exact; name+100g fallback)
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
  const [tab,    setTab]    = useState(0);
  const [items,  setItems]  = useState<MealItem[]>([]);
  const [picker, setPicker] = useState<FoodBtn | null>(null);
  const [result, setResult] = useState<any>(null);
  const [advice, setAdvice] = useState("");
  const [proAdvice, setProAdvice] = useState("");
  const [toast,  setToast]  = useState("");

  const resultRef = useRef<HTMLDivElement>(null);
  const today = toDateStr(new Date());

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
  // 現在の判定結果が保存済みかどうか
  const [mealSavedForCurrentJudge, setMealSavedForCurrentJudge] = useState(false);
  // 検査記録を全件表示するか
  const [showAllLabRecords, setShowAllLabRecords] = useState(false);

  // ─ 初回ロード ─
  function loadData() {
    setMealHistory(getMealHistory().map(migrateMeal));
    setLabRecords(getLabRecords().slice().reverse());
  }
  useEffect(() => { loadData(); }, []);

  // ─ 派生計算（mealHistoryから算出） ─
  const todayStats = getDailyStatsFromHistory(selectedDate, mealHistory);
  const avg3 = getRecentAverageFromHistory(3, mealHistory);
  const avg7 = getRecentAverageFromHistory(7, mealHistory);

  // ─ トースト ─
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 1800);
  };

  // ─ 食品追加 ─
  const handlePortionSelect = (grams: number, portionLabel: string) => {
    if (!picker || isInputLocked) return;
    const food = FOODS.find((f) => f.id === picker.foodId) ?? {
      id: picker.foodId,
      name: picker.label,
      water: 0,
      sodium: 0,
      potassium: 0,
      phosphorus: 0,
    };
    setItems((prev) => [...prev, { food, amount: grams }]);
    setResult(null);
    setAdvice("");
    setProAdvice("");
    setMealSavedForCurrentJudge(false);
    showToast(`${picker.label}（${portionLabel}）を追加しました`);
    setPicker(null);
  };

  const removeItem = (i: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
    setResult(null);
    setAdvice("");
    setProAdvice("");
  };

  const handleReset = () => {
    setItems([]);
    setResult(null);
    setAdvice("");
    setProAdvice("");
    setMealSavedForCurrentJudge(false);
    setTab(0);
  };

  const cat = CATEGORIES[tab];

  // ─ リアルタイム水分・ナトリウム計算（単一ソース） ─
  // totalSodium は judgeMeal と同じ式 (mg)。表示時のみ食塩相当量(g)へ変換する
  const totalWater = Math.round(
    items.reduce((sum, item) => sum + item.food.water * item.amount / 100, 0)
  );
  const totalSodium = Math.round(
    items.reduce((sum, item) => sum + item.food.sodium * item.amount / 100, 0)
  );
  // 食塩相当量(g) = sodium(mg) × 2.54 ÷ 1000 — 表示専用
  const saltG = Math.round(totalSodium * 2.54 / 1000 * 10) / 10;

  // 有料かどうか
  const isPremium = subscriptionStatus === "active";
  // 無料ユーザーが過去日を選択している場合は入力ロック
  const isInputLocked = !isPremium && selectedDate !== today;
  // 選択日の保存済み食事数（無料制限チェック用）
  const selectedDateMealCount = todayStats.mealCount;

  // ─ 判定・保存 ─
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
          water:      totalWater,
          sodium:     r.sodium.value,     // mg — same value shown in judgment panel
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

  // ─ 履歴削除 ─
  const handleDeleteMeal = (id: string) => {
    deleteMealById(id);
    setMealHistory((prev) => prev.filter((m) => m.id !== id).map(migrateMeal));
  };

  // ─ 水分・塩分ステータス ─
  const waterStatus = totalWater >= 1500 ? "ok" : totalWater >= 1000 ? "caution" : "low";
  const saltStatus  = saltG <= 6 ? "ok" : saltG <= 8 ? "caution" : "high";

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
    <main style={{ width: "100%", maxWidth: 500, margin: "0 auto", fontFamily: FONT, background: "#fdf8f0", minHeight: "100vh" }}>

      {/* ─── 固定ヘッダー + タブ（1つのstickyコンテナ） ─── */}
      <div style={{ position: "sticky", top: 0, zIndex: 10 }}>
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #f0e8d8",
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
              {saltG.toFixed(1)}<span style={{ fontSize: 13, fontWeight: "normal" }}>g</span>
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
      </div>{/* end sticky wrapper */}

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
              無理なく続けられる<br />記録を応援します
            </p>
            <button
              onClick={async () => {
  try {
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else showToast("決済の準備に失敗しました");
  } catch {
    showToast("決済の準備に失敗しました");
  }
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
              有料プランを見る
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
            <FoodButton key={`${btn.foodId}-${i}`} btn={btn} onTap={() => setPicker(btn)} disabled={isInputLocked} />
          ))}
        </div>

        {/* 過去日ロックバナー（無料ユーザー） */}
        {isInputLocked && (
          <div style={{
            marginBottom: 14,
            padding: "16px",
            background: "#f8f4ff",
            border: "1.5px solid #ce93d8",
            borderRadius: 12,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>🔒</div>
            <p style={{ fontSize: 14, color: "#6a1b9a", fontWeight: "bold", margin: "0 0 4px", lineHeight: 1.6 }}>
              過去日の記録は有料プランでご利用いただけます。
            </p>
            <p style={{ fontSize: 13, color: "#8e24aa", margin: "0 0 14px", lineHeight: 1.6 }}>
              継続的な振り返りに役立ちます。
            </p>
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/checkout", { method: "POST" });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                  else showToast("決済の準備に失敗しました");
                } catch { showToast("決済の準備に失敗しました"); }
              }}
              style={{
                padding: "10px 24px", fontSize: 14, fontWeight: "bold",
                background: "#8e24aa", color: "#fff",
                border: "none", borderRadius: 8, cursor: "pointer", fontFamily: FONT,
              }}
            >
              有料プランを見る
            </button>
          </div>
        )}

        {/* ─── カレンダー（日付選択） ─── */}
        <CalendarPicker
          selectedDate={selectedDate}
          today={today}
          mealHistory={mealHistory}
          labRecords={labRecords}
          onSelectDate={(d) => {
            setSelectedDate(d);
            setItems([]);
            setResult(null);
            setAdvice("");
            setProAdvice("");
            setMealSavedForCurrentJudge(false);
          }}
        />

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
  textAlign: "center",
  padding: "18px",
  borderRadius: 12,
  marginBottom: 18,
  background: STATUS[result.overall as StatusKey].bg,
  border: `2px solid ${STATUS[result.overall as StatusKey].border}`,
}}>
              <div style={{ fontSize: 44 }}>{STATUS[result.overall as StatusKey].icon}</div>
              <div style={{ 
  fontSize: 21, 
  fontWeight: "bold", 
  color: STATUS[result.overall as StatusKey].text, 
  marginTop: 6 
}}>
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
              {proAdvice && (
                <p style={{ fontSize: 13, color: "#7a5c3a", lineHeight: 1.75, marginTop: 10, marginBottom: 0, paddingTop: 10, borderTop: "1px solid #e8d5b7" }}>
                  {proAdvice}
                </p>
              )}
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

            {/* ② 課金導線（4食目以降・未保存の場合のみ） */}
            {!isPremium && !mealSavedForCurrentJudge && (
              <div style={{
                marginTop: 16,
                padding: "18px 16px",
                background: "linear-gradient(135deg, #fffbf0 0%, #ffefd8 100%)",
                border: "2px solid #e8b870",
                borderRadius: 12,
              }}>
                <p style={{ fontSize: 14, fontWeight: "bold", color: "#7a4420", margin: "0 0 4px" }}>
                  この食事は記録されていません
                </p>
                <p style={{ fontSize: 13, color: "#a0632a", lineHeight: 1.6, margin: "0 0 14px" }}>
                  この先も記録を残すと、体調の変化に気づきやすくなります。
                </p>
                <button
                  onClick={async () => {
  try {
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else showToast("決済の準備に失敗しました");
  } catch {
    showToast("決済の準備に失敗しました");
  }
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
            background: "#fff",
borderRadius: 14,
            padding: "16px", marginBottom: 12,
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          }}>
            <div style={{ fontSize: 13, fontWeight: "bold", color: "#5c3d1e", marginBottom: 10 }}>
              📅 {selectedDate === today ? "本日の合計" : `${formatDateLabel(selectedDate, today)}の合計`}
              {selectedDateMealCount > 0 && (
                <span style={{ fontWeight: "normal", fontSize: 12, color: "#bbb", marginLeft: 8 }}>
                  {selectedDateMealCount}食分の記録
                </span>
              )}
            </div>
            {selectedDateMealCount === 0 ? (
              <p style={{ fontSize: 13, color: "#ccc", textAlign: "center", padding: "8px 0" }}>
                まだ記録がありません
              </p>
            ) : (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div style={{
                    textAlign: "center", padding: "10px 8px",
                    background: todayStats.totalWater >= 1500 ? "#e8f5e9" : todayStats.totalWater >= 1000 ? "#fff8e1" : "#ffebee",
                    borderRadius: 10,
                  }}>
                    <div style={{ fontSize: 11, color: "#888" }}>💧 水分</div>
                    <div style={{ fontSize: 20, fontWeight: "bold", color: "#1565c0" }}>
                      {todayStats.totalWater}<span style={{ fontSize: 12, fontWeight: "normal" }}>ml</span>
                    </div>
                  </div>
                  <div style={{
                    textAlign: "center", padding: "10px 8px",
                    background: (todayStats.totalSodium * 2.54 / 1000) <= 6 ? "#e8f5e9" : (todayStats.totalSodium * 2.54 / 1000) <= 8 ? "#fff8e1" : "#ffebee",
                    borderRadius: 10,
                  }}>
                    <div style={{ fontSize: 11, color: "#888" }}>🧂 塩分</div>
                    <div style={{ fontSize: 20, fontWeight: "bold", color: "#5c3d1e" }}>
                      {(todayStats.totalSodium * 2.54 / 1000).toFixed(1)}<span style={{ fontSize: 12, fontWeight: "normal" }}>g</span>
                    </div>
                  </div>
                  <div style={{
                    textAlign: "center", padding: "10px 8px",
                    background: todayStats.totalPotassium > 1650 ? "#ffebee" : todayStats.totalPotassium > 1200 ? "#fff8e1" : "#e8f5e9",
                    borderRadius: 10,
                  }}>
                    <div style={{ fontSize: 11, color: "#888" }}>🥦 カリウム</div>
                    <div style={{ fontSize: 20, fontWeight: "bold", color: "#388e3c" }}>
                      {todayStats.totalPotassium}<span style={{ fontSize: 12, fontWeight: "normal" }}>mg</span>
                    </div>
                  </div>
                  <div style={{
                    textAlign: "center", padding: "10px 8px",
                    background: todayStats.totalPhosphorus > 660 ? "#ffebee" : todayStats.totalPhosphorus > 500 ? "#fff8e1" : "#e8f5e9",
                    borderRadius: 10,
                  }}>
                    <div style={{ fontSize: 11, color: "#888" }}>🦴 リン</div>
                    <div style={{ fontSize: 20, fontWeight: "bold", color: "#7b1fa2" }}>
                      {todayStats.totalPhosphorus}<span style={{ fontSize: 12, fontWeight: "normal" }}>mg</span>
                    </div>
                  </div>
                </div>
                {(() => {
                  if ((todayStats.totalSodium * 2.54 / 1000) > 8)
                    return <p style={{ fontSize: 12, color: "#c62828", marginTop: 8, margin: "8px 0 0", textAlign: "center" }}>塩分が多めの1日です。明日は少し意識してみましょう</p>;
                  if (todayStats.totalPotassium > 1650)
                    return <p style={{ fontSize: 12, color: "#e65100", marginTop: 8, margin: "8px 0 0", textAlign: "center" }}>カリウムが多い日です。野菜の茹でこぼしを心がけましょう</p>;
                  if (todayStats.mealCount > 0)
                    return <p style={{ fontSize: 12, color: "#2e7d32", marginTop: 8, margin: "8px 0 0", textAlign: "center" }}>今日も記録できています。この調子で続けましょう 😊</p>;
                  return null;
                })()}
              </>
            )}
          </div>

          {/* 直近平均 */}
          {(avg3.totalWater > 0 || avg7.totalWater > 0 || avg3.totalSodium > 0 || avg7.totalSodium > 0 || avg3.totalPotassium > 0 || avg7.totalPotassium > 0) && (
            <div style={{
              background: "#fff",
              borderRadius: 14,
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
                    display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 12px",
                    padding: "8px 0",
                    borderBottom: label === "直近3日" ? "1px solid #f5ede0" : "none",
                  }}
                >
                  <span style={{ width: 60, fontSize: 13, color: "#888", flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: 13, color: "#1565c0" }}>💧 {data.totalWater}ml</span>
                  <span style={{ fontSize: 13, color: "#5c3d1e" }}>🧂 {(data.totalSodium * 2.54 / 1000).toFixed(1)}g</span>
                  <span style={{ fontSize: 13, color: "#388e3c" }}>K {data.totalPotassium}mg</span>
                  <span style={{ fontSize: 13, color: "#7b1fa2" }}>P {data.totalPhosphorus}mg</span>
                </div>
              ))}
            </div>
          )}

          {/* 検査データ */}
          <div style={{
            background: "#fff",
borderRadius: 14,
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
                    setLabRecords(getLabRecords().slice().reverse());
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

            {/* 検査記録一覧 */}
            {labRecords.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>検査結果の記録</div>
                {(showAllLabRecords ? labRecords : labRecords.slice(0, 3)).map((lab) => (
                  <div key={lab.id} style={{
                    padding: "12px",
                    background: "#f8f4ff",
                    borderRadius: 10,
                    marginBottom: 8,
                    border: "1px solid #e8ddf8",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: "bold", color: "#5c3d1e" }}>
                      🗓 {lab.date}　K:{" "}
                      <span style={{ color: lab.potassium > 5.0 ? "#c62828" : "#2e7d32" }}>
                        {lab.potassium}
                      </span>
                      　P:{" "}
                      <span style={{ color: lab.phosphorus > 6.0 ? "#c62828" : "#2e7d32" }}>
                        {lab.phosphorus}
                      </span>
                    </div>
                  </div>
                ))}
                {labRecords.length > 3 && (
                  <button
                    onClick={() => setShowAllLabRecords((v) => !v)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 12, color: "#aaa", padding: "4px 0",
                      fontFamily: FONT, width: "100%", textAlign: "center",
                    }}
                  >
                    {showAllLabRecords
                      ? "折りたたむ ▲"
                      : `過去の記録をすべて見る（${labRecords.length - 3}件） ▼`}
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

        {/* ─── 選択日の食事履歴 ─── */}
        {historyByDate[selectedDate] && historyByDate[selectedDate].length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 14, fontWeight: "bold", color: "#5c3d1e", marginBottom: 12 }}>
              🍽 {formatDateLabel(selectedDate, today)}の食事記録
            </div>

            {historyByDate[selectedDate].map((meal) => (
              <div key={meal.id} style={{
                background: "#fff",
                borderRadius: 12,
                padding: "14px 14px 12px",
                marginBottom: 8,
                boxShadow: "0 1px 6px rgba(0,0,0,0.06)",
                border: "1px solid #f0e8d8",
              }}>
                {/* 食品名 + 削除 */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <p style={{ fontSize: 14, color: "#3d2010", lineHeight: 1.6, margin: 0, flex: 1 }}>
                    {meal.items.map((f: any) => f.name).join("、")}
                  </p>
                  <button
                    onClick={() => handleDeleteMeal(meal.id)}
                    style={{
                      flexShrink: 0, width: 28, height: 28,
                      borderRadius: "50%", background: "#fff0f0",
                      border: "1px solid #ffd0d0", fontSize: 14, color: "#e07070",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                    }}
                    aria-label="削除"
                  >×</button>
                </div>

                {/* 栄養素合計 */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 10, paddingTop: 10, borderTop: "1px solid #f5ede0" }}>
                  <div style={{ background: "#f0f7ff", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#888" }}>💧 水分</div>
                    <div style={{ fontSize: 15, fontWeight: "bold", color: "#1565c0" }}>{meal.total.water}<span style={{ fontSize: 11, fontWeight: "normal" }}>ml</span></div>
                  </div>
                  <div style={{ background: "#fff8e8", borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#888" }}>🧂 塩分</div>
                    <div style={{ fontSize: 15, fontWeight: "bold", color: "#5c3d1e" }}>{(meal.total.sodium * 2.54 / 1000).toFixed(1)}<span style={{ fontSize: 11, fontWeight: "normal" }}>g</span></div>
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

                {/* 評価バッジ + アドバイス */}
                {meal.overall && (
                  <div style={{ marginTop: 10 }}>
                    <span style={{
                      display: "inline-block",
                      fontSize: 12, fontWeight: "bold",
                      color: STATUS[meal.overall].text,
                      background: STATUS[meal.overall].bg,
                      border: `1px solid ${STATUS[meal.overall].border}`,
                      padding: "3px 10px", borderRadius: 6,
                    }}>
                      {STATUS[meal.overall].icon} {STATUS[meal.overall].label}
                    </span>
                    {meal.advice && (
                      <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6, margin: "6px 0 0", fontStyle: "italic" }}>
                        {meal.advice}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ─── 過去の全履歴（折りたたみ） ─── */}
        {sortedDates.filter(d => d !== selectedDate).length > 0 && (
          <PastHistoryList
            sortedDates={sortedDates.filter(d => d !== selectedDate)}
            historyByDate={historyByDate}
            today={today}
            onSelectDate={(d) => {
              setSelectedDate(d);
              setItems([]);
              setResult(null);
              setAdvice("");
              setProAdvice("");
              setMealSavedForCurrentJudge(false);
            }}
          />
        )}

      </div>


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
