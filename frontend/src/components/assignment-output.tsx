"use client";

import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { ActionCard } from "@/components/action-card";
import { ExamPaper } from "@/components/exam-paper";
import { GenerationProgress } from "@/components/generation-progress";
import { OutputSkeleton } from "@/components/output-skeleton";
import { downloadAssignmentPdf } from "@/services/assignment.service";
import { useAssignmentStore } from "@/store/assignment-store";
import type { GeneratedPaper } from "@/types";

export function AssignmentOutput({ id }: { id: string }) {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const {
    error,
    fetchAssignmentById,
    isFetching,
    isLoading,
    regenerateAssignment,
    selectedAssignment,
    subscribeToGenerationEvents
  } =
    useAssignmentStore();

  useEffect(() => {
    void fetchAssignmentById(id);
    return subscribeToGenerationEvents();
  }, [fetchAssignmentById, id, subscribeToGenerationEvents]);

  useEffect(() => {
    const status = selectedAssignment?.status;

    if (status !== "queued" && status !== "processing") {
      return;
    }

    const interval = window.setInterval(() => {
      void fetchAssignmentById(id);
    }, 2000);

    return () => window.clearInterval(interval);
  }, [fetchAssignmentById, id, selectedAssignment?.status]);

  if (isLoading) {
    return <OutputSkeleton />;
  }

  if (error) {
    return (
      <section className="surface mx-auto max-w-xl p-6 text-center">
        <h1 className="text-lg font-black">Unable to load assignment</h1>
        <p className="mt-2 text-sm text-neutral-500">{error}</p>
        <button className="btn-primary mt-5" onClick={() => void fetchAssignmentById(id)}>
          Retry
        </button>
      </section>
    );
  }

  if (!selectedAssignment) {
    return <OutputSkeleton />;
  }

  const paper = getPaper(selectedAssignment.generatedPaper);

  async function handleDownloadPdf() {
    setIsDownloading(true);
    setDownloadError(null);

    try {
      await downloadAssignmentPdf(id);
    } catch {
      setDownloadError("PDF export failed. Please try again once generation is complete.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <button
        type="button"
        onClick={() => router.back()}
        className="icon-button w-fit lg:hidden"
        aria-label="Back to previous screen"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <ActionCard
        isDownloading={isDownloading}
        onDownload={paper ? () => void handleDownloadPdf() : undefined}
        subject={selectedAssignment.subject}
        title={selectedAssignment.title}
      >
        <button
          type="button"
          onClick={() => void regenerateAssignment(id)}
          disabled={isFetching}
          title={isFetching ? "Regeneration is being queued" : undefined}
          className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-black text-ink outline-none transition hover:bg-neutral-100 focus:ring-2 focus:ring-white/30 disabled:cursor-not-allowed disabled:opacity-60 md:mt-0 md:w-auto"
        >
          {isFetching ? "Queueing..." : "Regenerate"}
        </button>
      </ActionCard>
      {downloadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {downloadError}
        </p>
      ) : null}
      {paper ? (
        <>
          <GenerationProgress
            status={selectedAssignment.status}
            onRetry={() => void regenerateAssignment(id)}
            isRetrying={isFetching}
          />
          <ExamPaper paper={paper} />
        </>
      ) : (
        <GenerationProgress
          status={selectedAssignment.status}
          onRetry={() => void regenerateAssignment(id)}
          isRetrying={isFetching}
        />
      )}
    </section>
  );
}

function getPaper(value: unknown): GeneratedPaper | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<GeneratedPaper>;

  if (
    Array.isArray(candidate.sections) &&
    typeof candidate.school === "string" &&
    typeof candidate.subject === "string" &&
    typeof candidate.className === "string" &&
    typeof candidate.timeAllowed === "string" &&
    typeof candidate.maximumMarks === "number" &&
    typeof candidate.instructions === "string" &&
    Array.isArray(candidate.answerKey) &&
    candidate.sections.every(
      (section) =>
        typeof section.title === "string" &&
        typeof section.instruction === "string" &&
        typeof section.questionType === "string" &&
        Array.isArray(section.questions)
    )
  ) {
    return candidate as GeneratedPaper;
  }

  return null;
}
