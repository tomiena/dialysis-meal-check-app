import PremiumButton from "./PremiumButton";

export default function FreeLimitNotice() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="max-w-sm space-y-5">
        <p className="text-5xl">🔒</p>
        <h2 className="text-xl font-bold text-gray-800">
          無料プランは1日3食まで
        </h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          本日の記録は保存されました。<br />
          栄養評価を続けてご覧になるには<br />
          プレミアムプランをご利用ください。
        </p>
        <div className="bg-white rounded-2xl border shadow-sm p-4 space-y-2 text-left">
          <p className="text-xs font-bold text-teal-700 mb-1">プレミアムでできること</p>
          {[
            "1日の記録回数 無制限",
            "7日間カレンダー表示",
            "看護師アドバイス表示",
          ].map((item) => (
            <p key={item} className="text-sm text-gray-600 flex items-center gap-2">
              <span className="text-teal-500 font-bold">✓</span> {item}
            </p>
          ))}
          <p className="text-xs text-gray-400 mt-2">買い切り ¥500（一回のみ）</p>
        </div>
        <PremiumButton label="プレミアムを始める（¥500）" />
        <a href="/" className="block text-sm text-gray-400 underline">
          ホームに戻る
        </a>
      </div>
    </div>
  );
}
