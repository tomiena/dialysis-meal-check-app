"use client";

import Link from "next/link";

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

// ─── 再利用パーツ ─────────────────────────────────────────
function CtaButton({ label = "今すぐ無料で試す" }: { label?: string }) {
  return (
    <Link
      href="/"
      className="inline-block w-full max-w-xs bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-md text-center transition-all"
    >
      {label}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-xs font-semibold tracking-widest text-teal-600 bg-teal-50 border border-teal-200 rounded-full px-4 py-1 mb-4">
      {children}
    </span>
  );
}

function Screenshot({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="mx-auto max-w-xs">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full rounded-2xl shadow-lg border border-gray-100"
      />
      <figcaption className="mt-3 text-center text-sm text-gray-500 font-medium">
        {caption}
      </figcaption>
    </figure>
  );
}

// ─── LP本体 ───────────────────────────────────────────────
export default function LP() {
  return (
    <main className="bg-white text-gray-800 font-sans antialiased">

      {/* ① ファーストビュー ──────────────────────────────── */}
      <section className="bg-gradient-to-b from-teal-50 via-white to-white px-6 pt-16 pb-14 text-center">
        <div className="mx-auto max-w-md space-y-5">
          <SectionLabel>透析患者さんの食事サポート</SectionLabel>

          <h1 className="text-3xl font-bold leading-tight text-gray-900">
            透析患者さんのための
            <br />
            <span className="text-teal-600">食事チェックアプリ</span>
          </h1>

          <p className="text-gray-500 leading-relaxed text-base">
            食べたものを選ぶだけで、
            <br />
            栄養バランスをすぐに確認できます。
          </p>

          <CtaButton label="今すぐ無料で試す" />
          <p className="text-xs text-gray-400">登録不要・アプリインストール不要</p>
        </div>
      </section>

      {/* ② 共感セクション ──────────────────────────────── */}
      <section className="px-6 py-14 bg-white">
        <div className="mx-auto max-w-md">
          <div className="text-center mb-8">
            <SectionLabel>お悩み</SectionLabel>
            <h2 className="text-2xl font-bold text-gray-900">
              こんな悩み、
              <br />
              ありませんか？
            </h2>
          </div>

          <ul className="space-y-3">
            {[
              "食べてから不安になる",
              "調べてもよく分からない",
              "毎回考えるのがしんどい",
            ].map((text) => (
              <li
                key={text}
                className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-2xl px-5 py-4"
              >
                <span className="w-6 h-6 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center flex-shrink-0 font-bold">
                  ✓
                </span>
                <span className="text-gray-700 font-medium text-base">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ③ 解決提示セクション ──────────────────────────── */}
      <section className="px-6 py-14 bg-teal-600 text-white text-center">
        <div className="mx-auto max-w-md space-y-4">
          <h2 className="text-2xl font-bold">その悩み、なくせます</h2>
          <p className="text-teal-100 leading-relaxed text-base">
            食べたものを選ぶだけで、
            <br />
            水分・塩分・カリウム・リンを
            <br />
            すぐに確認できます。
          </p>
          <div className="grid grid-cols-2 gap-3 pt-4">
            {["水分", "塩分", "カリウム", "リン"].map((item) => (
              <div
                key={item}
                className="bg-white/10 border border-white/20 rounded-2xl py-3 font-semibold text-white text-base"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ④ 操作紹介セクション ─────────────────────────── */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-md space-y-8">
          <div className="text-center">
            <SectionLabel>STEP 1</SectionLabel>
            <h2 className="text-2xl font-bold text-gray-900">
              選ぶだけで簡単に記録
            </h2>
            <p className="mt-3 text-gray-500 leading-relaxed">
              食材をタップして選ぶだけ。
              <br />
              難しい入力なしで記録できます。
            </p>
          </div>
          <Screenshot
            src="/screenshots/select.png"
            alt="食材選択画面"
            caption="食材を選んで、分量を選ぶだけ"
          />
        </div>
      </section>

      {/* ⑤ 栄養評価セクション ─────────────────────────── */}
      <section className="px-6 py-16 bg-teal-50">
        <div className="mx-auto max-w-md space-y-8">
          <div className="text-center">
            <SectionLabel>STEP 2</SectionLabel>
            <h2 className="text-2xl font-bold text-gray-900">
              食べた結果がすぐ分かる
            </h2>
            <p className="mt-3 text-gray-500 leading-relaxed">
              水分・塩分・カリウム・リンを
              <br />
              色で見やすく表示します。
            </p>
          </div>
          <Screenshot
            src="/screenshots/result-main.png"
            alt="栄養評価画面"
            caption="色でひと目に分かる栄養バランス"
          />
        </div>
      </section>

      {/* ⑥ アドバイスセクション ────────────────────────── */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-md space-y-8">
          <div className="text-center">
            <SectionLabel>STEP 3</SectionLabel>
            <h2 className="text-2xl font-bold text-gray-900">
              看護師視点の
              <br />
              やさしいアドバイス
            </h2>
            <p className="mt-3 text-gray-500 leading-relaxed">
              数値だけでなく、次の食事で
              <br />
              意識したいことも分かります。
            </p>
          </div>
          <Screenshot
            src="/screenshots/result-trust.png"
            alt="詳しいコメント画面"
            caption="次の食事に活かせるアドバイス"
          />
        </div>
      </section>

      {/* ⑦ カレンダー管理セクション ────────────────────── */}
      <section className="px-6 py-16 bg-teal-50">
        <div className="mx-auto max-w-md space-y-8">
          <div className="text-center">
            <SectionLabel>継続サポート</SectionLabel>
            <h2 className="text-2xl font-bold text-gray-900">
              記録の積み重ねが見える
            </h2>
            <p className="mt-3 text-gray-500 leading-relaxed">
              カレンダーで日々の記録を
              <br />
              振り返れます。
            </p>
          </div>

          {/* カレンダーイメージカード */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <div className="grid grid-cols-7 gap-1 text-center mb-4">
              {["日", "月", "火", "水", "木", "金", "土"].map((d, i) => (
                <span
                  key={d}
                  className={`text-xs font-semibold ${
                    i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"
                  }`}
                >
                  {d}
                </span>
              ))}
              {[
                { d: null }, { d: null }, { d: 1, st: "none" }, { d: 2, st: "ok" },
                { d: 3, st: "caution" }, { d: 4, st: "ok" }, { d: 5, st: "none" },
                { d: 6, st: "ok" }, { d: 7, st: "ok" }, { d: 8, st: "ng" },
                { d: 9, st: "ok" }, { d: 10, st: "ok" }, { d: 11, st: "ok" },
                { d: 12, st: "none" },
              ].map((cell, i) =>
                cell.d === null ? (
                  <div key={`blank-${i}`} className="h-9" />
                ) : (
                  <div
                    key={cell.d}
                    className={`h-9 flex flex-col items-center justify-center rounded-xl ${
                      cell.st === "ok"      ? "bg-teal-50" :
                      cell.st === "caution" ? "bg-yellow-50" :
                      cell.st === "ng"      ? "bg-red-50" : ""
                    }`}
                  >
                    <span className="text-xs text-gray-600 font-medium">{cell.d}</span>
                    {cell.st !== "none" && (
                      <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${
                        cell.st === "ok"      ? "bg-teal-400" :
                        cell.st === "caution" ? "bg-yellow-400" : "bg-red-400"
                      }`} />
                    )}
                  </div>
                )
              )}
            </div>
            <div className="flex gap-4 justify-center text-xs text-gray-400 pt-2 border-t">
              {[
                { color: "bg-teal-400",   label: "良好" },
                { color: "bg-yellow-400", label: "注意" },
                { color: "bg-red-400",    label: "多め" },
              ].map(({ color, label }) => (
                <span key={label} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${color}`} />{label}
                </span>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            続けるほど、食事の傾向が分かってきます。
          </p>
        </div>
      </section>

      {/* ⑧ プレミアムセクション ────────────────────────── */}
      <section className="px-6 py-16 bg-white">
        <div className="mx-auto max-w-md space-y-6">
          <div className="text-center">
            <SectionLabel>プレミアム</SectionLabel>
            <h2 className="text-2xl font-bold text-gray-900">
              より詳しく管理したい方へ
            </h2>
            <p className="mt-3 text-gray-500 text-sm leading-relaxed">
              基本機能は無料でお使いいただけます。
              <br />
              必要な方のみ、買い切りでご利用ください。
            </p>
          </div>

          {/* 無料 vs プレミアム */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-5">
              <p className="text-sm font-bold text-gray-600 mb-3">無料でできること</p>
              <ul className="space-y-2.5">
                {["食事の記録・確認", "栄養バランスの判定", "日々の振り返り"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-teal-500 font-bold">✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border-2 border-teal-200 bg-teal-50 px-5 py-5">
              <p className="text-sm font-bold text-teal-700 mb-3">プレミアムでできること</p>
              <ul className="space-y-2.5">
                {[
                  "記録回数の拡張",
                  "振り返り機能の強化",
                  "継続を支える補助機能",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-teal-500 font-bold">＋</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-sm text-gray-500 text-center mt-3">
            透析専門看護師・管理栄養士監修
          </p>

          {/* Stripe CTA */}
          <button
            onClick={handleCheckout}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold py-4 rounded-2xl shadow-md transition-all"
          >
            <span className="block text-lg">プレミアムを始める</span>
            <span className="block text-sm opacity-80 mt-0.5">買い切り ¥500</span>
          </button>

          <p className="text-xs text-gray-400 text-center">
            まずは無料版で試してから、必要に感じたときにどうぞ。
          </p>
        </div>
      </section>

      {/* ⑨ 最終CTA ────────────────────────────────────── */}
      <section className="px-6 py-16 bg-gradient-to-b from-teal-50 to-white text-center">
        <div className="mx-auto max-w-md space-y-5">
          <h2 className="text-2xl font-bold text-gray-900 leading-snug">
            透析中の食事管理を、
            <br />
            もっと簡単に。
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            登録不要・無料ですぐに始められます。
          </p>
          <CtaButton label="今すぐ無料で始める" />
          <p className="text-xs text-gray-400">
            ※栄養目標の個別設定は主治医・透析施設の方針を優先してください。
          </p>
        </div>
      </section>

    </main>
  );
}
