import { ChevronLeft, Filter, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AssignmentCard } from "@/components/assignments/assignment-card";
import { useCurrentUser } from "@/hooks/use-current-user";
import { canCreateAssignments } from "@/lib/roles";
import type { Assignment, AssignmentStatus } from "@/types";

interface AssignmentListProps {
  assignments: Assignment[];
  isSearching?: boolean;
  onSearch: (value: string) => void;
  onStatusFilterChange: (value: AssignmentStatus | "all") => void;
  search: string;
  statusFilter: AssignmentStatus | "all";
}

const filterOptions: Array<{ label: string; value: AssignmentStatus | "all" }> = [
  { label: "All", value: "all" },
  { label: "Queued", value: "queued" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Failed", value: "failed" }
];

export function AssignmentList({
  assignments,
  isSearching = false,
  onSearch,
  onStatusFilterChange,
  search,
  statusFilter
}: AssignmentListProps) {
  const [filterOpen, setFilterOpen] = useState(false);
  const router = useRouter();
  const { role } = useCurrentUser();
  const canCreate = canCreateAssignments(role);

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="mb-4 flex items-center justify-center md:justify-between">
        <button
          type="button"
          onClick={() => router.back()}
          className="icon-button absolute left-4 md:hidden"
          aria-label="Back to previous screen"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-black tracking-tight md:text-[26px]">Assignments</h1>
          <p className="mt-1 hidden text-sm text-neutral-500 md:block">Manage and create assignments for your classes.</p>
        </div>
      </div>

      <div className="surface mb-4 flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
        <div className="relative">
        <button
          type="button"
          onClick={() => setFilterOpen((value) => !value)}
          className="btn-secondary h-10 justify-center rounded-xl px-3 md:w-32"
          aria-label="Filter assignments"
          aria-expanded={filterOpen}
        >
          <Filter className="h-4 w-4" />
          Filter By
        </button>
        {filterOpen ? (
          <div className="absolute left-0 top-12 z-20 w-44 rounded-2xl border border-line bg-white p-1.5 text-sm shadow-soft">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onStatusFilterChange(option.value);
                  setFilterOpen(false);
                }}
                className="w-full rounded-xl px-3 py-2 text-left font-semibold outline-none hover:bg-neutral-50 focus:bg-neutral-50"
              >
                {option.label}{statusFilter === option.value ? " selected" : ""}
              </button>
            ))}
          </div>
        ) : null}
        </div>
        <label className="relative flex-1 md:max-w-sm">
          <span className="sr-only">Search assignments</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            className="control-muted pl-10"
            placeholder="Search Assignment"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
          />
        </label>
      </div>

      {assignments.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {assignments.map((assignment) => (
            <AssignmentCard key={assignment.id || assignment._id} assignment={assignment} />
          ))}
        </div>
      ) : (
        <div className="surface p-8 text-center">
          <p className="text-sm font-black">No assignments found</p>
          <p className="mt-1 text-sm text-neutral-500">
            {isSearching ? "Searching..." : "Try a different title or subject."}
          </p>
        </div>
      )}

      {canCreate ? (
        <Link
          href="/assignments/create"
          className="btn-primary fixed bottom-8 left-1/2 z-20 hidden -translate-x-1/2 px-5 lg:inline-flex"
        >
          <Plus className="h-4 w-4" />
          Create Assignment
        </Link>
      ) : null}

      {canCreate ? (
        <Link
          href="/assignments/create"
          className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-ember text-white shadow-soft outline-none transition hover:scale-105 focus:ring-2 focus:ring-ember/30 lg:hidden"
          aria-label="Create assignment"
        >
          <Plus className="h-6 w-6" />
        </Link>
      ) : null}
    </section>
  );
}
