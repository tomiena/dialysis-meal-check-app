"use client";

const handleCheckout = async () => {
  try {
    const res = await fetch("/api/checkout", {
      method: "POST",
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("決済ページの取得に失敗しました。");
    }
  } catch (error) {
    console.error("Checkout Error:", error);
    alert("エラーが発生しました。");
  }
};

export default function LPPage() {
  return (
    <main className="bg-white text-gray-800">
      {/* ヒーローセクション */}
      <section className="text-center py-20 px-6 bg-gradient-to-b from-teal-50 to-white">
        <h1 className="text-3xl md:text-5xl font-bold leading-tight">
          透析患者さんの食事サポート
        </h1>
        <p className="mt-4 text-xl md:text-2xl font-semibold text-teal-600">
          「これ食べて大丈夫？」
        </p>
        <p className="mt-2 text-lg md:text-xl">
          その不安、3秒で解決。
        </p>
        <p className="mt-4 text-gray-600">
          食べたものを選ぶだけで<br />
          塩分・カリウム・リンをすぐ判定
        </p>

        <a
          href="/"
          className="inline-block mt-8 bg-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-md hover:bg-teal-700 transition"
        >
          今すぐ無料でチェックする
        </a>

        <p className="mt-2 text-sm text-gray-500">
          登録不要・無料で使えます
        </p>
      </section>

      {/* 悩みセクション */}
      <section className="py-16 px-6 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center">
          こんな悩み、ありませんか？
        </h2>
        <ul className="mt-8 space-y-4 text-lg">
          <li>✔ 食べてから不安になる</li>
          <li>✔ 調べてもよく分からない</li>
          <li>✔ 毎回考えるのがしんどい</li>
        </ul>
        <p className="text-center mt-6 text-teal-600 font-semibold">
          👉 その悩み、なくせます
        </p>
      </section>

      {/* アプリ説明 */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center">
            このアプリについて
          </h2>
          <p>
            このアプリは、透析患者さんの「食事の不安」を減らすために作りました。
          </p>
          <p>
            「これ食べていいのかな？」
            「あとで体に影響が出ないかな？」
          </p>
          <p>
            そんな不安を抱えながら食事をしている方を、
            私はたくさん見てきました。
          </p>
          <p className="font-semibold text-teal-600">
            食べたあとに安心できる仕組みを提供します。
          </p>
        </div>
      </section>

      {/* 特徴 */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-10">
          アプリの特徴
        </h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="font-semibold text-lg">食べた後、すぐ判定</h3>
            <p className="text-gray-600 mt-2">
              ナトリウム・カリウム・リンを自動計算。
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">色でパッと分かる</h3>
            <p className="text-gray-600 mt-2">
              判定結果を直感的に表示します。
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-lg">食材を選ぶだけ</h3>
            <p className="text-gray-600 mt-2">
              入力は30秒以内で完了します。
            </p>
          </div>
        </div>
      </section>

      {/* ベネフィット */}
      <section className="bg-teal-50 py-16 px-6 text-center">
        <h2 className="text-2xl font-bold">
          使い続けると、こう変わる
        </h2>
        <div className="mt-8 grid md:grid-cols-3 gap-6 text-lg">
          <p>🧘 迷わなくなる</p>
          <p>🧠 考えなくていい</p>
          <p>😊 安心して食べられる</p>
        </div>

        <p className="mt-8 font-semibold">
          今日から、安心して食べよう。
        </p>

        <a
          href="/"
          className="inline-block mt-6 bg-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-md hover:bg-teal-700 transition"
        >
          今すぐ無料でチェックする
        </a>
      </section>

      {/* 料金 */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-2xl font-bold">
          追加機能について
        </h2>
        <p className="mt-4">
          基本機能は無料でお使いいただけます。
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-6 text-left">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">無料でできること</h3>
            <ul className="space-y-2">
              <li>✓ 食事の記録</li>
              <li>✓ 栄養の確認</li>
              <li>✓ 日々の振り返り</li>
            </ul>
          </div>

          <div className="bg-teal-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-3">追加機能</h3>
            <ul className="space-y-2">
              <li>＋ 記録サポートの強化</li>
              <li>＋ 振り返り機能の向上</li>
              <li>＋ 継続を支援する補助機能</li>
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <p className="text-3xl font-bold text-teal-600">
            ¥500 買い切り
          </p>
          <p className="text-gray-500">毎月の課金はありません。</p>
        </div>

        <button
          onClick={handleCheckout}
          className="inline-block mt-8 bg-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-md hover:bg-teal-700 transition"
        >
          必要な方はこちら
        </button>
      </section>
    </main>
  );
}
