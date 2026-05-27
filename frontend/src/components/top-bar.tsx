"use client";

import { Bell, ChevronDown, Grid2X2, MoveLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { SCHOOL_PROFILE } from "@/lib/constants";

function labelForPath(pathname: string) {
  if (pathname.startsWith("/groups")) return "My Groups";
  if (pathname.startsWith("/toolkit")) return "AI Teacher's Toolkit";
  if (pathname.startsWith("/library")) return "My Library";
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.includes("/create")) return "Assignment / Create New";
  if (pathname !== "/assignments") return "Assignment / Preview";
  return "Assignment";
}

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

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
        <div className="relative">
        <button
          type="button"
          onClick={() => setUserOpen((value) => !value)}
          className="flex items-center gap-2 rounded-full border border-line bg-neutral-50 py-1 pl-1 pr-3 outline-none transition hover:bg-neutral-100 focus:ring-2 focus:ring-ink/10"
          aria-label="Open user menu"
          aria-expanded={userOpen}
        >
          <div className="grid h-8 w-8 place-items-center rounded-full bg-ink text-[11px] font-black text-white">JD</div>
          <span className="text-sm font-semibold">{SCHOOL_PROFILE.userName}</span>
          <ChevronDown className="h-4 w-4 text-neutral-500" />
        </button>
        {userOpen ? (
          <div className="absolute right-0 top-11 w-52 rounded-2xl border border-line bg-white p-2 text-sm shadow-soft">
            <p className="rounded-xl px-3 py-2 font-semibold">{SCHOOL_PROFILE.name}</p>
            <button
              type="button"
              disabled
              title="Profile settings coming soon"
              className="w-full cursor-not-allowed rounded-xl px-3 py-2 text-left font-semibold text-neutral-400"
            >
              Profile settings
            </button>
          </div>
        ) : null}
        </div>
      </div>
    </div>
  );
}
