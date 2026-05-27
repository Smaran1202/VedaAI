import { ClipboardPlus, Plus } from "lucide-react";
import Link from "next/link";
import { ASSIGNMENT_EMPTY_COPY } from "@/lib/constants";

export function EmptyAssignments() {
  return (
    <section className="flex min-h-[calc(100vh-180px)] items-center justify-center">
      <div className="surface mx-auto max-w-xl px-6 py-10 text-center md:px-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-ember">
          <ClipboardPlus className="h-9 w-9" />
        </div>
        <h2 className="mt-6 text-2xl font-black">{ASSIGNMENT_EMPTY_COPY.title}</h2>
        <p className="mt-3 text-sm leading-6 text-neutral-500">
          {ASSIGNMENT_EMPTY_COPY.description}
        </p>
        <Link href="/assignments/create" className="btn-primary mt-7">
          <Plus className="h-4 w-4" />
          Create Your First Assignment
        </Link>
      </div>
    </section>
  );
}
