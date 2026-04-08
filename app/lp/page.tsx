import Image from "next/image";
import PremiumButton from "@/app/components/PremiumButton";

export default function LP() {
  return (
    <main className="bg-gradient-to-b from-teal-50 to-white text-gray-800">

      {/* ① ヒーロー */}
      <section className="px-6 pt-20 pb-14 text-center">
        <p className="inline-block text-teal-700 font-semibold text-sm tracking-wide bg-teal-100 px-4 py-1 rounded-full mb-5">
          透析患者さんの食事サポート
        </p>

        <h1 className="text-3xl font-bold leading-snug">
          「これ食べて大丈夫？」
          <br />
          <span className="text-teal-600">その不安、3秒で解決</span>
        </h1>

        <p className="mt-5 text-gray-600 leading-relaxed">
          食べたものを選ぶだけで
          <br />
          塩分・カリウム・リンをすぐ判定
        </p>

        <a
          href="https://food-app-sr7i.vercel.app/"
          className="inline-block mt-8 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-4 rounded-xl shadow-md text-base transition-colors"
        >
          今すぐ無料でチェックする
        </a>

        <p className="mt-3 text-xs text-gray-400">登録不要・無料で使えます</p>
      </section>

      {/* ② 共感 */}
      <section className="px-6 py-12 bg-white">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-bold text-center mb-6 text-gray-700">
            こんな悩み、ありませんか？
          </h2>

          <ul className="space-y-4">
            {[
              "食べてから不安になる",
              "調べてもよく分からない",
              "毎回考えるのがしんどい",
            ].map((text) => (
              <li
                key={text}
                className="flex items-center gap-3 bg-teal-50 rounded-xl px-5 py-4 shadow-sm"
              >
                <span className="text-teal-500 font-bold text-lg">✔</span>
                <span className="text-gray-700">{text}</span>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-lg font-bold text-center text-teal-700">
            👉 その悩み、なくせます
          </p>
        </div>
      </section>

      {/* ③ 想い */}
      <section className="px-6 py-14 bg-teal-600 text-white">
        <div className="max-w-md mx-auto">
          <p className="text-sm font-semibold tracking-widest opacity-80 mb-4 text-center">
            このアプリについて
          </p>

          <p className="leading-loose text-[1rem]">
            このアプリは、
            <br />
            透析患者さんの「食事の不安」を減らすために作りました。
          </p>

          <p className="mt-6 leading-loose text-[1rem]">
            毎回、
            <br />
            「これ食べていいのかな」
            <br />
            「あとで体に影響出ないかな」
          </p>

          <p className="mt-6 leading-loose text-[1rem]">
            そんな不安を抱えながら食事をしている方を、
            <br />
            私はたくさん見てきました。
          </p>

          <p className="mt-6 leading-loose text-[1rem] font-semibold">
            だからこそ、
            <br />
            「食べたあとに安心できる仕組み」を作りたいと思いました。
          </p>
        </div>
      </section>

      {/* ④ スクリーンショット */}
      <section className="py-14">
        <h2 className="text-xl font-bold mb-8 text-center px-6">
          食べた結果がすぐ分かる
        </h2>

        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory px-6 pb-4 scrollbar-hide">
          <div className="flex-none w-64 snap-center">
            <div className="rounded-2xl shadow-md border bg-white overflow-hidden">
              <Image
                src="/screenshots/result-main.png"
                width={256}
                height={480}
                className="w-full h-auto"
                alt="ナトリウム・カリウム・リンの判定結果画面"
              />
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-700 text-center">食べた後、すぐ判定</p>
            <p className="text-xs text-gray-400 text-center mt-1">色でパッと分かる</p>
          </div>

          <div className="flex-none w-64 snap-center">
            <div className="rounded-2xl shadow-md border bg-white overflow-hidden">
              <Image
                src="/screenshots/select.png"
                width={256}
                height={480}
                className="w-full h-auto"
                alt="食材を選んで判定する操作画面"
              />
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-700 text-center">食材を選ぶだけ</p>
            <p className="text-xs text-gray-400 text-center mt-1">入力は30秒以内</p>
          </div>

          <div className="flex-none w-64 snap-center">
            <div className="rounded-2xl shadow-md border bg-white overflow-hidden">
              <Image
                src="/screenshots/result-trust.png"
                width={256}
                height={480}
                className="w-full h-auto"
                alt="塩分・カリウム・リンの詳細判定とアドバイス表示"
              />
            </div>
            <p className="mt-3 text-sm font-semibold text-gray-700 text-center">アドバイスも表示</p>
            <p className="text-xs text-gray-400 text-center mt-1">次の食事に活かせる</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-2">← スワイプで確認 →</p>

        <div className="text-center mt-10 px-6">
          <a
            href="https://food-app-sr7i.vercel.app/"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-4 rounded-xl shadow-md text-base transition-colors"
          >
            今すぐ無料でチェックする
          </a>
        </div>
      </section>

      {/* ⑤ ベネフィット */}
      <section className="px-6 py-12 bg-teal-50">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-bold text-center mb-6 text-gray-700">
            使い続けると、こう変わる
          </h2>

          <ul className="space-y-4">
            {[
              { icon: "🧘", text: "迷わなくなる" },
              { icon: "🧠", text: "考えなくていい" },
              { icon: "😊", text: "安心して食べられる" },
            ].map(({ icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm"
              >
                <span className="text-2xl">{icon}</span>
                <span className="font-semibold text-gray-700">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ⑥ 最終CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-2xl font-bold leading-snug">
          今日から、
          <br />
          <span className="text-teal-600">安心して食べよう。</span>
        </h2>

        <p className="mt-4 text-gray-500 text-sm">
          登録不要。すぐ使えます。
        </p>

        <a
          href="https://food-app-sr7i.vercel.app/"
          className="inline-block mt-8 bg-teal-600 hover:bg-teal-700 text-white font-semibold px-10 py-4 rounded-xl shadow-md text-base transition-colors"
        >
          今すぐ無料でチェックする
        </a>
      </section>

      {/* ⑦ 追加機能について */}
      <section className="px-6 pb-20 bg-white">
        <div className="max-w-md mx-auto space-y-8">

          {/* タイトル・リード文 */}
          <div className="pt-10 text-center">
            <h2 className="text-xl font-bold text-gray-800">追加機能について</h2>
            <p className="mt-4 text-gray-500 text-sm leading-loose">
              このアプリは、基本機能を無料でお使いいただけます。
              <br />
              まずは無料で続けていただき、
              <br />
              必要な方のみ追加機能をご利用ください。
            </p>
          </div>

          {/* 無料でできること */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-5">
            <p className="text-sm font-bold text-gray-700 mb-3">無料でできること</p>
            <ul className="space-y-2">
              {[
                "食事の記録",
                "栄養の確認",
                "日々の振り返り",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-teal-500 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 追加機能でできること */}
          <div className="rounded-2xl border border-teal-100 bg-teal-50 px-5 py-5">
            <p className="text-sm font-bold text-teal-700 mb-3">追加機能でできること</p>
            <ul className="space-y-2">
              {[
                "より便利な記録サポート",
                "振り返りのしやすさ向上",
                "継続しやすくなる補助機能",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-teal-400 mt-0.5">＋</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* 料金 */}
          <div className="rounded-2xl border border-gray-200 px-5 py-5 text-center space-y-1">
            <p className="text-xs text-gray-400">追加機能の料金</p>
            <p className="text-3xl font-bold text-gray-800">
              ¥500
              <span className="text-base font-normal text-gray-400 ml-2">買い切り</span>
            </p>
            <p className="text-xs text-gray-400">毎月の課金はありません。</p>
          </div>

          {/* 締めの言葉 */}
          <p className="text-sm text-gray-500 leading-loose text-center px-2">
            まずは無料版をそのままお使いいただいて大丈夫です。
            <br />
            必要になったときに、いつでもご利用いただけます。
          </p>

          {/* ボタン */}
          <div className="text-center pb-4">
            <PremiumButton label="必要な方はこちら" />
          </div>

        </div>
      </section>

    </main>
  );
}
