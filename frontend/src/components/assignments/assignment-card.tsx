"use client";

import { CalendarClock, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAssignmentStore } from "@/store/assignment-store";
import type { Assignment, AssignmentStatus } from "@/types";

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB").replaceAll("/", "-");
}

export function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteAssignment = useAssignmentStore((state) => state.deleteAssignment);
  const assignmentId = assignment.id || assignment._id || "";

  return (
    <article className="surface relative p-4 transition hover:-translate-y-0.5 hover:border-neutral-300">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/assignments/${assignmentId}`}
          className="min-w-0 flex-1 rounded-xl outline-none focus:ring-2 focus:ring-ink/10"
        >
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-black tracking-[-0.01em]">{assignment.title}</h3>
            <StatusBadge status={normalizeStatus(assignment.status)} />
          </div>
          <p className="mt-1 text-xs font-medium text-neutral-500">
            {assignment.subject} - {assignment.totalQuestions} questions - {assignment.totalMarks} marks
          </p>
          <div className="mt-3 grid gap-1.5 text-xs text-neutral-500">
            <p className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5" />
              Assigned on: <span className="font-semibold text-neutral-800">{formatDate(assignment.createdAt)}</span>
            </p>
            <p className="pl-5">
              Due: <span className="font-semibold text-neutral-800">{formatDate(assignment.dueDate)}</span>
            </p>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="icon-button h-8 w-8 border-transparent bg-transparent"
          aria-expanded={open}
          aria-label="Assignment menu"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {open ? (
        <div className="absolute right-4 top-12 z-10 w-40 rounded-2xl border border-line bg-white p-1.5 text-sm shadow-soft">
          <Link
            href={`/assignments/${assignmentId}`}
            className="block rounded-xl px-3 py-2 font-semibold outline-none hover:bg-neutral-50 focus:bg-neutral-50"
          >
            View Assignment
          </Link>
          <button
            type="button"
            disabled={isDeleting}
            title={isDeleting ? "Deleting assignment" : undefined}
            onClick={async () => {
              const confirmed = window.confirm(`Delete "${assignment.title}"?`);

              if (!confirmed) {
                return;
              }

              setIsDeleting(true);
              setOpen(false);
              await deleteAssignment(assignmentId);
              setIsDeleting(false);
            }}
            className="w-full rounded-xl px-3 py-2 text-left font-semibold text-ember outline-none hover:bg-orange-50 focus:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      ) : null}
    </article>
  );
}

function normalizeStatus(status: string): AssignmentStatus {
  return ["queued", "processing", "completed", "failed"].includes(status)
    ? (status as AssignmentStatus)
    : "queued";
}
