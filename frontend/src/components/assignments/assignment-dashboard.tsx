"use client";

import { useEffect, useState } from "react";
import { AssignmentList } from "@/components/assignments/assignment-list";
import { AssignmentListSkeleton } from "@/components/assignments/assignment-list-skeleton";
import { EmptyAssignments } from "@/components/assignments/empty-assignments";
import { useAssignmentStore } from "@/store/assignment-store";
import type { AssignmentStatus } from "@/types";

export function AssignmentDashboard() {
  const [hasRequested, setHasRequested] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | "all">("all");
  const { assignments, error, fetchAssignments, isFetching, isLoading, subscribeToGenerationEvents } = useAssignmentStore();
  const visibleAssignments = statusFilter === "all"
    ? assignments
    : assignments.filter((assignment) => assignment.status === statusFilter);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setHasRequested(true);
      void fetchAssignments({ page: 1, limit: 10, search: search || undefined });
    }, search ? 250 : 0);

    return () => window.clearTimeout(timeout);
  }, [fetchAssignments, search]);

  useEffect(() => {
    return subscribeToGenerationEvents();
  }, [subscribeToGenerationEvents]);

  if (!hasRequested || isLoading) {
    return <AssignmentListSkeleton />;
  }

  if (error) {
    return (
      <section className="surface mx-auto max-w-xl p-6 text-center">
        <h1 className="text-lg font-black">Unable to load assignments</h1>
        <p className="mt-2 text-sm text-neutral-500">{error}</p>
        <button className="btn-primary mt-5" onClick={() => void fetchAssignments({ page: 1, limit: 10 })}>
          Retry
        </button>
      </section>
    );
  }

  if (assignments.length === 0 && !search && statusFilter === "all") {
    return (
      <>
        <EmptyAssignments />
        <a
          href="/assignments/create"
          className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-ember text-2xl font-light text-white shadow-soft outline-none transition hover:scale-105 focus:ring-2 focus:ring-ember/30 lg:hidden"
          aria-label="Create assignment"
        >
          +
        </a>
      </>
    );
  }

  return (
    <AssignmentList
      assignments={visibleAssignments}
      statusFilter={statusFilter}
      isSearching={isFetching && !isLoading}
      onSearch={setSearch}
      onStatusFilterChange={setStatusFilter}
      search={search}
    />
  );
}
