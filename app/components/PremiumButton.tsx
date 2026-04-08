"use client";

import { useState } from "react";

type Props = {
  label?: string;
};

export default function PremiumButton({ label = "プレミアムを始める（買い切り ¥500）" }: Props) {
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
        className="rounded-xl bg-teal-600 px-6 py-3 text-white font-semibold shadow hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "処理中..." : label}
      </button>
      {error && (
        <p className="text-red-500 text-sm text-center max-w-xs">{error}</p>
      )}
    </div>
  );
}
