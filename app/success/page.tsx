"use client";

import { useEffect } from "react";
import Link from "next/link";
import { setIsPremium } from "@/lib/premium";

export default function SuccessPage() {
  useEffect(() => {
    setIsPremium(true);
  }, []);

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm space-y-4">
        <p className="text-4xl">🎉</p>
        <h1 className="text-2xl font-bold text-gray-800">決済が完了しました</h1>
        <p className="text-gray-500">プレミアム機能をご利用いただけます。</p>
        <Link
          href="/"
          className="inline-block mt-4 rounded-xl bg-teal-600 px-6 py-3 text-white font-semibold shadow hover:bg-teal-700 transition-colors"
        >
          アプリに戻る
        </Link>
      </div>
    </main>
  );
}
