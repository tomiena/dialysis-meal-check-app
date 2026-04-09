import PremiumButton from "./PremiumButton";

export default function PremiumSupportRow() {
  return (
    <div className="flex items-center justify-between bg-teal-50 border border-teal-100 rounded-2xl px-4 py-3">
      <p className="text-xs text-teal-700 leading-snug">
        無理なく続けられる<br />記録を応援します
      </p>
      <PremiumButton label="プレミアムを始める" small />
    </div>
  );
}
