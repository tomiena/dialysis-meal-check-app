type Props = {
  advice: string;
  professional?: boolean;
};

export default function AdviceCard({ advice, professional = false }: Props) {
  return (
    <div className={`rounded-2xl border p-4 flex gap-3 items-start ${
      professional
        ? "bg-amber-50 border-amber-200"
        : "bg-white border-gray-200"
    }`}>
      <span className="text-2xl flex-shrink-0 mt-0.5">
        {professional ? "👩‍⚕️" : "💬"}
      </span>
      <div>
        {professional && (
          <p className="text-xs font-bold text-amber-700 mb-1">看護師からのアドバイス</p>
        )}
        <p className="text-sm text-gray-700 leading-relaxed">{advice}</p>
      </div>
    </div>
  );
}
