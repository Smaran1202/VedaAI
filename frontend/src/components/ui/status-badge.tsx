import type { AssignmentStatus } from "@/types";
import { cn } from "@/lib/utils";

const statusClasses: Record<AssignmentStatus, string> = {
  queued: "bg-yellow-100 text-yellow-800",
  processing: "bg-orange-100 text-orange-800",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800"
};

export function StatusBadge({ status }: { status: AssignmentStatus }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-black capitalize", statusClasses[status])}>
      {status}
    </span>
  );
}
