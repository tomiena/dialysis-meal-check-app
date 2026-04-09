type Status = "ok" | "caution" | "ng";

type Props = {
  name: string;
  value: number;
  unit: string;
  status: Status;
  maxDisplay: number;
};

const STATUS_STYLES: Record<Status, { bar: string; badge: string; label: string }> = {
  ok:      { bar: "bg-teal-400",   badge: "bg-teal-50 text-teal-700 border-teal-200",   label: "良好" },
  caution: { bar: "bg-yellow-400", badge: "bg-yellow-50 text-yellow-700 border-yellow-200", label: "やや多め" },
  ng:      { bar: "bg-red-400",    badge: "bg-red-50 text-red-700 border-red-200",       label: "多すぎ" },
};

export default function NutrientCard({ name, value, unit, status, maxDisplay }: Props) {
  const s = STATUS_STYLES[status];
  const pct = Math.min((value / maxDisplay) * 100, 100);

  return (
    <div className="bg-white rounded-2xl border p-4 space-y-2 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">{name}</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${s.badge}`}>
          {s.label}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-800">
        {value.toLocaleString()}
        <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </p>
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${s.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
