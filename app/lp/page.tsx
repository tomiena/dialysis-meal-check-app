export default function LP() {
  return (
    <main className="bg-gradient-to-b from-teal-50 to-white text-gray-800">

      {/* ① ファーストビュー */}
      <section className="px-6 pt-16 pb-12 text-center">
        <h1 className="text-3xl font-bold leading-tight">
          透析の食事、
          <br />
          「これ大丈夫？」が一瞬で分かる
        </h1>

        <p className="mt-4 text-gray-600">
          食べたらすぐチェック。
          <br />
          色で判断（OK / 注意 / 多すぎ）
        </p>

        <a
          href="https://food-app-sr7i.vercel.app/"
          className="inline-block mt-6 bg-teal-600 text-white px-6 py-3 rounded-xl shadow-md"
        >
          無料で使う
        </a>
      </section>

      {/* ② 共感 */}
      <section className="px-6 py-10 bg-white">
        <div className="max-w-md mx-auto">
          <ul className="space-y-3 text-gray-700">
            <li>✔ 食べてから不安になる</li>
            <li>✔ 調べてもよく分からない</li>
            <li>✔ 毎回考えるのがしんどい</li>
          </ul>

          <p className="mt-6 font-semibold text-center">
            👉 その悩み、なくせます
          </p>
        </div>
      </section>

      {/* ③ スクショ */}
      <section className="px-6 py-12 text-center">
        <h2 className="text-xl font-semibold mb-6">
          食べた結果がすぐ分かる
        </h2>

        <div className="max-w-sm mx-auto">
          <img
            src="/screenshots/app.png"
            className="rounded-2xl shadow-md border"
            alt="アプリ画面"
          />
        </div>
      </section>

      {/* ④ ベネフィット */}
      <section className="px-6 py-10 bg-teal-50">
        <div className="max-w-md mx-auto text-center">
          <ul className="space-y-3">
            <li>✔ 迷わなくなる</li>
            <li>✔ 考えなくていい</li>
            <li>✔ 無理なく続けられる</li>
          </ul>
        </div>
      </section>

      {/* ⑤ CTA */}
      <section className="px-6 py-14 text-center">
        <h2 className="text-xl font-bold">
          今すぐ始めてみませんか？
        </h2>

        <a
          href="https://food-app-sr7i.vercel.app/"
          className="inline-block mt-6 bg-teal-600 text-white px-6 py-3 rounded-xl shadow-md"
        >
          無料で使う
        </a>
      </section>

      {/* ⑥ 料金（将来の布石） */}
      <section className="px-6 pb-20 text-center">
        <p className="text-gray-500 text-sm">
          ※無料で使えます（プレミアム機能は準備中）
        </p>
      </section>

    </main>
  );
}
