"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { useCurrentUser } from "@/hooks/use-current-user";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, needsOnboarding } = useCurrentUser();

  useEffect(() => {
    if (!loading && needsOnboarding && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [loading, needsOnboarding, pathname, router]);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper text-ink">
        <div className="surface p-6 text-center">
          <p className="text-sm font-black">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Sidebar />
      <MobileHeader />
      <main className="min-h-screen px-4 pb-28 pt-3 md:px-6 lg:ml-[274px] lg:px-6 lg:pb-10 lg:pt-4">
        <TopBar />
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
