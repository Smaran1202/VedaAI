import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";

interface UtilityPageProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function UtilityPage({ title, description, children }: UtilityPageProps) {
  return (
    <AppShell>
      <section className="mx-auto w-full max-w-5xl">
        <div className="surface p-6 md:p-8">
          <h1 className="text-2xl font-black tracking-tight md:text-[26px]">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">{description}</p>
          {children ? <div className="mt-5">{children}</div> : null}
          <Link href="/assignments" className="btn-primary mt-6">
            Back to Assignments
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
