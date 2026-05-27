import { cn } from "@/lib/utils";

const styles = {
  easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  hard: "bg-red-50 text-red-700 border-red-200"
};

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const normalized = normalizeDifficulty(difficulty);

  return (
    <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-bold capitalize", styles[normalized])}>
      {normalized}
    </span>
  );
}

function normalizeDifficulty(difficulty: string): keyof typeof styles {
  const normalized = difficulty.toLowerCase();

  if (normalized === "easy" || normalized === "medium" || normalized === "hard") {
    return normalized;
  }

  return "medium";
}
