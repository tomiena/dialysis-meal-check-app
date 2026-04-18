"use client";

import Link from "next/link";
import {
  Utensils,
  CheckCircle2,
  BarChart3,
  CalendarDays,
  MessageCircleHeart,
  Star,
  ArrowRight,
  Droplets,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";

// ─── Stripe 決済 ──────────────────────────────────────────
async function handleCheckout() {
  try {
    const res  = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("決済ページの取得に失敗しました。");
    }
  } catch {
    alert("エラーが発生しました。");
  }
}

// ─── CTAボタン ────────────────────────────────────────────
function CtaButton({ label = "今すぐ試す", href = "/" }: { label?: string; href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center gap-2 w-full max-w-xs bg-teal-600 active:bg-teal-700 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-md text-center transition-all active:scale-95"
    >
      {label}
      <ArrowRight size={18} />
    </Link>
  );
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center text-xs font-semibold tracking-widest text-teal-600 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 mb-4">
      {children}
    </span>
  );
}

// ─── LP 本体 ─────────────────────────────────────────────
export default function LP() {
  return (
    <main className="bg-white text-slate-800 antialiased">

      {/* ① ヒーローセクション */}
      <section className="relative bg-gradient-to-br from-teal-600 to-teal-800 px-6 pt-16 pb-16 text-center overflow-hidden">
        {/* 背景デコレーション */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full" />
        </div>

        <div className="relative mx-auto max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/30 rounded-full px-4 py-2 text-xs font-semibold text-white">
            <Utensils size={13} />
            透析患者さんの食事サポート
          </div>

          <h1 className="text-3xl font-bold leading-tight text-white">
            食材を選ぶだけで<br />
            <span className="text-teal-200">栄養バランスを</span><br />
            ひと目で確認
          </h1>

          <p className="text-teal-100 leading-relaxed text-base">
            水分・塩分・カリウム・リンを<br />
            わかりやすく表示します。
          </p>

          <div className="flex justify-center pt-2">
            <CtaButton label="無料で始める" />
          </div>
          <p className="text-xs text-teal-200/80">登録不要・インストール不要</p>
        </div>

        {/* 波形 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 390 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40 L0 20 Q97.5 0 195 20 Q292.5 40 390 20 L390 40 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ② 数字バッジ */}
      <section className="px-6 py-10 bg-white">
        <div className="mx-auto max-w-md">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { num: "406",  unit: "品",    label: "登録食材数" },
              { num: "4",    unit: "項目",  label: "栄養素チェック" },
              { num: "22",   unit: "年",    label: "透析現場経験" },
            ].map(({ num, unit, label }) => (
              <div key={label} className="bg-teal-50 rounded-2xl py-5 border border-teal-100">
                <p className="text-2xl font-bold text-teal-700 tabular-nums">
                  {num}<span className="text-sm ml-0.5">{unit}</span>
                </p>
                <p className="text-xs text-teal-500 mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ③ お悩みセクション */}
      <section className="px-6 py-14 bg-slate-50">
        <div className="mx-auto max-w-md">
          <div className="text-center mb-8">
            <SectionBadge>こんなお悩みありませんか？</SectionBadge>
            <h2 className="text-2xl font-bold text-slate-800">
              食事管理の<br />難しさを感じていませんか
            </h2>
          </div>

          <ul className="space-y-3">
            {[
              "何を食べていいか分からない",
              "この食事で大丈夫か不安になる",
              "栄養計算が難しくて続かない",
              "家族に食事を管理してもらうのが申し訳ない",
            ].map((text) => (
              <li
                key={text}
                className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-4 shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-slate-500 text-xs font-bold">？</span>
                </div>
                <span className="text-slate-700 font-medium text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ④ 解決セクション */}
      <section className="px-6 py-14 bg-teal-600 text-white text-center">
        <div className="mx-auto max-w-md space-y-5">
          <Sparkles size={32} className="text-teal-200 mx-auto" />
          <h2 className="text-2xl font-bold">その悩みを解決します</h2>
          <p className="text-teal-100 leading-relaxed">
            食べたものをタップするだけで、<br />
            4つの大切な栄養素を<br />
            自動で計算・評価します。
          </p>
          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: <Droplets size={18} />, label: "水分" },
              { icon: <span className="text-base font-bold">塩</span>, label: "ナトリウム" },
              { icon: <span className="text-base font-bold">K</span>,  label: "カリウム" },
              { icon: <span className="text-base font-bold">P</span>,  label: "リン" },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-white/10 border border-white/20 rounded-2xl py-4 flex flex-col items-center gap-1.5 font-semibold">
                <span className="text-teal-200">{icon}</span>
                <span className="text-white text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ⑤ STEP 紹介 */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-md space-y-10">
          <div className="text-center">
            <SectionBadge>使い方はとても簡単</SectionBadge>
            <h2 className="text-2xl font-bold text-slate-800">3ステップで記録完了</h2>
          </div>

          {[
            {
              step: "STEP 1",
              icon: <Utensils size={22} className="text-teal-600" />,
              title: "食材をタップして選ぶ",
              desc: "406品の食材から食べたものを選ぶだけ。カテゴリで絞り込めて探しやすい。",
            },
            {
              step: "STEP 2",
              icon: <BarChart3 size={22} className="text-teal-600" />,
              title: "栄養バランスを確認",
              desc: "水分・塩分・カリウム・リンを色つきバーでひと目確認。目標値との比較も一目瞭然。",
            },
            {
              step: "STEP 3",
              icon: <MessageCircleHeart size={22} className="text-teal-600" />,
              title: "やさしいアドバイスを受ける",
              desc: "次の食事で気をつけたいことを、看護師視点でわかりやすくお伝えします。",
            },
          ].map(({ step, icon, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center flex-shrink-0">
                  {icon}
                </div>
                <div className="w-0.5 h-full bg-teal-100 mt-2 flex-1 min-h-[20px]" />
              </div>
              <div className="pb-6 flex-1">
                <p className="text-xs font-bold text-teal-500 mb-1">{step}</p>
                <p className="text-base font-bold text-slate-800 mb-1.5">{title}</p>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ⑥ カレンダー管理 */}
      <section className="px-6 py-14 bg-teal-50">
        <div className="mx-auto max-w-md space-y-6">
          <div className="text-center">
            <SectionBadge>継続サポート</SectionBadge>
            <h2 className="text-2xl font-bold text-slate-800">記録の積み重ねが見える</h2>
            <p className="mt-3 text-slate-500 text-sm leading-relaxed">
              カレンダーで日々の食事を振り返り、<br />
              食事パターンの傾向をつかめます。
            </p>
          </div>

          {/* カレンダーデモ */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <CalendarDays size={16} className="text-teal-500" />
              <p className="text-sm font-bold text-slate-700">4月の記録</p>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
                <span key={d} className={`text-xs font-semibold pb-1 ${
                  i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-slate-400"
                }`}>{d}</span>
              ))}
              {[
                { d: null }, { d: null }, { d: 1, st: "none" }, { d: 2, st: "ok" },
                { d: 3, st: "caution" }, { d: 4, st: "ok" }, { d: 5, st: "none" },
                { d: 6, st: "ok" }, { d: 7, st: "ok" }, { d: 8, st: "ng" },
                { d: 9, st: "ok" }, { d: 10, st: "ok" }, { d: 11, st: "ok" },
                { d: 12, st: "none" }, { d: 13, st: "ok" }, { d: 14, st: "ok" },
              ].map((cell, i) =>
                cell.d === null ? (
                  <div key={`blank-${i}`} className="h-9" />
                ) : (
                  <div key={cell.d} className={`h-9 flex flex-col items-center justify-center rounded-xl ${
                    cell.st === "ok"      ? "bg-teal-50"  :
                    cell.st === "caution" ? "bg-amber-50" :
                    cell.st === "ng"      ? "bg-red-50"   : ""
                  }`}>
                    <span className="text-xs text-slate-600 font-medium">{cell.d}</span>
                    {cell.st !== "none" && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        cell.st === "ok"      ? "bg-teal-400"  :
                        cell.st === "caution" ? "bg-amber-400" : "bg-red-400"
                      }`} />
                    )}
                  </div>
                )
              )}
            </div>
            <div className="flex gap-4 justify-center text-xs text-slate-400 pt-2 border-t border-slate-100">
              {[
                { color: "bg-teal-400",  label: "良好" },
                { color: "bg-amber-400", label: "注意" },
                { color: "bg-red-400",   label: "多め" },
              ].map(({ color, label }) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${color}`} />{label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ⑦ プレミアムセクション */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-md space-y-6">
          <div className="text-center">
            <SectionBadge>プレミアムプラン</SectionBadge>
            <h2 className="text-2xl font-bold text-slate-800">より詳しく管理したい方へ</h2>
            <p className="mt-3 text-slate-500 text-sm">基本機能は無料でお使いいただけます。</p>
          </div>

          {/* 無料 vs プレミアム */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-5">
              <p className="text-sm font-bold text-slate-600 mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500">F</span>
                無料でできること
              </p>
              <ul className="space-y-2.5">
                {["食事の記録・栄養確認", "栄養バランスの判定", "カレンダー記録"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 size={15} className="text-teal-400 flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border-2 border-teal-300 bg-teal-50 px-5 py-5">
              <p className="text-sm font-bold text-teal-700 mb-3 flex items-center gap-2">
                <Star size={15} className="text-teal-500" />
                プレミアムでできること
              </p>
              <ul className="space-y-2.5">
                {[
                  "1日の記録回数が無制限に",
                  "より詳しい振り返り機能",
                  "継続を支えるサポート機能",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-teal-700">
                    <ChevronRight size={14} className="text-teal-500 flex-shrink-0" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck size={13} />
            透析専門看護師・管理栄養士監修
          </p>

          <button
            onClick={handleCheckout}
            className="w-full bg-teal-600 active:bg-teal-700 active:scale-95 text-white font-bold py-4 rounded-2xl shadow-md transition-all"
          >
            <span className="block text-lg">プレミアムを始める</span>
            <span className="block text-sm opacity-80 mt-0.5">買い切り ¥500（税込）</span>
          </button>

          <p className="text-xs text-slate-400 text-center">
            まずは無料版で試してから、必要に感じたときにどうぞ。
          </p>
        </div>
      </section>

      {/* ⑧ 最終 CTA */}
      <section className="px-6 py-16 bg-gradient-to-br from-teal-600 to-teal-800 text-center">
        <div className="mx-auto max-w-md space-y-5">
          <Utensils size={32} className="text-teal-200 mx-auto" />
          <h2 className="text-2xl font-bold text-white leading-snug">
            透析中の食事管理を、<br />
            もっと簡単に。
          </h2>
          <p className="text-teal-100 text-sm leading-relaxed">
            登録不要・無料ですぐに始められます。
          </p>
          <div className="flex justify-center">
            <CtaButton label="今すぐ試す" />
          </div>
          <p className="text-xs text-teal-200/70 max-w-xs mx-auto leading-relaxed">
            本アプリは食事管理を支援するツールであり、医師や管理栄養士の指導に代わるものではありません。
          </p>
        </div>
      </section>

      {/* ⑨ 開発者・免責 */}
      <section className="px-6 py-14 bg-slate-900">
        <div className="mx-auto max-w-md space-y-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Utensils size={16} className="text-teal-400" />
              <p className="text-sm font-bold text-white">開発者について</p>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              看護師資格を取得後、透析医療の現場に22年間従事。患者さんの栄養管理や生活指導に携わる中で、食事制限に悩む多くの声に向き合ってきました。これまでの臨床経験を社会に還元したいという想いから、透析患者さんとそのご家族を支援するため本アプリを開発しました。
            </p>
            <p className="text-xs text-slate-500">※ペンネームで活動しています。</p>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-700">
            <p className="text-xs font-bold text-slate-400">免責事項</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              本アプリは透析患者の食事管理を支援することを目的としたツールであり、医師や管理栄養士の指導に代わるものではありません。治療や食事制限については、必ず医療専門職にご相談ください。
            </p>
          </div>

          <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils size={14} className="text-teal-400" />
              <span className="text-xs text-slate-400 font-medium">透析食事チェック</span>
            </div>
            <Link href="/" className="text-xs text-teal-400 flex items-center gap-1">
              アプリを使う <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
