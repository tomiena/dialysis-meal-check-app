"use client";

import { useState } from "react";

type Props = {
  label?: string;
  small?: boolean;
};

export default function PremiumButton({ label = "プレミアムを始める（買い切り ¥500）", small = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", { method: "POST" });

      const text = await res.text();
      let data: { url?: string; error?: string } = {};
      try {
        data = JSON.parse(text);
      } catch {
        console.error("[PremiumButton] JSONパース失敗:", text.slice(0, 300));
        throw new Error(`サーバーエラー（${res.status}）`);
      }

      if (!res.ok) {
        throw new Error(data.error ?? `サーバーエラー（${res.status}）`);
      }
      if (!data.url) {
        throw new Error("決済URLが取得できませんでした");
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`w-full max-w-md mx-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-md transition duration-200 text-center leading-tight disabled:opacity-50 disabled:cursor-not-allowed ${small ? "text-xs py-2" : "text-lg"}`}
      >
        {loading ? (
          <span className="block">処理中...</span>
        ) : (
          <>
            <span className="block">プレミアムを始める</span>
            <span className="block text-base whitespace-nowrap">（買い切り ¥500）</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-red-500 text-sm text-center max-w-xs">{error}</p>
      )}
    </div>
  );
}
