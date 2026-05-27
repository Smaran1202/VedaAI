import type { ReactNode } from "react";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";

export function AppShell({ children }: { children: ReactNode }) {
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
