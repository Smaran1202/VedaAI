"use client";

import { Bell, Menu, X } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { canCreateAssignments } from "@/lib/roles";
import type { UserRole } from "@/types";

function menuItemsForRole(role?: UserRole | null) {
  if (role === "student") {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/assignments", label: "My Assignments" },
      { href: "/library", label: "Results" },
      { href: "/settings", label: "Settings" }
    ];
  }

  if (role === "admin") {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/groups", label: "Users" },
      { href: "/toolkit", label: "Analytics" },
      { href: "/settings", label: "Settings" }
    ];
  }

  return [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/assignments", label: "Assignments" },
    { href: "/toolkit", label: "Analytics" },
    { href: "/settings", label: "Settings" }
  ];
}

export function MobileHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const { role } = useCurrentUser();
  const menuItems = menuItemsForRole(role);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line/70 bg-paper/95 px-4 backdrop-blur md:px-6 lg:hidden">
      <Link href="/assignments" className="rounded-lg text-xl font-black tracking-tight outline-none focus:ring-2 focus:ring-ink/10">
        VedaAI
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setNoticeOpen((value) => !value)}
          className="icon-button"
          aria-label="Notifications"
          aria-expanded={noticeOpen}
        >
          <Bell className="h-4 w-4" />
        </button>
        <UserButton afterSignOutUrl="/" />
        <button
          type="button"
          onClick={() => setMenuOpen((value) => !value)}
          className="icon-button"
          aria-label="Menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>
      {noticeOpen ? (
        <div className="absolute right-14 top-14 w-56 rounded-2xl border border-line bg-white p-3 text-sm font-semibold shadow-soft">
          No new notifications.
        </div>
      ) : null}
      {menuOpen ? (
        <div className="absolute inset-x-4 top-14 rounded-2xl border border-line bg-white p-2 text-sm shadow-soft">
          {canCreateAssignments(role) ? (
            <Link onClick={() => setMenuOpen(false)} href="/assignments/create" className="block rounded-xl px-3 py-2 font-semibold hover:bg-neutral-50">
              Create Assignment
            </Link>
          ) : null}
          {menuItems.map((item) => (
            <Link
              key={item.href}
              onClick={() => setMenuOpen(false)}
              href={item.href}
              className="block rounded-xl px-3 py-2 font-semibold hover:bg-neutral-50"
            >
              {item.label}
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
