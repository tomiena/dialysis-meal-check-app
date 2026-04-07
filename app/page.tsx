"use client";

import { useState } from "react";

export default function HomePage() {
  const [showForm, setShowForm] = useState(false);
  const [input, setInput] = useState("");
  const [savedMeal, setSavedMeal] = useState("");

  const handleClick = () => {
    setShowForm(true);
  };

  const handleSave = () => {
    setSavedMeal(input);
    setInput("");
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
              onChange={(e) => setInput(e.target.value)}
              placeholder="例：ごはん、味噌汁"
              className="w-full rounded-lg border px-3 py-2"
            />

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
          <div className="rounded-2xl bg-gray-100 p-4">
            <p className="font-semibold">保存した内容</p>
            <p>{savedMeal}</p>
          </div>
        )}
      </div>
    </main>
  );
}