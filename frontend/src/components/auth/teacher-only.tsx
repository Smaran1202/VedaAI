"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";
import { canCreateAssignments } from "@/lib/roles";

export function TeacherOnly({ children }: { children: ReactNode }) {
  const { loading, role } = useCurrentUser();

  if (loading) {
    return null;
  }

  if (!canCreateAssignments(role)) {
    return (
      <div className="surface mx-auto max-w-xl p-6 text-center">
        <h2 className="text-lg font-black">Teacher access required</h2>
        <p className="mt-2 text-sm leading-6 text-neutral-500">
          Assignment creation is available for teacher and admin roles.
        </p>
        <Link href="/assignments" className="btn-primary mt-5">
          Back to assignments
        </Link>
      </div>
    );
  }

  return children;
}
