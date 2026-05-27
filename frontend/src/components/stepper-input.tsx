import { Minus, Plus } from "lucide-react";

export function StepperInput({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-bold text-neutral-500">{label}</p>
      <div className="flex h-10 items-center justify-between rounded-xl border border-line bg-white px-2 transition focus-within:ring-2 focus-within:ring-ink/10">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 outline-none transition hover:bg-neutral-200 focus:ring-2 focus:ring-ink/10"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="text-sm font-black">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-100 outline-none transition hover:bg-neutral-200 focus:ring-2 focus:ring-ink/10"
          aria-label={`Increase ${label}`}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
