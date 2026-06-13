"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";

export function DashboardRouter() {
  const router = useRouter();
  const { loading, needsOnboarding, role } = useCurrentUser();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (needsOnboarding) {
      router.replace("/onboarding");
      return;
    }

    if (role === "student") {
      router.replace("/assignments");
      return;
    }

    router.replace("/assignments");
  }, [loading, needsOnboarding, role, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-paper px-4 text-ink">
      <div className="surface p-6 text-center">
        <p className="text-sm font-black">Opening your workspace...</p>
      </div>
    </main>
  );
}
