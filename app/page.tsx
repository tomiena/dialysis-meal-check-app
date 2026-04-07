"use client";

import { useState } from "react";

export default function Home() {
  const [showFreeInput, setShowFreeInput] = useState(false);
  const [freeText, setFreeText] = useState("");

  return (
    <main style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 32, marginBottom: 20 }}>食事チェック</h1>

      <button
        onClick={() => setShowFreeInput(true)}
        style={{
          padding: "14px 18px",
          borderRadius: 12,
          border: "none",
          background: "#22c55e",
          color: "#fff",
          fontSize: 16,
          fontWeight: "bold",
          cursor: "pointer",
          marginBottom: 16,
        }}
      >
        自由入力で追加
      </button>

      {showFreeInput && (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 16,
            maxWidth: 420,
          }}
        >
          <input
            type="text"
            placeholder="食べたものを入力"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              marginBottom: 12,
              borderRadius: 8,
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={() => {
              alert(`入力された内容：${freeText}`);
              setFreeText("");
              setShowFreeInput(false);
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            追加する
          </button>
        </div>
      )}
    </main>
  );
}