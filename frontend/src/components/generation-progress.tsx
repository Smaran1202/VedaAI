import type { AssignmentStatus } from "@/types";

const statusCopy: Record<AssignmentStatus, { label: string; progress: string }> = {
  queued: { label: "Queued...", progress: "w-1/4" },
  processing: { label: "Generating...", progress: "w-2/3" },
  completed: { label: "Completed", progress: "w-full" },
  failed: { label: "Generation failed", progress: "w-full" }
};

export function GenerationProgress({
  status,
  onRetry,
  isRetrying
}: {
  status: AssignmentStatus | string;
  onRetry?: () => void;
  isRetrying?: boolean;
}) {
  const normalizedStatus = isAssignmentStatus(status) ? status : "queued";
  const copy = statusCopy[normalizedStatus];
  const failed = normalizedStatus === "failed";

  return (
    <div className="surface mx-auto w-full max-w-[850px] p-5" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-full border border-line">
          <span className={`h-4 w-4 rounded-full border-2 ${failed ? "border-red-500" : "animate-spin border-neutral-300 border-t-ink"}`} />
        </div>
        <div>
          <p className="text-sm font-black">{copy.label}</p>
          <p className="mt-0.5 text-xs text-neutral-500">Your question paper will update here automatically.</p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-neutral-100">
        <div className={`h-full rounded-full ${failed ? "bg-red-500" : "bg-ink"} transition-all duration-500 ${copy.progress}`} />
      </div>
      {failed && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          title={isRetrying ? "Retry is being queued" : undefined}
          className="btn-primary mt-4 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRetrying ? "Retrying..." : "Retry generation"}
        </button>
      ) : null}
    </div>
  );
}

function isAssignmentStatus(status: string): status is AssignmentStatus {
  return ["queued", "processing", "completed", "failed"].includes(status);
}
