"use client";

import Image from "next/image";
import { useState } from "react";
import { judgeMeal, type MealItem } from "@/lib/judge";
import { FOODS } from "@/lib/foods";

const aliasMap: Record<string, string> = {
  "ご飯": "白米",
  "ごはん": "白米",
  "味噌汁": "みそ汁",
  "みそしる": "みそ汁",
  "唐揚げ": "から揚げ",
  "からあげ": "から揚げ",
  "お握り": "おにぎり",
};

function findFood(name: string) {
  const normalized = aliasMap[name] ?? name;
  return FOODS.find((f) => f.name === normalized);
}


export default function HomePage() {
  const [showForm, setShowForm] = useState(false);
  const [input, setInput] = useState("");
  const [savedMeal, setSavedMeal] = useState("");
  const [result, setResult] = useState<ReturnType<typeof judgeMeal> | null>(null);
const [unknownFoods, setUnknownFoods] = useState<string[]>([]);

const [hasStartedEditing, setHasStartedEditing] = useState(false);
  const handleClick = () => {
    setShowForm(true);
  };

  // 入力 → 食品データに変換
  const parseInputToItems = (text: string): { items: MealItem[]; unknown: string[] } => {
  const items: MealItem[] = [];
const unknown: string[] = [];

const tokens = text
  .split(/[\s、,]+/)
  .map((t) => t.trim())
  .filter(Boolean);

const normalizedTokens = tokens.map((token) => aliasMap[token] ?? token);

normalizedTokens.forEach((token) => {
  const food = findFood(token);

  if (food) {
  items.push({
    food,
    amount: 100,
  });
} else {
  unknown.push(token);
}
});

return { items, unknown };
};
const handleQuickAdd = (foodName: string) => {
  setInput((prev) => (prev ? `${prev}、${foodName}` : foodName));
};
  const handleSave = () => {
  const normalized = input
    .replace(/\s+/g, "、")
    .replace(/、{2,}/g, "、")
    .replace(/^、|、$/g, "");

  setSavedMeal(normalized);

  const { items, unknown } = parseInputToItems(normalized);
  setUnknownFoods(unknown);

  const judged = judgeMeal(items);
  setResult(judged);

  setInput("");
  setHasStartedEditing(false);
};

const quickFoods = ["ご飯", "味噌汁", "卵", "納豆", "ヨーグルト"];
  const getColor = (status: string) => {
    if (status === "ng") return "bg-red-100 text-red-600";
if (status === "caution") return "bg-yellow-100 text-yellow-600";
return "bg-green-100 text-green-700";
  };

  return (
    <main className="min-h-screen bg-white p-6">
      <div className="mx-auto max-w-md space-y-6">
        <h1 className="text-2xl font-bold">食事チェック</h1>

        <button
          type="button"
          onClick={handleClick}
          className="rounded-xl bg-blue-600 px-4 py-3 text-white shadow hover:opacity-90"
        >
          ＋ 食事を記録する
        </button>

        {showForm && (
          <div className="rounded-2xl border p-4 shadow-sm space-y-3">
            <p className="font-semibold">自由入力フォーム</p>

                <input
  type="text"
  value={input}
  onChange={(e) => {
    let value = e.target.value;
    value = value.replace(/\s+/g, "、");
    value = value.replace(/、{2,}/g, "、");
    setInput(value);
  }}
  onFocus={() => {
    if (!hasStartedEditing) {
      setInput("");
      setSavedMeal("");
      setResult(null);
      setUnknownFoods([]);
      setHasStartedEditing(true);
    }
  }}
  placeholder="例：ごはん、味噌汁、豚肉"
  className="w-full rounded-lg border px-3 py-2"
/>


<div className="mt-3 flex flex-wrap gap-2">
  {quickFoods.map((foodName) => {
    const food = findFood(foodName);
    return (
      <button
        key={foodName}
        type="button"
        onClick={() => handleQuickAdd(foodName)}
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border text-sm"
      >
        {food?.image && (
          <Image
            src={food.image}
            alt={food.name}
            width={20}
            height={20}
            className="rounded-full object-cover w-5 h-5"
          />
        )}
        {foodName}
      </button>
    );
  })}
</div>


            <button
              type="button"
              onClick={handleSave}
              className="w-full rounded-lg bg-blue-500 py-2 text-white"
            >
              保存
            </button>
          </div>
        )}

        {savedMeal && (
          <div className="rounded-2xl bg-gray-100 p-4 space-y-3">
            <p className="font-semibold">保存した内容</p>
  <div className="flex flex-wrap gap-2">
  {savedMeal
  .split(/[\s,、]+/)
  .filter(Boolean)
  .map((item, index) => {
    const isUnknown = unknownFoods.includes(item);
    const food = findFood(item);

    return (
      <span
        key={index}
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
          isUnknown
            ? "bg-red-100 text-red-600"
            : "bg-gray-200 text-gray-700"
        }`}
      >
        {food?.image && (
          <Image
            src={food.image}
            alt={food.name}
            width={20}
            height={20}
            className="rounded-full object-cover w-5 h-5"
          />
        )}
        {item}
      </span>
    );
  })}
</div>

                        {result && (
              <div className="mt-3 space-y-3 text-sm">
                <div className="space-y-2">
                  <div className={`p-2 rounded ${getColor(result.sodium.status)}`}>
                    塩分：{result.sodium.value} mg（{result.sodium.status}）
                  </div>

                  <div className={`p-2 rounded ${getColor(result.phosphorus.status)}`}>
                    リン：{result.phosphorus.value} mg（{result.phosphorus.status}）
                  </div>

                  <div className={`p-2 rounded ${getColor(result.potassium.status)}`}>
                    カリウム：{result.potassium.value} mg（{result.potassium.status}）
                  </div>
                </div>

                <p className="pt-2 font-semibold">
                  総合評価：{result.overall}
                </p>

                {unknownFoods.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-300 rounded">
                    <p className="text-red-600 font-bold">未登録の食品</p>
                    <p className="text-red-400 text-sm mt-1">今後追加予定です</p>
                    <ul className="text-red-500 text-sm mt-2">
                      {unknownFoods.map((item, index) => (
                        <li key={index}>・{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}