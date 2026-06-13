import { X } from "lucide-react";
import type { AssignmentFormValues } from "@/lib/schemas";
import { StepperInput } from "@/components/forms/stepper-input";

type QuestionType = AssignmentFormValues["questionTypes"][number];

const questionTypes = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Long Answer Questions"
];

interface QuestionTypeRowProps {
  row: QuestionType;
  canRemove?: boolean;
  onChange: (patch: Partial<QuestionType>) => void;
  onRemove: () => void;
}

export function QuestionTypeRow({ row, canRemove = true, onChange, onRemove }: QuestionTypeRowProps) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3 md:grid md:grid-cols-[1fr_32px_142px_118px] md:items-end md:gap-3">
      <div className="flex items-start gap-2 md:block">
        <label className="min-w-0 flex-1">
          <span className="mb-1 block text-[11px] font-bold text-neutral-500">Question Type</span>
          <select
            value={row.type}
            onChange={(event) => onChange({ type: event.target.value })}
            className="control-muted text-xs font-semibold"
          >
            {questionTypes.map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          title={canRemove ? "Remove question type" : "At least one question type is required"}
          className="mt-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 outline-none transition hover:bg-neutral-200 focus:ring-2 focus:ring-ink/10 md:hidden"
          aria-label={canRemove ? "Remove question type" : "At least one question type is required"}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={!canRemove}
        title={canRemove ? "Remove question type" : "At least one question type is required"}
        className="hidden h-10 w-8 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 outline-none transition hover:bg-neutral-200 focus:ring-2 focus:ring-ink/10 disabled:cursor-not-allowed disabled:opacity-40 md:flex"
        aria-label={canRemove ? "Remove question type" : "At least one question type is required"}
      >
        <X className="h-4 w-4" />
      </button>

      <div className="mt-3 grid grid-cols-2 gap-3 md:mt-0 md:contents">
        <StepperInput label="No. of Questions" value={row.count} onChange={(count) => onChange({ count })} />
        <StepperInput label="Marks" value={row.marks} onChange={(marks) => onChange({ marks })} />
      </div>
    </div>
  );
}
