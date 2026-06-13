"use client";

import { Bell, Grid2X2, MoveLeft } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";

function labelForPath(pathname: string) {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/groups")) return "Users";
  if (pathname.startsWith("/toolkit")) return "Analytics";
  if (pathname.startsWith("/library")) return "Results";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.includes("/create")) return "Assignment / Create New";
  if (pathname !== "/assignments") return "Assignment / Preview";
  return "Assignment";
}

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [noticeOpen, setNoticeOpen] = useState(false);
  const { user } = useCurrentUser();

  return (
    <div className="surface mb-6 hidden h-14 items-center justify-between px-3 lg:flex">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => router.back()}
          className="icon-button bg-neutral-50"
          aria-label="Go back"
        >
          <MoveLeft className="h-4 w-4" />
        </button>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-neutral-50 text-neutral-700">
          <Grid2X2 className="h-4 w-4" />
        </div>
        <p className="text-sm font-semibold text-neutral-700">{labelForPath(pathname)}</p>
      </div>

      <div className="flex items-center gap-2.5">
        <div className="relative">
        <button
          type="button"
          onClick={() => setNoticeOpen((value) => !value)}
          className="icon-button bg-neutral-50"
          aria-label="Notifications"
          aria-expanded={noticeOpen}
        >
          <Bell className="h-4 w-4" />
        </button>
        {noticeOpen ? (
          <div className="absolute right-0 top-11 w-56 rounded-2xl border border-line bg-white p-3 text-sm font-semibold shadow-soft">
            No new notifications.
          </div>
        ) : null}
        </div>
        <div className="flex items-center gap-2 rounded-full border border-line bg-neutral-50 py-1 pl-1 pr-3">
          <UserButton afterSignOutUrl="/">
            <UserButton.MenuItems>
              <UserButton.Link label="Profile" labelIcon={<span />} href="/profile" />
            </UserButton.MenuItems>
          </UserButton>
          <span className="text-sm font-semibold">{user?.name ?? "VedaAI"}</span>
        </div>
      </div>
    </div>
  );
}
