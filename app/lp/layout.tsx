import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "透析食事チェックアプリ｜塩分・カリウム・リン・水分を簡単管理",
  description:
    "透析患者向けに開発された食事管理アプリ。塩分・カリウム・リン・水分を簡単に記録・確認できます。透析看護の経験をもとに設計されたサポートツールです。",
  keywords: [
    "透析 食事 管理 アプリ",
    "透析 食事 チェック",
    "透析 栄養 管理",
    "腎臓病 食事 アプリ",
    "renal diet app",
    "dialysis diet app",
  ],
  verification: {
    google: "_mt6Pt-4_pD5a52Dr3UvTXorO_mPua6-DYxQMZVbiQo",
  },
};

export default function LpLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
