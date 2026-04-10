"use client";

const handleCheckout = async () => {
  try {
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("決済ページの取得に失敗しました。");
    }
  } catch (error) {
    console.error("Checkout error:", error);
    alert("エラーが発生しました。");
  }
};

export default function LP() {
  return (
    <main className="bg-white text-gray-800 font-sans">

      {/* ① ヒーロー */}
      <section className="bg-gradient-to-b from-teal-50 to-white px-6 pt-20 pb-16 text-center">
        <span className="inline-block text-teal-700 font-semibold text-xs tracking-widest bg-teal-100 px-4 py-1.5 rounded-full mb-6">
          透析患者さんの食事サポート
        </span>

        <h1 className="text-3xl md:text-4xl font-bold leading-snug text-gray-900">
          「これ食べて大丈夫？」
          <br />
          <span className="text-teal-600">その不安、3秒で解決</span>
        </h1>

        <p className="mt-5 text-gray-500 leading-relaxed text-base">
          食べたものを選ぶだけで
          <br />
          塩分・カリウム・リンをすぐ判定
        </p>

        <a
          href="/"
          className="inline-block mt-8 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-semibold px-8 py-4 rounded-xl shadow-md text-base transition-all"
        >
          今すぐ無料でチェックする
        </a>
        <p className="mt-3 text-xs text-gray-400">登録不要・無料で使えます</p>
      </section>

      {/* ② 共感 */}
      <section className="px-6 py-14 bg-white">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-8">
            こんな悩み、ありませんか？
          </h2>
          <ul className="space-y-3">
            {[
              "食べてから不安になる",
              "調べてもよく分からない",
              "毎回考えるのがしんどい",
            ].map((text) => (
              <li
                key={text}
                className="flex items-center gap-3 bg-teal-50 border border-teal-100 rounded-xl px-5 py-4"
              >
                <span className="w-5 h-5 rounded-full bg-teal-500 text-white text-xs flex items-center justify-center flex-shrink-0">✓</span>
                <span className="text-gray-700 font-medium">{text}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-center font-bold text-teal-600 text-lg">
            その悩み、なくせます
          </p>
        </div>
      </section>

      {/* ③ このアプリについて */}
      <section className="bg-teal-600 text-white px-6 py-16">
        <div className="max-w-md mx-auto space-y-5">
          <p className="text-xs font-semibold tracking-widest opacity-70 text-center uppercase">
            About this app
          </p>
          <h2 className="text-xl font-bold text-center">このアプリについて</h2>
          <p className="leading-relaxed text-teal-50 text-[0.95rem]">
            このアプリは、透析患者さんの「食事の不安」を
            <br />
            減らすために作りました。
          </p>
          <p className="leading-relaxed text-teal-50 text-[0.95rem]">
            「これ食べていいのかな」
            「体に影響が出ないかな」
            <br />
            そんな不安を抱えながら食事をしている方を、
            私はたくさん見てきました。
          </p>
          <p className="leading-relaxed font-semibold text-white text-[0.95rem]">
            だからこそ、食べたあとに安心できる仕組みを作りたいと思いました。
          </p>
        </div>
      </section>

      {/* ④ スクリーンショット */}
      <section className="py-14">
        <h2 className="text-xl font-bold text-center px-6 mb-8 text-gray-800">
          食べた結果がすぐ分かる
        </h2>

        <div className="grid md:grid-cols-2 gap-8 mt-12 px-6">
          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/screenshots/result-main.png"
              alt="判定結果画面"
              className="rounded-xl shadow-md mx-auto"
            />
            <p className="mt-4 font-semibold">食べた後、すぐ判定</p>
            <p className="text-gray-500 text-sm">色でパッと分かる</p>
          </div>

          <div className="text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/screenshots/result-trust.png"
              alt="アドバイス画面"
              className="rounded-xl shadow-md mx-auto"
            />
            <p className="mt-4 font-semibold">アドバイスも表示</p>
            <p className="text-gray-500 text-sm">次の食事に活かせる</p>
          </div>
        </div>

        <div className="text-center mt-10 px-6">
          <a
            href="/"
            className="inline-block bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-semibold px-8 py-4 rounded-xl shadow-md text-base transition-all"
          >
            今すぐ無料でチェックする
          </a>
        </div>
      </section>

      {/* ⑤ ベネフィット */}
      <section className="bg-teal-50 px-6 py-14">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold text-center text-gray-800 mb-8">
            使い続けると、こう変わる
          </h2>
          <ul className="space-y-3">
            {[
              { icon: "🧘", text: "迷わなくなる" },
              { icon: "🧠", text: "考えなくていい" },
              { icon: "😊", text: "安心して食べられる" },
            ].map(({ icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm border border-teal-100"
              >
                <span className="text-2xl">{icon}</span>
                <span className="font-semibold text-gray-700">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ⑥ 追加機能 */}
      <section className="px-6 py-14 bg-white">
        <div className="max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">追加機能について</h2>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              基本機能は無料でお使いいただけます。
              <br />
              必要な方のみ追加機能をご利用ください。
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-5">
            <p className="text-sm font-bold text-gray-700 mb-3">無料でできること</p>
            <ul className="space-y-2">
              {["食事の記録", "栄養の確認", "日々の振り返り"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-teal-500">✓</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-teal-100 bg-teal-50 px-5 py-5">
            <p className="text-sm font-bold text-teal-700 mb-3">追加機能でできること</p>
            <ul className="space-y-2">
              {["記録サポートの強化", "振り返り機能の向上", "継続を支援する補助機能"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-teal-400">＋</span>{item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-gray-500 leading-relaxed text-center">
            まずは無料版をそのままお使いください。
            <br />
            必要になったときに、いつでもご利用いただけます。
          </p>

          {/* ⑦ Stripe CTA */}
          <div className="text-center pt-2 pb-6">
            <button
              onClick={handleCheckout}
              className="w-full max-w-md mx-auto block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-2xl shadow-md transition duration-200 text-center"
            >
              <span className="block text-lg">
                プレミアムを始める
              </span>
              <span className="block text-sm opacity-90">
                買い切り ¥500
              </span>
            </button>
          </div>
        </div>
      </section>

    </main>
  );
}
